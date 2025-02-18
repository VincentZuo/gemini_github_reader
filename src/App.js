import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [question, setQuestion] = useState('');

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/files?repo=${encodeURIComponent(repoUrl)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || 'Failed to fetch files');
      }
      
      setFiles(data.files);
      setSelectedFiles(data.files.map(f => f.path));
    } catch (error) {
      console.error('Error details:', error);
      alert(`Error fetching files: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeRepo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo: repoUrl,
          files: selectedFiles,
          question: question || undefined,
        }),
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing repo:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (path) => {
    setSelectedFiles(prev => 
      prev.includes(path)
        ? prev.filter(f => f !== path)
        : [...prev, path]
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GitHub Code Analyzer</h1>
        <div className="input-container">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter GitHub repository URL"
          />
          <button onClick={fetchFiles} disabled={loading}>
            Fetch Files
          </button>
        </div>

        {files.length > 0 && (
          <div className="files-container">
            <h3>Select Files to Analyze:</h3>
            <div className="files-list">
              {files.map((file) => (
                <label key={file.path} className="file-item">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.path)}
                    onChange={() => toggleFile(file.path)}
                  />
                  {file.path}
                </label>
              ))}
            </div>
            
            <div className="question-container">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a specific question about the code (optional)"
                className="question-input"
              />
            </div>

            <button 
              onClick={analyzeRepo} 
              disabled={loading || selectedFiles.length === 0}
              className="analyze-button"
            >
              {loading ? 'Analyzing...' : 'Analyze Selected Files'}
            </button>
          </div>
        )}

        {analysis && (
          <div className="analysis-container">
            <h2>Analysis Results</h2>
            <div className="analysis-content">
              {analysis}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App; 