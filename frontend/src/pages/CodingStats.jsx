import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import axios from 'axios';
import { Code, Trophy, Target, AlertCircle, ExternalLink, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const CodingStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const res = await axios.get('/api/users/coding-stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load coding statistics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-600 dark:text-slate-400">Loading your live coding stats...</div>;
  }

  if (error) {
    return <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  if (!data?.leetcode && !data?.codeforces) {
    return (
      <Card className="max-w-2xl mx-auto mt-10">
        <CardBody className="flex flex-col items-center justify-center py-12 text-center">
          <Code size={48} className="text-slate-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Coding Profiles Linked</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Link your LeetCode or Codeforces accounts in settings to track your problem-solving progress directly on your dashboard.
          </p>
          <Link to="/settings" className="px-4 py-2 bg-primary-600 text-slate-900 dark:text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Go to Settings
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Code size={32} className="text-primary-500" />
          Coding Statistics
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Live data from your linked programming profiles</p>
      </div>

      {data.leetcode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-amber-500">LeetCode</span>
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">({data.leetcode.username})</span>
            </h2>
            <a 
              href={`https://leetcode.com/${data.leetcode.username}/`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors text-sm"
            >
              View Profile <ExternalLink size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary-900/30 text-primary-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Solved</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.leetcode.totalSolved || 0}</h3>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-emerald-900/30 text-emerald-400">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Easy</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.leetcode.easySolved || 0}</h3>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-amber-900/30 text-amber-400">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Medium</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.leetcode.mediumSolved || 0}</h3>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-red-900/30 text-red-400">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Hard</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.leetcode.hardSolved || 0}</h3>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {data.codeforces && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-500">Codeforces</span>
              <span className="text-sm font-normal text-slate-600 dark:text-slate-400">({data.codeforces.username})</span>
            </h2>
            <a 
              href={`https://codeforces.com/profile/${data.codeforces.username}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-700 font-medium transition-colors text-sm"
            >
              View Profile <ExternalLink size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-indigo-900/30 text-indigo-400">
                  <Code size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Solved</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.codeforces.totalSolved || 0}</h3>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-blue-900/30 text-blue-400">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Rating</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.codeforces.rating || 'Unrated'}</h3>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary-900/30 text-primary-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Max Rating</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{data.codeforces.maxRating || 'N/A'}</h3>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-emerald-900/30 text-emerald-400">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rank</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{data.codeforces.rank || 'N/A'}</h3>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
};

export default CodingStats;
