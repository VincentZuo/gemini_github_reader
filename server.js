const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getRepoContents(owner, repo) {
  try {
    // Try main branch first
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`,
      {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        },
      }
    );
    return response.data.tree;
  } catch (error) {
    if (error.response?.status === 404) {
      // If main branch not found, try master branch
      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`,
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json'
          },
        }
      );
      return response.data.tree;
    }
    throw error;
  }
}

async function getFileContent(owner, repo, path) {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    }
  );
  return Buffer.from(response.data.content, 'base64').toString();
}

// Add new endpoint to fetch files
app.get('/api/files', async (req, res) => {
  try {
    const repoUrl = req.query.repo;
    console.log('Received request for repo:', repoUrl);
    
    // Extract owner and repo from URL more robustly
    const urlParts = repoUrl.split('github.com/')[1].split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];
    
    console.log('Fetching files for:', { owner, repo });

    const contents = await getRepoContents(owner, repo);
    console.log('Got contents:', contents);
    
    const files = contents.filter(item => 
      item.type === 'blob' && 
      /\.(js|ts|py|java|cpp|rb|go|rs|php)$/.test(item.path)
    );
    console.log('Filtered files:', files);

    res.json({ files });
  } catch (error) {
    console.error('Detailed error:', error);
    console.error('Response data:', error.response?.data);
    res.status(500).json({ 
      error: 'Failed to fetch repository files',
      details: error.message,
      response: error.response?.data
    });
  }
});

// Update analyze endpoint to handle POST requests
app.post('/api/analyze', async (req, res) => {
  try {
    const { repo, files, question } = req.body;
    const [owner, repoName] = repo.split('/').slice(-2);
    
    // Get content of selected files
    const fileContents = await Promise.all(
      files.map(async path => {
        const content = await getFileContent(owner, repoName, path);
        return `File: ${path}\n\n${content}`;
      })
    );

    // Analyze with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = question 
      ? `Analyze the following code files and answer this specific question: ${question}\n\n${fileContents.join('\n\n')}`
      : `Analyze the following code files and provide insights about:
        1. Overall architecture
        2. Main functionalities
        3. Potential improvements
        4. Code quality
        
        ${fileContents.join('\n\n')}`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.json({ analysis });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to analyze repository' });
  }
});

const startServer = () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer(); 