import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Mic, MicOff, Volume2, Activity, Radio, PlayCircle, StopCircle, AlertCircle } from 'lucide-react';

// --- Audio Encoding / Decoding Utilities ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Component ---

const LiveVoiceView: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model speaking
  const [micActive, setMicActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Refs for Audio Contexts and cleanup
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sessionRef = useRef<any>(null); // To hold the live session object
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const disconnect = () => {
    // Cleanup Audio Sources
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    audioSourcesRef.current.clear();

    // Cleanup Input
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
        outputContextRef.current.close();
        outputContextRef.current = null;
    }
    
    // Close Session
    if (sessionRef.current) {
      // session.close() might not be available depending on SDK version or it might be async
      // Assuming implicit close on disconnect or let garbage collection handle it 
      // based on typical WebSocket behavior, but SDK usually has a close method.
      // The provided SDK documentation code uses `session.close()` in generic terms,
      // but `ai.live.connect` returns a Promise<Session>.
      // We will rely on simple state reset for now as strict close isn't in the snippet provided.
      sessionRef.current = null;
    }

    setIsConnected(false);
    setMicActive(false);
    setIsSpeaking(false);
    setStatus('disconnected');
    nextStartTimeRef.current = 0;
  };

  const connect = async () => {
    setStatus('connecting');
    setErrorMessage(null);

    try {
      // 1. Initialize Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputContextRef.current = inputCtx;
      outputContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination); // Connect to speakers

      // 2. Get Microphone Stream
      let stream;
      try {
         if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
           throw new Error("getUserMedia is not supported in this browser or context.");
         }
         stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micError: any) {
         let msg = "Could not access microphone.";
         if (micError.name === 'NotFoundError' || micError.message?.includes('device not found')) {
            msg = "No microphone found. Please connect an audio input device.";
         } else if (micError.name === 'NotAllowedError' || micError.name === 'PermissionDeniedError') {
            msg = "Microphone permission denied. Please allow access in browser settings.";
         }
         setErrorMessage(msg);
         throw micError;
      }
      
      streamRef.current = stream;

      // 3. Setup GenAI Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "You are a friendly and helpful tutor named Scholar. Keep responses concise and conversational.",
        },
        callbacks: {
          onopen: () => {
            console.log("Live Session Opened");
            setStatus('connected');
            setIsConnected(true);
            setMicActive(true);

            // Start Audio Stream Input Logic
            const source = inputCtx.createMediaStreamSource(stream);
            sourceRef.current = source;
            
            // Using ScriptProcessor as per SDK examples (AudioWorklet is better but more complex to setup in a single file React component)
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              // Send Input
              sessionPromise.then((session) => {
                 session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
               setIsSpeaking(true);
               
               // Ensure output context is running (browsers sometimes suspend it)
               if (outputCtx.state === 'suspended') {
                 await outputCtx.resume();
               }

               nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
               
               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 outputCtx,
                 24000,
                 1
               );

               const source = outputCtx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               
               source.addEventListener('ended', () => {
                 audioSourcesRef.current.delete(source);
                 if (audioSourcesRef.current.size === 0) {
                   setIsSpeaking(false);
                 }
               });

               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               audioSourcesRef.current.add(source);
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
               audioSourcesRef.current.forEach(s => s.stop());
               audioSourcesRef.current.clear();
               nextStartTimeRef.current = 0;
               setIsSpeaking(false);
            }
          },
          onerror: (err) => {
            console.error("Live Session Error", err);
            setStatus('error');
            setErrorMessage("Connection to Gemini Live service failed.");
            disconnect();
          },
          onclose: () => {
            console.log("Live Session Closed");
            disconnect();
          }
        }
      });
      
      // Store session logic if needed later
      sessionRef.current = sessionPromise;

    } catch (e: any) {
      console.error("Connection Failed", e);
      setStatus('error');
      // If we haven't already set a specific mic error
      if (!errorMessage) {
         setErrorMessage(e.message || "An unexpected error occurred.");
      }
      disconnect();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto w-full animate-fade-in">
       <header className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Live Tutor</h2>
        <p className="text-slate-500">Real-time voice conversation for language practice or quick Q&A.</p>
      </header>

      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden flex flex-col items-center justify-center p-8 relative">
          
          {/* Visualizer Circle */}
          <div className="relative mb-12">
             {/* Ripple Effects when speaking */}
             {isSpeaking && (
               <>
                 <div className="absolute inset-0 bg-indigo-400 rounded-full opacity-20 animate-ping"></div>
                 <div className="absolute -inset-4 bg-indigo-300 rounded-full opacity-10 animate-pulse"></div>
               </>
             )}
             
             {/* Main Circle */}
             <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 border-4 shadow-2xl z-10 ${
               status === 'connected' 
                 ? isSpeaking 
                   ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-200 scale-110' 
                   : 'bg-indigo-600 border-indigo-100'
                 : status === 'connecting'
                   ? 'bg-amber-400 border-amber-200 animate-pulse'
                   : status === 'error'
                     ? 'bg-red-500 border-red-200'
                     : 'bg-slate-200 border-slate-100'
             }`}>
                {status === 'connected' ? (
                   isSpeaking ? <Volume2 size={64} className="text-white animate-bounce-slow" /> : <Mic size={64} className="text-white" />
                ) : status === 'connecting' ? (
                   <Activity size={64} className="text-white animate-spin" />
                ) : status === 'error' ? (
                   <MicOff size={64} className="text-white" />
                ) : (
                   <MicOff size={64} className="text-slate-400" />
                )}
             </div>
          </div>

          {/* Status Text */}
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            {status === 'disconnected' && "Ready to Start"}
            {status === 'connecting' && "Connecting..."}
            {status === 'connected' && (isSpeaking ? "Tutor is speaking..." : "Listening...")}
            {status === 'error' && "Connection Error"}
          </h3>
          
          <p className="text-slate-500 mb-6 text-center max-w-md">
            {status === 'disconnected' ? "Click connect to start a real-time voice session with the Gemini Live API." : 
             status === 'connected' ? "Go ahead, ask me anything! I can hear you." :
             "Please check your microphone permissions and try again."}
          </p>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-8 flex items-center gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium animate-fade-in max-w-md">
                <AlertCircle size={18} className="shrink-0" />
                {errorMessage}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-6">
             {!isConnected ? (
                <button 
                  onClick={connect}
                  className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95"
                >
                   <PlayCircle size={24} /> Connect Live
                </button>
             ) : (
                <button 
                  onClick={disconnect}
                  className="flex items-center gap-3 px-8 py-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-full font-bold text-lg transition-all"
                >
                   <StopCircle size={24} /> End Session
                </button>
             )}
          </div>

          {/* Live Indicator */}
          {isConnected && (
            <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100 animate-pulse">
               <Radio size={12} /> LIVE
            </div>
          )}
      </div>
    </div>
  );
};

export default LiveVoiceView;