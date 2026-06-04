import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, MapPin, Building2, CheckCircle2, XCircle, ExternalLink, Loader2, Filter } from 'lucide-react';
import Card, { CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';

const JobMatch = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Filter States
  const [filterLocation, setFilterLocation] = useState('');
  const [filterType, setFilterType] = useState('Any');
  const [filterRemote, setFilterRemote] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    setCurrentIndex(0);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.get('/api/jobs/match', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          location: filterLocation,
          type: filterType !== 'Any' ? filterType : undefined,
          remote: filterRemote ? 'true' : undefined
        }
      });
      setJobs(data);
    } catch (err) {
      console.error("Failed to fetch matched jobs", err);
      setError('Failed to fetch AI-matched jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleSave = async (job) => {
    setActionLoading(true);
    setSuccessMsg('');
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.post('/api/jobs', 
        { 
          company: job.company, 
          role: job.title, 
          status: 'Saved',
          url: job.url,
          notes: `AI Match Score: ${job.matchScore}%. Reason: ${job.matchReason}`
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessMsg(`Saved ${job.company} to your Tracker!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error('Failed to save job', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscard = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const renderFilters = () => (
    <Card className="mb-6 bg-slate-900/30 border border-slate-700/50">
      <CardBody className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
            <input 
              type="text" 
              placeholder="e.g. New York, London, Remote" 
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs font-medium text-slate-400 mb-1">Role Type</label>
            <select 
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Any">Any Role</option>
              <option value="Internship">Internship Only</option>
              <option value="Full-Time">Full-Time Only</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="remoteFilter"
              checked={filterRemote}
              onChange={(e) => setFilterRemote(e.target.checked)}
              className="w-4 h-4 bg-slate-800 border-slate-700 rounded text-primary-500 focus:ring-primary-500"
            />
            <label htmlFor="remoteFilter" className="text-sm text-slate-300 select-none cursor-pointer">
              Remote Only
            </label>
          </div>
          <Button onClick={fetchJobs} className="py-2 px-4 whitespace-nowrap flex items-center gap-2">
            <Filter size={16} />
            Apply Filters
          </Button>
        </div>
      </CardBody>
    </Card>
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-8">
        {renderFilters()}
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <h2 className="text-xl font-bold text-white">AI is hunting for jobs...</h2>
          <p className="text-slate-400 mt-2 text-center max-w-md">
            We are analyzing live job postings against your resume skills to find the perfect matches.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-8">
        {renderFilters()}
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="bg-red-900/30 text-red-400 p-6 rounded-xl border border-red-900/50 text-center max-w-md">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= jobs.length) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 mt-8">
        {renderFilters()}
        <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-slate-900/20 border border-slate-700/50 rounded-2xl p-8">
          <div className="w-20 h-20 bg-primary-900/30 rounded-full flex items-center justify-center text-primary-500 mb-6 mx-auto">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No more matches found!</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            You've swiped through all the jobs, or your filters are too strict. Try adjusting your filters and searching again.
          </p>
        </div>
      </div>
    );
  }

  const currentJob = jobs[currentIndex];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-900/30 border-emerald-500/50';
    if (score >= 60) return 'text-amber-400 bg-amber-900/30 border-amber-500/50';
    return 'text-slate-400 bg-slate-800 border-slate-700';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Sparkles className="text-primary-500" size={32} />
          AI Job Discovery
        </h1>
        <p className="text-slate-400 mt-2">
          Swipe through live job postings scored specifically against your resume.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-lg text-center font-medium animate-pulse mb-6">
          {successMsg}
        </div>
      )}

      {renderFilters()}


      <Card className="relative overflow-hidden border-2 border-slate-700/50 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / jobs.length) * 100}%` }}
          />
        </div>
        
        <CardBody className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Building2 size={16} />
                <span className="font-medium text-slate-300">{currentJob.company}</span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight">{currentJob.title}</h2>
              <div className="flex items-center gap-2 text-slate-400 mt-3 text-sm">
                <MapPin size={14} />
                <span>{currentJob.location}</span>
                <span className="mx-2">•</span>
                <a href={currentJob.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors">
                  View Source <ExternalLink size={12} />
                </a>
              </div>
            </div>
            
            <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border ${getScoreColor(currentJob.matchScore)}`}>
              <span className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Match</span>
              <span className="text-3xl font-black">{currentJob.matchScore}%</span>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-5 mb-6 border border-slate-700/50">
            <div className="flex items-start gap-3">
              <Sparkles className="text-primary-500 mt-1 shrink-0" size={20} />
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">AI Reasoning</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{currentJob.matchReason}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Snippet</h3>
            <p className="text-slate-300 text-sm leading-relaxed line-clamp-4">
              {currentJob.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {currentJob.tags && currentJob.tags.slice(0, 6).map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="secondary" 
              className="py-4 flex justify-center items-center gap-2 text-slate-300 hover:text-red-400 hover:bg-red-900/20 hover:border-red-900/50"
              onClick={handleDiscard}
              disabled={actionLoading}
            >
              <XCircle size={20} />
              Discard
            </Button>
            <Button 
              className="py-4 flex justify-center items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 shadow-lg shadow-primary-900/20"
              onClick={() => handleSave(currentJob)}
              disabled={actionLoading}
            >
              <CheckCircle2 size={20} />
              Save to Tracker
            </Button>
          </div>
        </CardBody>
      </Card>
      
      <p className="text-center text-slate-500 text-sm">
        Showing {currentIndex + 1} of {jobs.length} AI matched jobs
      </p>
    </div>
  );
};

export default JobMatch;
