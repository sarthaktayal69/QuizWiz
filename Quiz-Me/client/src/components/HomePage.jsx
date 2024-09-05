import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

import './HomePage.css';

function HomePage() {
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [difficulty, setDifficulty] = useState('medium');
    const [numQuestions, setNumQuestions] = useState(5);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const handleSubmit = async () => {
        console.log("text is ", text);
        console.log("file is ", file);
        console.log("dif is ", difficulty);
        console.log("numq is ", numQuestions);
        const formData = new FormData();
        if (file) formData.append('file', file);
        if (text) formData.append('text', text);
        formData.append('difficulty', difficulty);
        formData.append('numQuestions', numQuestions);

        setLoading(true);

        try {
            const endpoint = file && text ? 'http://localhost:5000/api/submit-mixed' : (file ? 'http://localhost:5000/api/submit-file' : 'http://localhost:5000/api/submit-text');

            console.log("Endpoint is ", endpoint);
            const response = await axios.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setLoading(false);
            // Redirect or update state to show quiz page
            navigate('/quiz', { state: { questions: JSON.parse(response.data) } });
        } catch (error) {
            setLoading(false)
            console.error(error);
        }
    };

    return (
        <div className="home-container">
            <h1>Welcome to the Quiz App</h1>
            <p>
                Paste your text or upload a PDF file, select the difficulty level,
                and choose the number of questions you want. Click 'Submit' to generate
                quiz questions and start testing your knowledge.
            </p>
            <textarea value={text} onChange={handleTextChange} placeholder="Enter your text here..." />
            <p>OR</p>
            <input type="file" onChange={handleFileChange} accept=".pdf" />
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
            </select>
            <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                min="1"
                placeholder="Number of questions"
            />
            <button onClick={handleSubmit} disabled={!file && !text}>Submit</button>
            {loading && <Loader />}
        </div>
    );
}

export default HomePage;
