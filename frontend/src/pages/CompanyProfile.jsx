import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, ArrowLeft, CheckCircle, Target, BookOpen, Layers, MessageSquare, AlertCircle, TrendingUp, Sparkles, RefreshCw, Milestone } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import { motion } from 'framer-motion';

const CompanyProfile = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roadmapData, setRoadmapData] = useState(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  const generateRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const res = await axios.post(`/api/companies/${id}/roadmap`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoadmapData(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to generate roadmap. Ensure you have an uploaded resume.');
    } finally {
      setRoadmapLoading(false);
    }
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const [compRes, matchRes] = await Promise.all([
          axios.get(`/api/companies/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/companies/${id}/match`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCompany(compRes.data);
        setMatchData(matchRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, [id]);

  if (loading) return <div className="text-slate-400 text-center py-20">Loading Company Profile...</div>;
  if (!company) return <div className="text-red-400 text-center py-20">Company not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <Link to="/companies" className="inline-flex items-center text-slate-400 hover:text-primary-400 transition-colors text-sm font-medium">
        <ArrowLeft size={16} className="mr-1" /> Back to Company Hub
      </Link>

      {/* Header section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <div className="w-32 h-32 bg-white rounded-2xl p-6 flex items-center justify-center shadow-lg shadow-black/50 shrink-0">
          <img src={company.logoUrl} alt={company.name} className="max-w-full max-h-full object-contain" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-4xl font-black text-white">{company.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
            <span className="bg-primary-900/40 text-primary-300 border border-primary-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{company.tier}</span>
            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Difficulty: {company.difficultyScore}/100</span>
          </div>
        </div>
        
        {/* Match Score Widget */}
        <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex items-center gap-6 shadow-xl shrink-0">
          <div>
            <p className="text-sm text-slate-400 font-medium mb-1">Your Match Score</p>
            <p className="text-xs text-slate-500">Based on Readiness vs Difficulty</p>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-900" />
              <circle 
                cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray={175.9} 
                strokeDashoffset={175.9 - (175.9 * matchData.matchPercentage) / 100}
                className={matchData.matchPercentage > 75 ? "text-emerald-500" : "text-amber-500"} 
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-lg font-black text-white">{matchData.matchPercentage}%</span>
          </div>
        </div>
      </div>

      {/* AI Roadmap Generator */}
      <Card className="border-primary-900/30">
        <CardHeader className="bg-primary-900/10 border-b border-primary-900/20 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Milestone size={20} className="text-primary-400" /> Personalized AI Roadmap
          </h3>
          {!roadmapData && (
            <button onClick={generateRoadmap} disabled={roadmapLoading} className="bg-primary-600 hover:bg-primary-500 text-white text-xs px-4 py-2 rounded-lg font-bold flex items-center shadow-lg shadow-primary-900/20 disabled:opacity-50 transition-colors">
              {roadmapLoading ? <><RefreshCw className="animate-spin w-4 h-4 mr-2" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Compare Resume & Generate</>}
            </button>
          )}
        </CardHeader>
        <CardBody className={roadmapData ? "p-6" : "p-12 text-center"}>
          {!roadmapData ? (
            <div className="text-slate-400">
              <p>We'll analyze your latest parsed resume against {company.name}'s requirements and build a step-by-step preparation plan.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {roadmapData.missingSkills && roadmapData.missingSkills.length > 0 && (
                <div>
                  <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                    <AlertCircle size={18} /> Critical Missing Skills Found
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {roadmapData.missingSkills.map((skill, idx) => (
                      <span key={idx} className="bg-red-900/20 border border-red-800/30 text-red-300 px-3 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-slate-200 font-bold mb-4">Your Step-by-Step Plan</h4>
                <div className="space-y-4">
                  {roadmapData.roadmap.map((step, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      key={idx} 
                      className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl flex gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-900/50 text-primary-400 flex items-center justify-center font-black shrink-0 border border-primary-500/20">
                        {step.step}
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1">{step.title}</h5>
                        <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Insights */}
      {matchData.insights && matchData.insights.length > 0 && (
        <Card className="border-primary-900/30 bg-primary-950/20">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold text-primary-300 flex items-center gap-2 mb-4">
              <Target size={20} /> Personalized Insights
            </h3>
            <div className="space-y-3">
              {matchData.insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                  <AlertCircle size={18} className="text-primary-500 mt-0.5 shrink-0" />
                  <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Workflow */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers size={20} className="text-sky-400" /> Hiring Workflow
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="relative pl-8 pr-6 py-6 border-l-2 border-slate-800 ml-6 space-y-8">
                {company.hiringWorkflow.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[41px] top-0 w-8 h-8 bg-slate-900 border-2 border-sky-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                      <span className="text-sky-400 font-bold text-xs">{step.step}</span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-baseline gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-200">{step.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium border border-slate-700">{step.duration}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-900/30 text-sky-400 font-medium border border-sky-800/50">{step.type}</span>
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-amber-400" /> Frequently Asked HR Questions
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {company.hrQuestions.map((q, idx) => (
                <div key={idx} className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl">
                  <p className="text-slate-200 italic font-medium">"{q}"</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Topics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-400" /> Core Tech Subjects
              </h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-3">
                {company.techSubjects.map((subject, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-300 text-sm bg-slate-800/30 p-2.5 rounded-lg border border-slate-800">
                    <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                    {subject}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-400" /> Recommended DSA
              </h2>
            </CardHeader>
            <CardBody>
              <div className="flex flex-wrap gap-2">
                {company.recommendedDSA.map((topic, idx) => (
                  <span key={idx} className="bg-purple-900/20 border border-purple-800/30 text-purple-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {topic}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default CompanyProfile;
