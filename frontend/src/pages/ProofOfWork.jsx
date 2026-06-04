import React, { useState } from 'react';
import axios from 'axios';
import Card, { CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Zap, Copy, Loader2, CheckCircle2, LayoutTemplate, Briefcase, FileCode } from 'lucide-react';

const ProofOfWork = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [powData, setPowData] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Job description is required.');
      return;
    }

    setLoading(true);
    setError('');
    setPowData(null);

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.post('/api/pow/generate', 
        { jobDescription, companyName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPowData(data);
    } catch (err) {
      console.error('Failed to generate PoW', err);
      setError('Failed to generate Proof of Work project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (powData?.recruiterMessage) {
      navigator.clipboard.writeText(powData.recruiterMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Zap className="text-primary-500" size={32} />
          Proof-of-Work Generator
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
          Bypass the ATS. Paste a job description below, and our AI will generate a tailored micro-project you can build in under 3 hours to prove you're the perfect fit.
        </p>
      </div>

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Stripe, OpenAI, Google" 
                className="w-full px-4 py-2 bg-slate-900/50 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Job Description <span className="text-red-400">*</span></label>
              <textarea 
                rows="6"
                placeholder="Paste the full job description here..." 
                className="w-full px-4 py-3 bg-slate-900/50 text-white border border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow font-mono text-sm"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 py-3 text-lg">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              {loading ? 'Generating Strategy...' : 'Generate Project Strategy'}
            </Button>
          </form>
        </CardBody>
      </Card>

      {powData && (
        <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-bold text-white mb-4 border-b border-slate-700 pb-2">Your Micro-Project Strategy</h2>
          
          <Card className="border-primary-500/30 shadow-lg shadow-primary-900/10">
            <CardBody className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-900/40 flex items-center justify-center shrink-0">
                  <LayoutTemplate className="text-primary-400" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{powData.projectTitle}</h3>
                  <p className="text-slate-300 mt-2 leading-relaxed">{powData.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileCode size={16} /> Recommended Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {powData.techStack.map((tech, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase size={16} /> Execution Steps
                </h4>
                <div className="space-y-4">
                  {powData.architectureSteps.map((step, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-700">
                        {i + 1}
                      </div>
                      <p className="text-slate-300 pt-1 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6 relative group">
                <h4 className="text-sm font-semibold text-primary-400 uppercase tracking-wider mb-3">Recruiter Outreach Message</h4>
                <p className="text-slate-300 whitespace-pre-wrap font-serif italic text-sm leading-relaxed bg-slate-900 p-4 rounded-lg border border-slate-800">
                  {powData.recruiterMessage}
                </p>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-6 right-6 p-2 bg-slate-800 hover:bg-primary-900/50 text-slate-400 hover:text-primary-400 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium border border-slate-700"
                >
                  {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProofOfWork;
