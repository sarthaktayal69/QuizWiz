// server.js
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to handle text input
app.post('/api/submit-text', upload.none(), async (req, res) => {
    
    const { text, difficulty, numQuestions } = req.body;

    try {
        const prompt = `${text}
        You are an expert in generating MCQ type quiz on the basis of provided content.
        Based on the above text, create a quiz of ${numQuestions} MCQ questions with 4 options for each keeping difficulty level as ${difficulty}.
        Make sure the questions are not repeated.
        Format the response as follows:
        [
            {
              text: "MCQ Question 1",
              options: ["option 1", "option 2", "option 3", "option 4"],
              correctOption: "correct ans"
            },
            ...
        ];
        `;

        const result = await model.generateContent(prompt);
        res.json(result.response.text());
    } catch (error) {
        console.log("Error is ", error.message)
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to handle file upload and text input
app.post('/api/submit-file', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const { difficulty, numQuestions } = req.body;


    try {
        const fileResult = await fileManager.uploadFile(filePath, {
            mimeType: req.file.mimetype,
            displayName: req.file.originalname,
        });
        console.log(`Uploaded file ${fileResult.file.displayName} as: ${fileResult.file.uri}`);

        const fileUri = fileResult.file.uri;
        const prompt = `
        You are an expert in generating MCQ type quiz on the basis of provided content.
        Based on this submitted file, create a quiz of ${numQuestions} MCQ questions with 4 options for each keeping difficulty level as ${difficulty}.
        Make sure the questions are not repeated.
    Format the response as follows:
    [
        {
          text: "MCQ Question 1",
          options: ["option 1", "option 2", "option 3", "option 4"],
          correctOption: "correct ans"
        },
        ...
    ]`;

        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: req.file.mimetype,
                    fileUri: fileUri
                }
            },
            { text: prompt }
        ]);

        fs.unlinkSync(filePath);


        res.json(result.response.text());
        console.log("Ai response is: ", result.response.text())
    } catch (error) {
        console.log("Error is ", error.message)
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to handle both text and file inputs
app.post('/api/submit-mixed', upload.single('file'), async (req, res) => {
    const { text, difficulty, numQuestions } = req.body;
    const filePath = req.file.path;

    try {

        const fileResult = await fileManager.uploadFile(filePath, {
            mimeType: req.file.mimetype,
            displayName: req.file.originalname,
        });
        console.log(`Uploaded file ${fileResult.file.displayName} as: ${fileResult.file.uri}`);
        const fileUri = fileResult.file.uri;

        const prompt = `
            You are an expert in generating MCQ type quiz on the basis of provided content.
            Based on this submitted file along with following text block, create a quiz of ${numQuestions} MCQ questions with 4 options for each keeping difficulty level as ${difficulty}.
            text block: ${text}.
        Format the response as follows:
        [
            {
              text: "MCQ Question 1",
              options: ["option 1", "option 2", "option 3", "option 4"],
              correctOption: "correct ans"
            },
            ...
        ]`;
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: req.file.mimetype,
                    fileUri: fileUri
                }
            },
            { text: prompt }
        ]);

        // Clean up uploaded file
        // fs.unlinkSync(filePath);


        res.json(result.response.text());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
