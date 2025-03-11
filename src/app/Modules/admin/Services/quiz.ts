export interface Quiz {
  id: number;
  title: string;
  description: string;
  time: string;
  questions: Question[];
}

export enum QuestionType {
  MCQ = 'MCQ',
  SINGLE = 'SINGLE',
  TEXT = 'TEXT'
}

export interface Question {
  id: number;
  questionText: string;  // This is the model field name
  type: QuestionType;
  options: Option[];
  correctAnswer?: string;
  quiz?: any;
}

export interface Option {
  id: number;
  answerText: string;
  isCorrect: boolean;
}
