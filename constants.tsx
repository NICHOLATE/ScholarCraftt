import { Template, DocSection } from './types';
import React from 'react';

export const SOUTH_AFRICAN_LANGUAGES = [
  "English",
  "Afrikaans",
  "isiZulu",
  "isiXhosa",
  "Sepedi",
  "Setswana",
  "Sesotho",
  "Xitsonga",
  "siSwati",
  "Tshivenda",
  "isiNdebele"
];

// --- Prompt Engineering Methodology: Templates ---

export const EDUCATIONAL_TEMPLATES: Template[] = [
  {
    id: 'lesson-plan',
    name: 'Structured Lesson Plan',
    description: 'A comprehensive 60-minute lesson plan with objectives, materials, and timeline.',
    icon: 'BookOpen',
    category: 'Planning',
    sampleTopic: 'The Solar System & Planets',
    promptTemplate: (topic, grade, tone, depth) => `
      Act as an expert curriculum designer. Create a detailed lesson plan for Grade ${grade} students on the topic: "${topic}".
      
      Requirements:
      - Tone: ${tone}
      - Depth: ${depth}
      - Format: Markdown
      
      Structure:
      1. Learning Objectives (SWBAT)
      2. Required Materials
      3. Key Vocabulary
      4. Lesson Outline (Introduction, Direct Instruction, Guided Practice, Independent Practice, Closure) - include timing.
      5. Assessment Check (Formative)
      6. Differentiation Strategies (Support & Extension)
    `
  },
  {
    id: 'study-guide',
    name: 'Exam Study Guide',
    description: 'Key concepts, definitions, and review questions for student preparation.',
    icon: 'FileText',
    category: 'Student',
    sampleTopic: 'Photosynthesis & Cellular Respiration',
    promptTemplate: (topic, grade, tone, depth) => `
      Create a comprehensive study guide for "${topic}" suitable for Grade ${grade} students.
      
      Requirements:
      - Tone: ${tone}
      - Complexity: ${depth}
      - Format: Markdown
      
      Include:
      1. Top 5 Key Concepts (explained simply)
      2. Important Terminology Glossary
      3. Timeline or Key Figures (if applicable, otherwise Key Formulas/Rules)
      4. Common Misconceptions to Avoid
      5. 5 Practice Review Questions with Answer Key at the very bottom.
    `
  },
  {
    id: 'creative-story',
    name: 'Educational Story',
    description: 'A narrative story that teaches the concept through allegory or direct interaction.',
    icon: 'Feather',
    category: 'Creative',
    sampleTopic: 'Gravity and The Apple',
    promptTemplate: (topic, grade, tone, depth) => `
      Write a creative educational story to teach "${topic}" to Grade ${grade} students.
      
      Parameters:
      - Tone: ${tone}
      - Depth: ${depth}
      - Style: Engaging narrative
      
      The story should define the concept clearly within the plot. Include 3 discussion questions at the end to check comprehension.
    `
  },
  {
    id: 'quiz-generator',
    name: 'Multiple Choice Quiz',
    description: 'A 10-question assessment with interactive mode and answer key.',
    icon: 'CheckSquare',
    category: 'Assessment',
    sampleTopic: 'Ancient Rome',
    promptTemplate: (topic, grade, tone, depth) => `
      Generate a 10-question multiple-choice quiz on "${topic}" for Grade ${grade}.
      
      Constraints:
      - Tone: ${tone}
      - Difficulty: ${depth}
      
      Ensure the questions test understanding rather than just rote memorization.
      Provide 4 distinct options for each question.
      Ensure the explanation is clear and educational.
    `
  },
  {
    id: 'analogy-explainer',
    name: 'Real-World Analogy',
    description: 'Explains complex topics using relatable real-world comparisons.',
    icon: 'Lightbulb',
    category: 'Student',
    sampleTopic: 'How the Internet Works',
    promptTemplate: (topic, grade, tone, depth) => `
      Explain the concept of "${topic}" to a Grade ${grade} student using a powerful, extended real-world analogy.
      
      Strategy:
      - Map the abstract concept to a concrete scenario (e.g., a city, a machine, a game).
      - Tone: ${tone}
      - Detail: ${depth}
      
      1. The Analogy
      2. Breaking it Down (Mapping parts of the analogy to the concept)
      3. Limitations of the Analogy (Where does it break down?)
    `
  }
];

export const TECHNICAL_DOCS: DocSection[] = [
  {
    title: 'Prompt Engineering Methodology',
    content: (
      <div className="space-y-6">
        <p>
          ScholarCraft uses a <strong>Role-Task-Constraint (RTC)</strong> framework tailored to the Gemini 2.5 Flash model. 
          Below is the specific strategy for our five core templates:
        </p>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-indigo-600 mb-1">1. Structured Lesson Plan</h4>
            <p className="text-sm text-slate-600">
              <strong>Technique: Chain-of-Thought Sequencing.</strong><br/>
              We force the model to think linearly through a class period. By explicitly requesting "Timing" in the prompt structure, the model allocates tokens to simulate a real 60-minute flow (Intro -> Instruction -> Practice), ensuring no section is skipped.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-indigo-600 mb-1">2. Exam Study Guide</h4>
            <p className="text-sm text-slate-600">
              <strong>Technique: Information Synthesis & Extraction.</strong><br/>
              The prompt directs the model to act as a filter, prioritizing "Key Concepts" and "Misconceptions." This specifically targets the model's reasoning capabilities to distinguish between <i>core knowledge</i> and <i>fluff</i>.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-indigo-600 mb-1">3. Creative Story</h4>
            <p className="text-sm text-slate-600">
              <strong>Technique: Metaphorical Mapping.</strong><br/>
              We utilize Gemini's high creativity temperature (0.7-0.9) for this task. The prompt creates a constraint where the "Narrative" must serve the "Definition," forcing the AI to weave educational facts into plot points rather than appending them as a lecture.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-indigo-600 mb-1">4. Interactive Quiz</h4>
            <p className="text-sm text-slate-600">
              <strong>Technique: Structured Output Enforcement.</strong><br/>
              Unlike other prompts, the Quiz generator enforces a JSON Schema. This "Code-First" approach guarantees that every question has exactly 4 options and a valid index for the correct answer, preventing parsing errors in the React frontend.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-indigo-600 mb-1">5. Real-World Analogy</h4>
            <p className="text-sm text-slate-600">
              <strong>Technique: Zero-Shot Relational Mapping.</strong><br/>
              The prompt explicitly asks for "Limitations of the Analogy." This is a self-correction mechanism. It forces the model to critique its own comparison, ensuring students understand that the analogy is a learning tool, not a perfect representation of reality.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Architecture & Implementation',
    content: (
      <div className="space-y-4">
        <p>
          ScholarCraft AI is built as a single-page application (SPA) using <strong>React 18</strong> and <strong>TypeScript</strong>. 
          The UI is styled with <strong>Tailwind CSS</strong>, adhering to a mobile-first responsive design system.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>Frontend:</strong> React, Vite-compatible structure, Lucide Icons.</li>
          <li><strong>State Management:</strong> React Hooks (useState, useReducer) for local state and history tracking.</li>
          <li><strong>AI Integration:</strong> Direct client-side integration with Google's <code className="bg-slate-100 px-1 rounded text-indigo-600 border border-slate-200">@google/genai</code> SDK using the <code>gemini-2.5-flash</code> model.</li>
          <li><strong>Security:</strong> API keys are processed via environment variables. Input sanitization is handled via React's controlled components.</li>
        </ul>
      </div>
    )
  },
  {
    title: 'API Selection Rationale',
    content: (
      <div className="space-y-4">
        <p>
          We selected the <strong>Gemini 2.5 Flash</strong> model for this educational tool.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-blue-600 mb-2">Speed & Latency</h4>
            <p className="text-sm text-slate-600">Flash is optimized for high-frequency, low-latency tasks, essential for an interactive tool where teachers need quick lesson plan iterations.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-emerald-600 mb-2">Cost Efficiency</h4>
            <p className="text-sm text-slate-600">Educational institutions often have limited budgets. Flash provides the best cost-to-performance ratio for text generation tasks.</p>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-purple-600 mb-2">Context Window</h4>
            <p className="text-sm text-slate-600">Sufficient context window to handle complex educational standards and long-form curriculum output without truncation.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Performance & Optimization',
    content: (
      <div className="space-y-4">
        <p>
          To ensure a seamless user experience, we track generation time and token usage.
        </p>
        <ul className="list-disc pl-5 space-y-2 text-slate-600">
          <li><strong>React.memo:</strong> Heavy text rendering components are memoized to prevent unnecessary re-renders during typing.</li>
          <li><strong>Asynchronous State:</strong> UI remains responsive during API calls using robust loading states and error boundaries.</li>
          <li><strong>Token Estimation:</strong> Client-side heuristic (approx 4 chars/token) allows for immediate feedback without extra API overhead.</li>
        </ul>
      </div>
    )
  }
];

export const SAMPLE_OUTPUTS = [
  {
    id: 'lesson-plan',
    title: "Structured Lesson Plan",
    desc: "A complete roadmap for teachers including timing and objectives.",
    snippet: `**Lesson Plan: Photosynthesis (Grade 7)**\n\n**1. Learning Objectives**\n- Students will define photosynthesis and its inputs/outputs.\n- Students will label the parts of a chloroplast.\n\n**2. Materials**\n- Elodea plants, beakers, light source.\n\n**3. Procedure (60 min)**\n- **Introduction (10m):** "How do plants eat?" discussion.\n- **Activity (30m):** Lab - Observing oxygen bubbles.\n- **Assessment:** Exit ticket diagram.`
  },
  {
    id: 'study-guide',
    title: "Exam Study Guide",
    desc: "Summarized concepts and definitions for revision.",
    snippet: `**Study Guide: Linear Equations**\n\n**Key Concepts**\n- **Slope (m):** The steepness of a line (Rise/Run).\n- **Y-Intercept (b):** Where the line crosses the y-axis.\n\n**Common Mistakes**\n- Forgetting to flip the inequality sign when dividing by a negative.\n\n**Practice Question:**\nFind the slope of the line passing through (2, 4) and (4, 8).\n*Answer: 2*`
  },
  {
    id: 'creative-story',
    title: "Educational Narrative",
    desc: "Story-based learning to engage younger students.",
    snippet: `**The Kingdom of Grammar**\n\nOnce upon a time in the land of Sentencia, King Noun sat on his throne. He was very important, but he couldn't do anything without his best friend, General Verb. "Run!" shouted the General, and the King ran. \n\nOne day, a colorful wizard named Adjective arrived. "I can make you a *fast* runner," he whispered.`
  },
  {
    id: 'quiz-generator',
    title: "Interactive Quiz",
    desc: "Multiple choice questions with automated answer keys.",
    snippet: `**Question 1:** What is the powerhouse of the cell?\nA) Nucleus\nB) Mitochondria\nC) Ribosome\nD) Cytoplasm\n\n**Correct Answer:** B) Mitochondria. It generates most of the chemical energy needed to power the cell's biochemical reactions.`
  },
  {
    id: 'analogy-explainer',
    title: "Real-World Analogy",
    desc: "Complex topics mapped to simple, relatable scenarios.",
    snippet: `**Concept:** Computer Memory (RAM) vs. Storage (Hard Drive)\n\n**The Analogy:** The Kitchen.\n- **Hard Drive:** This is the *Pantry*. It holds all the ingredients (files) you have, even when you aren't cooking. It's big but slow to access.\n- **RAM:** This is the *Countertop*. You only put the ingredients you are currently using here. It's small but very fast to reach.`
  }
];