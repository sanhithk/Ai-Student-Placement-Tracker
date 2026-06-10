import React, { useState, useEffect } from 'react';
import Card, { CardBody } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import axios from 'axios';
import { Trash2, X } from 'lucide-react';

const JobTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('Applied');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusColors = {
    'Saved': 'bg-slate-700 text-slate-700 dark:text-slate-300',
    'Applied': 'bg-blue-900/30 text-blue-400',
    'Interviewing': 'bg-amber-900/30 text-amber-400',
    'Rejected': 'bg-red-900/30 text-red-400',
    'Offered': 'bg-emerald-900/30 text-emerald-400',
  };

  const fetchJobs = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const { data } = await axios.get('/api/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAddJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.post('/api/jobs', 
        { company, role, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setCompany('');
      setRole('');
      setStatus('Applied');
      fetchJobs();
    } catch (error) {
      console.error('Failed to add job', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.delete(`/api/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-600 dark:text-slate-400">Loading your applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Job Tracker</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Keep track of your internship and job applications.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>Add Application</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Date Applied</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-600 dark:text-slate-400">
                    No applications yet. Click "Add Application" to get started!
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{job.company}</td>
                    <td className="px-6 py-4">{job.role}</td>
                    <td className="px-6 py-4">{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[job.status] || 'bg-slate-700'}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(job._id)}
                        className="text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardBody>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Application</h2>
                <button onClick={() => setShowModal(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleAddJob} className="space-y-4">
                <Input
                  label="Company Name"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                />
                
                <Input
                  label="Role"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-shadow"
                  >
                    <option value="Saved">Saved</option>
                    <option value="Applied">Applied</option>
                    <option value="Interviewing">Interviewing</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Offered">Offered</option>
                  </select>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Application'}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default JobTracker;
