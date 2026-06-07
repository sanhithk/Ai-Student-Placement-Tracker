import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Medal, Award, TrendingUp, Sparkles } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('/api/challenges/leaderboard', config);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Medal size={28} className="text-yellow-400" />;
      case 1: return <Medal size={28} className="text-slate-300" />;
      case 2: return <Medal size={28} className="text-amber-600" />;
      default: return <span className="text-xl font-bold text-slate-500 w-[28px] text-center">{index + 1}</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-400">Loading Leaderboard...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center gap-3">
            <Trophy size={40} className="text-yellow-400" />
            Global Leaderboard
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Compete with your peers, maintain your streak, and top the charts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-slate-700/50 bg-slate-800/40 backdrop-blur-xl">
          <CardHeader>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-400" /> Top Performers
            </h2>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-800/50">
              {users.map((u, index) => (
                <motion.div 
                  key={u._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-5 hover:bg-slate-700/20 transition-colors ${user?._id === u._id ? 'bg-primary-900/10' : ''}`}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex justify-center w-8">
                      {getRankIcon(index)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                        {u.name} {user?._id === u._id && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">You</span>}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        {u.badges?.slice(0, 3).map((badge, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {badge.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-right">
                    <div>
                      <p className="text-sm text-slate-400">Streak</p>
                      <p className="text-lg font-bold text-orange-400 flex items-center justify-end gap-1">
                        <Flame size={18} /> {u.currentStreak}
                      </p>
                    </div>
                    <div className="w-20">
                      <p className="text-sm text-slate-400">Points</p>
                      <p className="text-xl font-black text-white">{u.points}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {users.length === 0 && (
                <div className="p-8 text-center text-slate-400">No users found. Be the first to complete a challenge!</div>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-700/50 bg-gradient-to-b from-slate-800/80 to-slate-900/80">
            <CardBody className="text-center py-8">
              <div className="w-20 h-20 mx-auto bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">How to climb?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Complete your Daily Challenges from the Dashboard to earn points. Maintain consecutive days to multiply your streak and unlock exclusive badges!
              </p>
            </CardBody>
          </Card>
          
          <Card className="border-slate-700/50 bg-slate-800/40">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award size={18} className="text-emerald-400" /> Badge Showcase
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
                  <Flame size={20} className="text-orange-400" />
                </div>
                <div>
                  <h4 className="text-slate-200 text-sm font-medium">7 Day Streak</h4>
                  <p className="text-slate-500 text-xs">Complete 7 daily challenges in a row</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0">
                  <Trophy size={20} className="text-primary-400" />
                </div>
                <div>
                  <h4 className="text-slate-200 text-sm font-medium">First Blood</h4>
                  <p className="text-slate-500 text-xs">Complete your very first challenge</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                  <Medal size={20} className="text-purple-400" />
                </div>
                <div>
                  <h4 className="text-slate-200 text-sm font-medium">30 Day Streak</h4>
                  <p className="text-slate-500 text-xs">Unstoppable consistency</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
