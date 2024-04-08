import React, { useState, useEffect } from 'react';
import { Button } from './button';

interface QuestionButtonsProps {
  onQuestionClick: (question: string) => void;
  onButtonsHidden: () => void;
}

const exampleQuestions = [
  'What sets Grey Haven apart from other AI consulting and development firms?',
  'What industries or sectors do you have experience working with?',
  'I want to apply AI in my organization. What is the best way to get started?',
  'Which ship do I take to Valinor?',
];

export const QuestionButtons: React.FC<QuestionButtonsProps> = ({ onQuestionClick, onButtonsHidden }) => {
  const [showButtons, setShowButtons] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleQuestionClick = (question: string) => {
    const inputField = document.querySelector('input[name="message"]') as HTMLInputElement;
    if (inputField && inputField.value.trim() !== '') {
      // User has already entered text, do not overwrite
      return;
    }

    onQuestionClick(question);
    setShowButtons(false);
    onButtonsHidden();

    // Trigger form submission after a short delay
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100); // Adjust the delay as needed
  };

  if (!showButtons) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-4 sm:mx-auto">
      {exampleQuestions.slice(0, viewportWidth >= 768 ? 4 : 2).map((question, index) => (
        <Button
          key={index}
          onClick={() => handleQuestionClick(question)}
          variant="outline"
          className="text-left whitespace-normal max-w-xs p-4 text-sm min-h-[6rem] mx-auto w-full"
        >
          {question}
        </Button>
      ))}
    </div>
  );
};