import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Briefcase, FileText, Code, TrendingUp, Video } from 'lucide-react';
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

        setStats({
          applications: jobs.length,
          interviews: interviewCount,
          resumeScore: latestResume ? latestResume.score : 'N/A',
          codingProblems: solvedProblems,
          mockInterviews: profile.mockInterviewsAttended || 0,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Applications" value={stats.applications} icon={Briefcase} colorClass="bg-blue-900/30 text-blue-400" />
        <StatCard title="Resume Score" value={stats.resumeScore} icon={FileText} colorClass="bg-emerald-900/30 text-emerald-400" />
        <Link to="/coding">
          <StatCard title="Coding Problems" value={stats.codingProblems} icon={Code} colorClass="bg-purple-900/30 text-purple-400 cursor-pointer hover:shadow-md transition-shadow" />
        </Link>
        <StatCard title="Interviews" value={stats.interviews} icon={TrendingUp} colorClass="bg-amber-900/30 text-amber-400" />
        <Link to="/interview">
          <StatCard title="Mock Interviews" value={stats.mockInterviews} icon={Video} colorClass="bg-pink-900/30 text-pink-400 cursor-pointer hover:shadow-md transition-shadow" />
        </Link>
      </div>

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
