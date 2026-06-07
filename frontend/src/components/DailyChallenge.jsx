import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, Flame, Trophy, Award, Zap } from 'lucide-react';
import Card, { CardBody } from './UI/Card';

const DailyChallenge = () => {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedState, setCompletedState] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/challenges/daily', config);
      setChallengeData(data);
    } catch (error) {
      console.error("Error fetching daily challenge:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!challengeData?.challenge) return;
    
    if (challengeData.challenge.type === 'quiz' && !selectedOption) {
      setError('Please select an option first!');
      return;
    }

    setCompleting(true);
    setError('');
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.post(`/api/challenges/${challengeData.challenge._id}/complete`, { answer: selectedOption }, config);
      
      setCompletedState(data);
      setChallengeData({ hasCompletedToday: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Error completing challenge');
      console.error("Error completing challenge:", err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary-500/30 bg-primary-900/10 animate-pulse">
        <CardBody className="p-6 h-32 flex items-center justify-center">
          <div className="text-primary-400">Loading daily challenge...</div>
        </CardBody>
      </Card>
    );
  }

  // Already completed before
  if (challengeData?.hasCompletedToday && !completedState) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-900/10">
        <CardBody className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Daily Challenge Completed!</h3>
              <p className="text-emerald-400 text-sm mt-1">Come back tomorrow for a new challenge.</p>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Just completed (Celebration state)
  if (completedState) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="border-yellow-500/50 bg-gradient-to-r from-yellow-900/40 to-amber-900/40 relative overflow-hidden">
          {/* Confetti-like elements */}
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-10 -top-10 text-yellow-500/20"
          >
            <Trophy size={150} />
          </motion.div>
          
          <CardBody className="p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(245,158,11,0.5)]"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              <div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
                  Challenge Conquered!
                </h3>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-yellow-400 font-bold bg-yellow-400/10 px-3 py-1 rounded-full text-sm">
                    +{completedState.pointsAwarded} XP <Zap size={14} />
                  </span>
                  <span className="flex items-center gap-1 text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-full text-sm">
                    {completedState.currentStreak} Day Streak <Flame size={14} />
                  </span>
                </div>
              </div>
            </div>

            {completedState.newBadges?.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700"
              >
                <Award className="text-purple-400" size={24} />
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">New Badge</p>
                  <p className="text-white font-medium capitalize">{completedState.newBadges[0].replace(/_/g, ' ')}</p>
                </div>
              </motion.div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  // Pending Challenge State
  const chal = challengeData?.challenge;
  if (!chal) {
    return null;
  }

  return (
    <Card className="border-primary-500/30 bg-gradient-to-br from-slate-800 to-slate-900 shadow-[0_0_40px_rgba(99,102,241,0.1)] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-indigo-600" />
      <CardBody className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center shrink-0">
            <Target size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary-400 uppercase tracking-wider bg-primary-500/10 px-2 py-0.5 rounded">Daily Challenge</span>
              <span className="flex items-center text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                <Zap size={12} className="mr-1" /> {chal.points} XP
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{chal.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{chal.description}</p>
          </div>
        </div>

        {chal.type === 'quiz' && (
          <div className="w-full space-y-3 mt-6 mb-6">
            {chal.options?.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => { setSelectedOption(opt); setError(''); }}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedOption === opt ? 'bg-primary-500/20 border-primary-500 text-primary-300' : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'}`}
              >
                {opt}
              </button>
            ))}
            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
            disabled={completing}
            className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {completing ? 'Checking...' : 'Submit Answer'} <CheckCircle2 size={18} />
          </motion.button>
        </div>
      </CardBody>
    </Card>
  );
};

export default DailyChallenge;
