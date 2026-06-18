import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';

const PublicProfile = () => {
  const { shareId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const res = await axios.get(`/api/resumes/public/${shareId}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Profile not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [shareId]);

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-900 dark:text-white text-xl">Loading AI Profile...</div>;
  if (error) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-red-500 gap-4">
    <h2 className="text-3xl font-bold">Oops!</h2>
    <p>{error}</p>
    <Link to="/"><Button>Go Home</Button></Link>
  </div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary-900/30 text-primary-400 text-sm font-medium border border-primary-900/50 mb-2">
            PlaceTrack Public Profile
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-sky-400">
              {data.user}'s
            </span> AI Resume Roast
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            This resume was analyzed and scored by advanced AI models. See how it performed against industry standards.
          </p>
        </div>

        {/* Scores Section */}
        <div className={`grid gap-6 ${data.jdMatchScore ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText size={120} />
            </div>
            <CardBody className="p-8 flex items-center gap-8 relative z-10">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                  <circle 
                    cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray={351.86} 
                    strokeDashoffset={351.86 - (351.86 * data.score) / 100}
                    className={data.score > 75 ? "text-emerald-500" : "text-amber-500"} 
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <span className="absolute text-4xl font-black text-slate-900 dark:text-white">{data.score}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Overall ATS Score</h2>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {data.score > 75 ? "Highly optimized resume! Top 10% candidate." : "Needs significant improvements to pass the ATS filter."}
                </p>
              </div>
            </CardBody>
          </Card>

          {data.jdMatchScore && (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-200 dark:border-slate-700 shadow-2xl relative overflow-hidden">
              <CardBody className="p-8 flex items-center gap-8 relative z-10">
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                    <circle 
                      cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                      strokeDasharray={351.86} 
                      strokeDashoffset={351.86 - (351.86 * data.jdMatchScore) / 100}
                      className={data.jdMatchScore > 75 ? "text-primary-500" : "text-amber-500"} 
                      style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                    />
                  </svg>
                  <span className="absolute text-4xl font-black text-slate-900 dark:text-white">{data.jdMatchScore}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Target Job Match</h2>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Specific score based on a custom Job Description.
                  </p>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Action Call for Visitors */}
        <div className="bg-gradient-to-r from-primary-900/40 to-sky-900/40 border border-primary-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-primary-900/20 my-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">Can your resume beat {data.user}'s score?</h2>
          <p className="text-slate-700 dark:text-slate-300 mb-8 max-w-xl mx-auto">Upload your resume and let our advanced AI instantly analyze, score, and roast your profile for free.</p>
          <Link to="/register">
            <Button className="text-lg py-4 px-8 font-bold shadow-lg shadow-primary-600/30 group">
              Get Your AI Resume Score Free <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Feedback Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">AI Feedback</h3>
            </CardHeader>
            <CardBody>
              <ul className="space-y-4">
                {data.feedback.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-primary-500 mt-0.5 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>

          {data.jdFeedback && data.jdFeedback.length > 0 && (
            <Card className="border-amber-900/30">
              <CardHeader className="bg-amber-900/10 border-b border-amber-900/20">
                <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Missing Skills for Target Job
                </h3>
              </CardHeader>
              <CardBody>
                <ul className="space-y-4">
                  {data.jdFeedback.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicProfile;
