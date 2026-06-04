import React, { useState } from 'react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { UploadCloud, FileText, CheckCircle, ExternalLink, Lightbulb, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const HighlightedText = ({ text, mistakes, activeMistake, setActiveMistake }) => {
  if (!text) return null;
  if (!mistakes || mistakes.length === 0) return <div className="whitespace-pre-wrap">{text}</div>;

  let parts = [{ text, isMatch: false, mistake: null }];

  mistakes.forEach(mistake => {
    if (!mistake.quote) return;
    const newParts = [];
    parts.forEach(part => {
      if (part.isMatch) {
        newParts.push(part);
        return;
      }
      const splitIndex = part.text.indexOf(mistake.quote);
      if (splitIndex === -1) {
        newParts.push(part);
      } else {
        const before = part.text.substring(0, splitIndex);
        const match = part.text.substring(splitIndex, splitIndex + mistake.quote.length);
        const after = part.text.substring(splitIndex + mistake.quote.length);

        if (before) newParts.push({ text: before, isMatch: false, mistake: null });
        newParts.push({ text: match, isMatch: true, mistake });
        if (after) newParts.push({ text: after, isMatch: false, mistake: null });
      }
    });
    parts = newParts;
  });

  return (
    <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-300">
      {parts.map((part, i) => 
        part.isMatch ? (
          <span 
            key={i} 
            onClick={() => setActiveMistake(part.mistake)}
            className={`cursor-pointer transition-colors px-0.5 rounded ${
              activeMistake === part.mistake 
                ? 'bg-red-500/40 underline decoration-red-500 decoration-wavy text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                : 'bg-red-500/10 underline decoration-red-500/50 decoration-wavy hover:bg-red-500/30'
            }`}
          >
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </div>
  );
};

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeMistake, setActiveMistake] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      const { data } = await axios.post('/api/resumes/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setResult(data);
      setActiveMistake(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload and analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">AI Resume Analyzer</h1>
        <p className="text-slate-400 mt-1 max-w-2xl mx-auto">Upload your resume to get instant AI-driven feedback, ATS scoring, and visual mistake highlighting.</p>
      </div>

      {!result ? (
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardBody className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-700 rounded-xl m-6 bg-slate-900/30">
              <UploadCloud size={48} className="text-slate-500 mb-4" />
              <h3 className="text-lg font-medium text-white mb-1">Upload Resume (PDF)</h3>
              <p className="text-slate-400 text-sm mb-6">Drag and drop or click to browse</p>
              
              <input 
                type="file" 
                id="resume-upload" 
                className="hidden" 
                accept=".pdf"
                onChange={handleFileChange}
              />
              <label htmlFor="resume-upload">
                <span className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 shadow-lg">
                  Select File
                </span>
              </label>

              {file && (
                <div className="mt-4 flex items-center gap-2 text-sm text-primary-500 font-medium bg-primary-900/20 px-4 py-2 rounded-full border border-primary-900/50">
                  <FileText size={16} />
                  {file.name}
                </div>
              )}

              {error && (
                <div className="mt-4 w-full max-w-sm bg-red-900/30 border border-red-900 text-red-400 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              {file && (
                <Button 
                  onClick={handleAnalyze} 
                  className="mt-6 w-full max-w-sm text-lg py-3 shadow-primary-900/20 shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Analyzing with AI...' : 'Analyze Now'}
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
          
          {/* LEFT COLUMN: The Highlighted Resume Text */}
          <Card className="h-[800px] flex flex-col border-slate-700 shadow-2xl">
            <CardHeader className="border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                <FileText size={20} className="text-primary-500" />
                Parsed Resume
              </h3>
              <Button onClick={() => setResult(null)} variant="secondary" className="text-xs py-1.5 px-3">
                Upload New
              </Button>
            </CardHeader>
            <CardBody className="overflow-y-auto p-6 custom-scrollbar bg-slate-950">
              <HighlightedText 
                text={result.resumeText} 
                mistakes={result.parsedData?.mistakes} 
                activeMistake={activeMistake} 
                setActiveMistake={setActiveMistake} 
              />
            </CardBody>
          </Card>

          {/* RIGHT COLUMN: The Feedback & Scores */}
          <div className="space-y-6 h-[800px] overflow-y-auto custom-scrollbar pr-2">
            
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
              <CardBody className="flex items-center gap-6 p-8">
                <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                    <circle 
                      cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" 
                      strokeDasharray={301.59} 
                      strokeDashoffset={301.59 - (301.59 * result.score) / 100}
                      className={result.score > 75 ? "text-emerald-500" : "text-amber-500"} 
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-white">{result.score}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">ATS Score</h2>
                  <p className="text-slate-400 leading-relaxed">
                    {result.score > 75 ? "Your resume is highly optimized! Fix the minor issues below to perfect it." : "Your resume needs significant improvements to pass the ATS filter."}
                  </p>
                </div>
              </CardBody>
            </Card>

            {result.parsedData?.mistakes && result.parsedData.mistakes.length > 0 && (
              <Card className="border-red-900/30">
                <CardHeader className="bg-red-900/10 border-b border-red-900/20">
                  <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Critical Mistakes Found
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Click a mistake below to highlight it in your resume on the left.</p>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="divide-y divide-slate-800/50">
                    {result.parsedData.mistakes.map((mistake, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setActiveMistake(mistake)}
                        className={`p-5 cursor-pointer transition-colors ${activeMistake === mistake ? 'bg-slate-800/80 border-l-4 border-l-red-500' : 'hover:bg-slate-800/40 border-l-4 border-l-transparent'}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <span className="w-6 h-6 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-white text-sm">{mistake.issue}</h4>
                            <p className="text-slate-400 text-xs mt-1 font-mono italic bg-slate-900 p-2 rounded border border-slate-800 line-clamp-2">"{mistake.quote}"</p>
                          </div>
                        </div>
                        <div className="ml-9 bg-emerald-900/20 border border-emerald-900/30 p-3 rounded-lg">
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block mb-1">How to fix it</span>
                          <p className="text-emerald-100 text-sm">{mistake.correction}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-slate-200">General Feedback</h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-4">
                  {result.feedback.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-primary-500 mt-0.5 shrink-0" />
                      <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {result.parsedData?.recommendation && (
              <Card className="border-primary-900/30">
                <CardHeader className="flex flex-row items-center gap-2 bg-primary-900/10 border-b border-primary-900/20">
                  <Lightbulb size={24} className="text-amber-500" />
                  <h3 className="text-lg font-semibold text-slate-200">Career Recommendation</h3>
                </CardHeader>
                <CardBody className="p-6">
                  <div className="mb-6">
                    <p className="text-lg font-medium text-white mb-2">
                      Recommended Path: <span className="text-primary-400 font-bold">{result.parsedData.recommendation.roleType}</span>
                    </p>
                    <p className="text-slate-400 text-sm leading-relaxed">{result.parsedData.recommendation.reasoning}</p>
                  </div>
                  
                  <h4 className="font-medium text-slate-200 mb-3 text-sm uppercase tracking-wider">Quick Search Links</h4>
                  <div className="flex flex-wrap gap-4">
                    {result.parsedData.recommendation.searchKeywords?.map((keyword, idx) => (
                      <div key={idx} className="flex flex-col gap-2 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex-1 min-w-[200px]">
                        <span className="text-primary-300 font-medium text-sm">
                          {keyword}
                        </span>
                        <div className="flex items-center gap-4">
                          <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(keyword)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors">
                            LinkedIn <ExternalLink size={12} />
                          </a>
                          <a href={`https://internshala.com/internships/keywords-${encodeURIComponent(keyword).replace(/%20/g, '-')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-sky-500 hover:text-sky-400 transition-colors">
                            Internshala <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
