// Interface representing a Quiz entity
export interface Quiz {
  id: number; // Unique identifier for the quiz
  title: string; // Title of the quiz
  description: string; // Description of the quiz
  time: string; // Duration of the quiz (in string format)
  questions: Question[]; // List of questions in the quiz
}

// Enum representing the types of questions
export enum QuestionType {
  MCQ = 'MCQ', // Multiple Choice Question
  SINGLE = 'SINGLE', // Single Answer Question
  TEXT = 'TEXT' // Text-based Question
}

// Interface representing a Question entity
export interface Question {
  id: number; // Unique identifier for the question
  questionText: string; // Text of the question
  type: QuestionType; // Type of the question (MCQ, SINGLE, TEXT)
  options: Option[]; // List of options for the question
  correctAnswer?: string; // Correct answer for the question (optional)
  quiz?: Quiz; // Reference to the parent quiz (optional)
}

// Interface representing an Option entity
export interface Option {
  id: number; // Unique identifier for the option
  answerText: string; // Text of the answer option
  isCorrect: boolean; // Indicates if the option is correct
}
