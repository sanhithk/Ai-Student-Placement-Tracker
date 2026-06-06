import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, FileText, Code, TrendingUp, Video, Target, Sparkles, Award } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    whileHover={{ scale: 1.02 }}
  >
    <Card className="h-full">
      <CardBody className="flex items-center gap-4">
        <div className={`p-4 rounded-full ${colorClass}`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white">{value}</h3>
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
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading your real-time dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, {user?.name || 'Student'}!</h1>
        <p className="text-slate-400 mt-1">Here is your live career progression overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <StatCard title="Applications" value={stats.applications} icon={Briefcase} colorClass="bg-blue-900/30 text-blue-400" />
        <StatCard title="Resume Score" value={stats.resumeScore} icon={FileText} colorClass="bg-emerald-900/30 text-emerald-400" />
        <Link to="/coding">
          <StatCard title="Coding Problems" value={stats.codingProblems} icon={Code} colorClass="bg-purple-900/30 text-purple-400 cursor-pointer hover:shadow-md transition-shadow" />
        </Link>
        <StatCard title="Interviews" value={stats.interviews} icon={TrendingUp} colorClass="bg-amber-900/30 text-amber-400" />
        <Link to="/interview">
          <StatCard title="Mock Interviews" value={stats.mockInterviews} icon={Video} colorClass="bg-pink-900/30 text-pink-400 cursor-pointer hover:shadow-md transition-shadow" />
        </Link>
        <StatCard title="Offer Rate" value={`${stats.offerRate}%`} icon={Target} colorClass="bg-indigo-900/30 text-indigo-400" />
      </div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
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
            <h2 className="text-lg font-semibold text-slate-200">Profile Strength</h2>
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
              <div className="absolute text-3xl font-black text-white">{stats.profileStrength}%</div>
            </div>
            
            <div className="w-full space-y-2 text-sm text-slate-400">
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
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-200">Application Status</h2>
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
            <h2 className="text-lg font-semibold text-slate-200">Recent Activities</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {stats.activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 shrink-0" />
                  <div>
                    <p className="text-slate-200 font-medium">{act.text}</p>
                    <p className="text-sm text-slate-400">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
