import { GoogleGenAI, Type } from "@google/genai";
import { GenerationConfig, Template, QuizQuestion } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }
  return new GoogleGenAI({ apiKey });
};

interface ServiceResponse {
  content: string;
  imageUrl?: string;
  quizData?: QuizQuestion[];
}

// Helper to convert Quiz JSON to Markdown for consistency with other templates
const convertQuizToMarkdown = (quizData: QuizQuestion[], topic: string): string => {
  let md = `# ${topic} - Quiz\n\n`;
  
  quizData.forEach((q, index) => {
    md += `### Question ${index + 1}\n${q.question}\n\n`;
    q.options.forEach((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      md += `- **${letter})** ${opt}\n`;
    });
    md += `\n`;
  });

  md += `\n---\n### Answer Key\n\n`;
  quizData.forEach((q, index) => {
    md += `**${index + 1}. ${q.correctAnswer}**\n*Explanation: ${q.explanation}*\n\n`;
  });

  return md;
};

export const generateContent = async (
  config: GenerationConfig,
  template: Template
): Promise<ServiceResponse> => {
  const ai = getClient();
  
  // 1. Prepare Prompt
  const promptText = template.promptTemplate(
    config.topic,
    config.gradeLevel,
    config.tone,
    config.depth
  );

  const languageInstruction = config.language 
    ? `IMPORTANT: OUTPUT LANGUAGE. The user has requested content in ${config.language}. Ensure all educational content, headings, and explanations are written fluent, grammatically correct ${config.language}.`
    : "";

  let systemInstruction = `You are ScholarCraft, a specialized educational content generation tool. Your goal is to produce high-quality, accurate, and pedagogically sound materials. ${languageInstruction}`;

  // 2. Configure request based on template type
  let modelParams: any = {
    model: 'gemini-2.5-flash',
    contents: promptText,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topK: 40,
    }
  };

  // Special handling for Quiz: Use Structured Output
  if (template.id === 'quiz-generator') {
    modelParams.config.responseMimeType = "application/json";
    // Add specific instruction for JSON structure vs Content Language
    modelParams.config.systemInstruction += ` When generating the JSON output, keep the keys (question, options, correctAnswer, explanation) in English, but ensure the VALUES (the actual text displayed to students) are in ${config.language || 'English'}.`;
    
    modelParams.config.responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswer: { type: Type.STRING },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
      }
    };
  } else {
    // Default instruction for text-only templates
    modelParams.config.systemInstruction += " Always format output in clean, readable Markdown.";
  }

  // 3. Prepare Image Prompt
  // We keep the image prompt in English as the image generation model understands English best for prompt instructions
  const imagePrompt = `Create a high-quality, educational illustration representing "${config.topic}". 
  Context: This image will accompany a ${template.name} for ${config.gradeLevel} students.
  Style: Clear, visually engaging, suitable for an educational textbook or presentation. No text in the image.`;

  try {
    // Execute requests
    const [textResponse, imageResponse] = await Promise.allSettled([
      ai.models.generateContent(modelParams),
      ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: {
          imageConfig: {
            aspectRatio: "16:9"
          }
        }
      })
    ]);

    // Handle Text/Quiz Result
    let content = "";
    let quizData: QuizQuestion[] | undefined = undefined;

    if (textResponse.status === 'fulfilled' && textResponse.value.text) {
      if (template.id === 'quiz-generator') {
        try {
          const rawText = textResponse.value.text;
          
          // Robust JSON extraction: Find the outer brackets []
          const firstBracket = rawText.indexOf('[');
          const lastBracket = rawText.lastIndexOf(']');
          
          let jsonString = rawText;
          if (firstBracket !== -1 && lastBracket !== -1) {
            jsonString = rawText.substring(firstBracket, lastBracket + 1);
          } else {
            // Fallback cleanup
            jsonString = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          }
          
          quizData = JSON.parse(jsonString);
          
          // Auto-generate Markdown content from the structured data for standard view
          if (quizData) {
            content = convertQuizToMarkdown(quizData, config.topic);
          }
        } catch (e) {
          console.error("Failed to parse quiz JSON", e);
          content = textResponse.value.text; // Fallback to raw text
        }
      } else {
        content = textResponse.value.text;
      }
    } else {
      throw new Error("Failed to generate text content.");
    }

    // Handle Image Result
    let imageUrl: string | undefined = undefined;
    if (imageResponse.status === 'fulfilled') {
      const parts = imageResponse.value.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break; 
        }
      }
    }

    return { content, imageUrl, quizData };

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Failed to generate content");
  }
};