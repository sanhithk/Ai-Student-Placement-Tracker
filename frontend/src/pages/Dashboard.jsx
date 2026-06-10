import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, FileText, Code, TrendingUp, Video, Target, Sparkles, Award } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DailyChallenge from '../components/DailyChallenge';

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div 
    variants={itemVariants}
    whileHover={{ scale: 1.03, y: -4 }}
    className="h-full"
  >
    <Card className="h-full border border-slate-200/30 dark:border-slate-700/30 bg-slate-50/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg transition-shadow hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]">
      <CardBody className="flex items-center gap-5 p-6">
        <div className={`p-4 rounded-xl ${colorClass}`}>
          <Icon size={28} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wider text-slate-600 dark:text-slate-400 uppercase mb-1">{title}</p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{value}</h3>
        </div>
      </CardBody>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    resumeScore: 0,
    codingProblems: 0,
    mockInterviews: 0,
    offerRate: 0,
    profileStrength: 0,
    aiInsights: [],
    chartData: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch all necessary data
        const [jobsRes, resumesRes, codingRes, profileRes] = await Promise.all([
          axios.get('/api/jobs', config).catch(() => ({ data: [] })),
          axios.get('/api/resumes', config).catch(() => ({ data: [] })),
          axios.get('/api/users/coding-stats', config).catch(() => ({ data: null })),
          axios.get('/api/users/profile', config).catch(() => ({ data: {} }))
        ]);

        const jobs = jobsRes.data;
        const resumes = resumesRes.data;
        const coding = codingRes.data;
        const profile = profileRes.data;

        // Process Jobs Data
        let appliedCount = 0;
        let interviewCount = 0;
        let rejectedCount = 0;
        let offeredCount = 0;
        
        jobs.forEach(job => {
          if (job.status === 'Applied') appliedCount++;
          if (job.status === 'Interviewing') interviewCount++;
          if (job.status === 'Rejected') rejectedCount++;
          if (job.status === 'Offered') offeredCount++;
        });

        // Process Resume Data
        const latestResume = resumes.length > 0 ? resumes[0] : null;
        
        // Process Coding Data
        const solvedProblems = coding?.stats?.solvedProblem || 0;

        // Generate Chart Data
        const chartData = [
          { name: 'Applied', value: appliedCount },
          { name: 'Interviewing', value: interviewCount },
          { name: 'Rejected', value: rejectedCount },
          { name: 'Offered', value: offeredCount },
        ];

        // Generate Recent Activities (Merging Jobs and Resumes)
        let activities = [];
        jobs.slice(0, 3).forEach(job => {
          activities.push({
            text: `Applied to ${job.role} at ${job.company}`,
            date: new Date(job.createdAt)
          });
        });
        resumes.slice(0, 2).forEach(res => {
          activities.push({
            text: `Resume analyzed: Score ${res.score}`,
            date: new Date(res.createdAt)
          });
        });

        activities.sort((a, b) => b.date - a.date);
        
        // Map to display format
        const displayActivities = activities.slice(0, 4).map(act => ({
          text: act.text,
          time: act.date.toLocaleDateString()
        }));

        // Calculate Offer Rate
        const totalClosedApps = rejectedCount + offeredCount;
        const offerRate = totalClosedApps === 0 ? 0 : Math.round((offeredCount / totalClosedApps) * 100);

        // Calculate Profile Strength
        let profileStrength = 0;
        if (profile.name) profileStrength += 20;
        if (resumes.length > 0) profileStrength += 20;
        if (coding?.leetcode || coding?.codeforces) profileStrength += 20;
        if (jobs.length > 0) profileStrength += 20;
        if (profile.mockInterviewsAttended > 0) profileStrength += 20;

        // Generate Dynamic AI Insights
        const aiInsights = [];
        if (resumes.length === 0) {
          aiInsights.push({ type: 'warning', text: "You haven't uploaded a resume yet. Go to the Resume Analyzer to get scored!" });
        } else if (latestResume && latestResume.score < 70) {
          aiInsights.push({ type: 'warning', text: `Your resume score is only ${latestResume.score}%. Fix the bullet points to pass ATS screening.` });
        } else {
          aiInsights.push({ type: 'success', text: "Your resume is looking strong! Make sure to keep it updated." });
        }

        if (profile.mockInterviewsAttended === 0) {
          aiInsights.push({ type: 'action', text: "You have 0 mock interviews. Try a quick session with the AI Interviewer to build confidence." });
        }

        if (appliedCount > 0 && interviewCount === 0) {
          aiInsights.push({ type: 'action', text: "You are applying but not getting interviews. Check your Resume Score and Proof of Work." });
        } else if (interviewCount > 0 && offeredCount === 0) {
          aiInsights.push({ type: 'warning', text: "You are getting interviews but no offers yet. Time to grind Mock Interviews!" });
        } else if (offeredCount > 0) {
          aiInsights.push({ type: 'success', text: "You have an offer! You are in the top percentage of candidates." });
        }

        if (solvedProblems < 50) {
          aiInsights.push({ type: 'action', text: "Your coding profile is a bit light. Try to solve 5 LeetCode problems this week." });
        }

        setStats({
          applications: jobs.length,
          interviews: interviewCount,
          resumeScore: latestResume ? latestResume.score : 'N/A',
          codingProblems: solvedProblems,
          mockInterviews: profile.mockInterviewsAttended || 0,
          offerRate,
          profileStrength,
          aiInsights: aiInsights.slice(0, 3), // Only show top 3 insights
          chartData,
          activities: displayActivities.length > 0 ? displayActivities : [{text: 'No recent activity yet', time: 'Today'}]
        });

      } catch (error) {
        console.error("Dashboard data error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-600 dark:text-slate-400">Loading your real-time dashboard...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      }
    }
  };

  return (
    <motion.div 
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-600 to-primary-600 dark:from-white dark:via-indigo-200 dark:to-primary-400 pb-2">
          Welcome back, {user?.name || 'Student'}!
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">Here is your live career progression overview.</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <DailyChallenge />
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <StatCard title="Applications" value={stats.applications} icon={Briefcase} colorClass="bg-blue-500/20 text-blue-400" />
        <StatCard title="Resume Score" value={stats.resumeScore} icon={FileText} colorClass="bg-emerald-500/20 text-emerald-400" />
        <Link to="/coding" className="block h-full">
          <StatCard title="Coding Problems" value={stats.codingProblems} icon={Code} colorClass="bg-purple-500/20 text-purple-400 cursor-pointer" />
        </Link>
        <StatCard title="Interviews" value={stats.interviews} icon={TrendingUp} colorClass="bg-amber-500/20 text-amber-400" />
        <Link to="/interview" className="block h-full">
          <StatCard title="Mock Interviews" value={stats.mockInterviews} icon={Video} colorClass="bg-pink-500/20 text-pink-400 cursor-pointer" />
        </Link>
        <StatCard title="Offer Rate" value={`${stats.offerRate}%`} icon={Target} colorClass="bg-indigo-500/20 text-indigo-400" />
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sparkles className="text-primary-500" size={20} />
              AI Career Insights
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {stats.aiInsights.map((insight, i) => (
                <div key={i} className={`p-4 rounded-xl border flex items-start gap-3 ${
                  insight.type === 'success' ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-300' :
                  insight.type === 'warning' ? 'bg-amber-900/20 border-amber-500/30 text-amber-300' :
                  'bg-primary-900/20 border-primary-500/30 text-primary-300'
                }`}>
                  <div className="mt-1">
                    {insight.type === 'success' ? <Award size={18} /> :
                     insight.type === 'warning' ? <Target size={18} /> :
                     <Sparkles size={18} />}
                  </div>
                  <p className="text-sm font-medium leading-relaxed">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Profile Strength</h2>
          </CardHeader>
          <CardBody className="flex flex-col items-center justify-center py-6">
            <div className="relative w-32 h-32 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" className="stroke-slate-800" strokeWidth="12" fill="none" />
                <motion.circle 
                  cx="64" cy="64" r="56" 
                  className="stroke-primary-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="351.86" 
                  strokeDashoffset={351.86 - (351.86 * stats.profileStrength) / 100} 
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 351.86 }}
                  animate={{ strokeDashoffset: 351.86 - (351.86 * stats.profileStrength) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute text-3xl font-black text-slate-900 dark:text-white">{stats.profileStrength}%</div>
            </div>
            
            <div className="w-full space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center">
                <span>Account Created</span>
                <span className="text-emerald-400"><Award size={16}/></span>
              </div>
              <div className="flex justify-between items-center">
                <span>Resume Uploaded</span>
                <span className={stats.resumeScore ? "text-emerald-400" : "text-slate-600"}><Award size={16}/></span>
              </div>
              <div className="flex justify-between items-center">
                <span>Coding Profile Linked</span>
                <span className={stats.codingProblems ? "text-emerald-400" : "text-slate-600"}><Award size={16}/></span>
              </div>
              <div className="flex justify-between items-center">
                <span>Job Tracked</span>
                <span className={stats.applications ? "text-emerald-400" : "text-slate-600"}><Award size={16}/></span>
              </div>
              <div className="flex justify-between items-center">
                <span>Mock Interview</span>
                <span className={stats.mockInterviews ? "text-emerald-400" : "text-slate-600"}><Award size={16}/></span>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Application Status</h2>
          </CardHeader>
          <CardBody className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Recent Activities</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {stats.activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 shrink-0" />
                  <div>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">{act.text}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
