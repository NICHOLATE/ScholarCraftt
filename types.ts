import React from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  promptTemplate: (topic: string, grade: string, tone: string, depth: string) => string;
  category: 'Planning' | 'Student' | 'Assessment' | 'Creative';
  sampleTopic: string;
}

export interface GenerationConfig {
  topic: string;
  gradeLevel: string;
  tone: string;
  depth: string;
  templateId: string;
  language?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GenerationResult {
  id: string;
  timestamp: number;
  config: GenerationConfig;
  content: string;
  imageUrl?: string;
  quizData?: QuizQuestion[];
  durationMs: number;
  estimatedTokens: number;
}

export interface NavItem {
  id: 'generator' | 'history' | 'docs' | 'templates' | 'chat';
  label: string;
  icon: any;
}

export interface DocSection {
  title: string;
  content: string | React.ReactNode;
}