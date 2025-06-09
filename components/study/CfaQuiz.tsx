
import React, { useState } from 'react';
import { CFAQuestion } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CfaQuizProps {
  questions: CFAQuestion[];
  onQuizComplete: (score: number, totalQuestions: number) => void;
}

const CfaQuiz: React.FC<CfaQuizProps> = ({ questions, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) {
    return <p>No questions available for this quiz.</p>;
  }

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    let score = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    onQuizComplete(score, questions.length);
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (showResults) {
    let score = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        score++;
      }
    });
    return (
      <Card title="Quiz Results">
        <p className="text-xl text-center mb-4">You scored {score} out of {questions.length}!</p>
        {questions.map((q, index) => (
          <div key={q.id} className={`p-3 my-2 rounded-lg border ${selectedAnswers[index] === q.correctAnswer ? 'bg-green-100 dark:bg-green-900 border-green-500' : 'bg-red-100 dark:bg-red-900 border-red-500'}`}>
            <p className="font-semibold">{index + 1}. {q.question}</p>
            <p className="text-sm">Your answer: {selectedAnswers[index] || "Not answered"}</p>
            <p className="text-sm">Correct answer: {q.correctAnswer}</p>
            {q.explanation && <p className="text-xs mt-1 italic">Explanation: {q.explanation}</p>}
          </div>
        ))}
        <Button onClick={() => { setShowResults(false); setCurrentQuestionIndex(0); setSelectedAnswers({}); /* Potentially call onQuizComplete again or a different handler for closing results */ }} className="mt-4 w-full">
          Close Results
        </Button>
      </Card>
    );
  }


  return (
    <div className="p-2">
      <h4 className="text-lg font-semibold mb-1">Question {currentQuestionIndex + 1} of {questions.length}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Topic: {currentQuestion.topic}</p>
      <p className="mb-4 text-light-text dark:text-dark-text">{currentQuestion.question}</p>
      <div className="space-y-2 mb-6">
        {currentQuestion.options.map((option, index) => (
          <Button
            key={index}
            variant={selectedAnswers[currentQuestionIndex] === option ? 'primary' : 'ghost'}
            onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
            className="w-full text-left justify-start"
          >
            {option}
          </Button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button 
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          variant="ghost"
        >
          Previous
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmitQuiz} variant="secondary">
            Submit Quiz
          </Button>
        )}
      </div>
    </div>
  );
};

export default CfaQuiz;
