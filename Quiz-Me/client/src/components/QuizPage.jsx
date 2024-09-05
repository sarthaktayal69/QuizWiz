import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './QuizPage.css';

function QuizPage() {

  // const mockQuestions = [
  //   {
  //     text: "What is the capital of France?",
  //     options: ["Paris", "London", "Berlin", "Madrid"],
  //     correctOption: "Paris"
  //   },
  //   {
  //     text: "Which planet is known as the Red Planet?",
  //     options: ["Earth", "Mars", "Jupiter", "Saturn"],
  //     correctOption: "Mars"
  //   },
  //   {
  //     text: "Which planet is known as the Green Planet?",
  //     options: ["Earth", "Mars", "Jupiter", "Saturn"],
  //     correctOption: "Earth"
  //   },
  //   {
  //     text: "Which planet is known as the Yellow Planet?",
  //     options: ["Earth", "Mars", "Jupiter", "Saturn"],
  //     correctOption: "Jupiter"
  //   },
  //   {
  //     text: "Which planet is known as the Blue Planet?",
  //     options: ["Earth", "Mars", "Jupiter", "Saturn"],
  //     correctOption: "Saturn"
  //   }
  // ];


  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);



  useEffect(() => {
    if (!questions || questions.length === 0) {
        navigate('/', {replace: true});
    }
}, [navigate, questions]);

if (!questions) {
  return null;
}


  const handleOptionClick = (option) => {
    if (selectedOption) return; // prevent multiple selections
    setSelectedOption(option);
    const correctOption = questions[currentQuestionIndex].correctOption;
    setFeedback(option === correctOption ? 'correct' : 'incorrect');
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setFeedback(null);
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="quiz-container">
      <h1>Quiz</h1>
      <div>
        <p className="question">{currentQuestion.text}</p>
        <ul>
          {currentQuestion.options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              className={
                selectedOption === option
                  ? feedback === 'correct'
                    ? 'correct'
                    : 'incorrect'
                  : ''
              }
            >
              {option}
            </li>
          ))}
        </ul>
        {feedback && <p className="feedback">{feedback === 'correct' ? 'Correct!' : `Wrong! The correct answer is ${currentQuestion.correctOption}`}</p>}
        <div className="button-container">
          {!isLastQuestion && (
            <button onClick={handleNextQuestion}>Next Question</button>
          )}
          {isLastQuestion && <button onClick={() => window.location.href = '/'}>Finish</button>}
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
