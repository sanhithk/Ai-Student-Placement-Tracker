import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';
import { Target, TrendingUp, Code, FileText, BrainCircuit, Users, Flame, ChevronRight, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ScoreRing = ({ score, size = "lg", title, icon: Icon, colorClass = "text-primary-500" }) => {
  const isLg = size === "lg";
  const r = isLg ? 60 : 36;
  const cx = isLg ? 70 : 44;
  const strokeWidth = isLg ? 10 : 6;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className={`flex flex-col items-center ${isLg ? 'gap-4' : 'gap-2'}`}>
      <div className={`relative ${isLg ? 'w-36 h-36' : 'w-24 h-24'} flex items-center justify-center`}>
        <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
          <circle cx={cx} cy={cx} r={r} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-slate-800" />
          <motion.circle 
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx={cx} cy={cx} r={r} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" 
            strokeDasharray={circumference} 
            className={colorClass} 
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`${isLg ? 'text-4xl' : 'text-xl'} font-black text-white`}>{score}</span>
        </div>
      </div>
      {title && (
        <div className="flex items-center gap-2 text-slate-300 font-medium text-sm">
          {Icon && <Icon size={16} className={colorClass} />}
          {title}
        </div>
      )}
    </div>
  );
};

const PlacementReadiness = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiRecs, setAiRecs] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const res = await axios.get('/api/readiness', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRecommendations = async () => {
    setAiLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const res = await axios.post('/api/readiness/ai-recommendations', { breakdown: data.breakdown }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiRecs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="text-slate-400 text-center py-20">Loading your Readiness Profile...</div>;
  if (!data) return <div className="text-red-400 text-center py-20">Failed to load data.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Target size={32} className="text-primary-400" /> Placement Readiness
        </h1>
        <p className="text-slate-400 mt-2">A holistic 360° view of your placement preparedness based on your platform activity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Score Card */}
        <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-slate-700 lg:col-span-1 shadow-2xl flex flex-col justify-center items-center p-8 text-center">
          <ScoreRing score={data.overallScore} size="lg" colorClass={data.overallScore > 75 ? "text-emerald-500" : "text-amber-500"} />
          <h2 className="text-2xl font-bold text-white mt-6 mb-2">Overall Readiness</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {data.overallScore > 75 ? "You are highly competitive! Focus on specific company targeting." : "You have some weak areas. Check the breakdown to prioritize your prep."}
          </p>
        </Card>

        {/* Breakdown Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="flex items-center justify-center py-6 bg-slate-800/40">
            <ScoreRing score={data.breakdown.resume} title="Resume Quality" icon={FileText} colorClass="text-blue-400" />
          </Card>
          <Card className="flex items-center justify-center py-6 bg-slate-800/40">
            <ScoreRing score={data.breakdown.dsa} title="DSA Skills" icon={Code} colorClass="text-purple-400" />
          </Card>
          <Card className="flex items-center justify-center py-6 bg-slate-800/40">
            <ScoreRing score={data.breakdown.projects} title="Project Impact" icon={BrainCircuit} colorClass="text-pink-400" />
          </Card>
          <Card className="flex items-center justify-center py-6 bg-slate-800/40">
            <ScoreRing score={data.breakdown.interviews} title="Interviews" icon={Users} colorClass="text-emerald-400" />
          </Card>
          <Card className="flex items-center justify-center py-6 bg-slate-800/40">
            <ScoreRing score={data.breakdown.consistency} title="Consistency" icon={Flame} colorClass="text-orange-400" />
          </Card>
          <Card className="flex flex-col items-center justify-center py-6 bg-slate-800/40 gap-4">
            <ScoreRing score={data.breakdown.aptitude} title="Aptitude" icon={Target} colorClass="text-teal-400" />
            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded">Self-Reported</span>
          </Card>
        </div>
      </div>

      {/* AI Recommendations */}
      <Card className="border-primary-900/30">
        <CardHeader className="bg-primary-900/10 border-b border-primary-900/20 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary-400" /> AI Action Plan
          </h3>
          {!aiRecs && (
            <Button onClick={getRecommendations} disabled={aiLoading} className="text-xs py-1.5 shadow-lg shadow-primary-900/20">
              {aiLoading ? <RefreshCw className="animate-spin w-4 h-4 mr-2 inline" /> : 'Generate Plan'}
              {!aiLoading && 'Generate Plan'}
            </Button>
          )}
        </CardHeader>
        <CardBody className={aiRecs ? "p-6" : "p-12 text-center"}>
          {!aiRecs ? (
            <div className="text-slate-400">
              <Sparkles className="w-12 h-12 mx-auto text-primary-500/50 mb-4" />
              <p>Click "Generate Plan" to get highly personalized, actionable advice from our AI mentor based on your exact weak points.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-lg font-medium text-primary-300 italic mb-6 text-center">"{aiRecs.encouragement}"</p>
              <div className="grid gap-4 md:grid-cols-3">
                {aiRecs.recommendations.map((rec, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="bg-slate-900/50 border border-slate-700/50 p-5 rounded-xl relative overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rounded-full blur-xl ${rec.urgency === 'High' ? 'bg-red-500/20' : rec.urgency === 'Medium' ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}></div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-bold text-slate-200 bg-slate-800 px-2 py-1 rounded">{rec.area}</span>
                      <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded ${rec.urgency === 'High' ? 'bg-red-900/50 text-red-400' : rec.urgency === 'Medium' ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                        {rec.urgency} Priority
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{rec.advice}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

    </div>
  );
};

export default PlacementReadiness;
