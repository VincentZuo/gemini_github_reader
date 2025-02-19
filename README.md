
# GitHub Code Analyzer

A web application that analyzes GitHub repositories using Google's Gemini AI. This tool allows you to select specific files from a repository and ask questions about the codebase.

## Prerequisites

Before you begin, ensure you have:
- Node.js (v14 or higher) installed
- A GitHub Personal Access Token ([Create one here](https://github.com/settings/tokens))
- A Google Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd github-code-analyzer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```plaintext
GITHUB_TOKEN=your_github_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

## Running the Application

1. Start both the frontend and backend servers:
```bash
npm run dev
```

This will start:
- Frontend server at http://localhost:3000
- Backend server at http://localhost:3001

## Using the Application

1. Enter a GitHub repository URL (e.g., https://github.com/username/repository)
2. Click "Fetch Files" to load the repository's files
3. Select the files you want to analyze
4. (Optional) Enter a specific question about the code
5. Click "Analyze Selected Files" to get the AI analysis

## Features

- Browse repository files
- Select specific files for analysis
- Ask custom questions about the code
- Get AI-powered code analysis
- Support for multiple programming languages

## Troubleshooting

If you encounter any issues:

1. Ensure all environment variables are set correctly
2. Check that both servers are running (frontend and backend)
3. Verify your GitHub token has the necessary permissions
4. Make sure the repository URL is correct and accessible

## Error Messages

- "Failed to fetch files": Check your GitHub token and repository URL
- "Failed to analyze repository": Verify your Gemini API key and try with fewer files

