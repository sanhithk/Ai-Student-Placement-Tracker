import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../components/UI/Card';
import Input from '../components/UI/Input';
import Button from '../components/UI/Button';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Code, User, CheckCircle } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [leetcode, setLeetcode] = useState('');
  const [codeforces, setCodeforces] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch initial profile
    const fetchProfile = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const { data } = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.codingProfiles?.leetcode) {
          setLeetcode(data.codingProfiles.leetcode);
        }
        if (data.codingProfiles?.codeforces) {
          setCodeforces(data.codingProfiles.codeforces);
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      await axios.put('/api/users/profile', {
        leetcodeUsername: leetcode,
        codeforcesUsername: codeforces
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <SettingsIcon size={32} className="text-primary-500" />
          Settings
        </h1>
        <p className="text-slate-400 mt-1">Manage your account preferences and linked profiles.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <User size={20} className="text-primary-500" />
            Account Information
          </h2>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-400">Name</p>
              <p className="text-base text-white font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Email Address</p>
              <p className="text-base text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Role</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-900/30 text-primary-400 capitalize mt-1">
                {user?.role}
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Code size={20} className="text-emerald-500" />
            Linked Coding Platforms
          </h2>
          <p className="text-sm text-slate-400 mt-1">Link your accounts to display real-time problem solving stats on your dashboard.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4 max-w-md">
            {success && (
              <div className="bg-emerald-900/30 text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                Profile updated successfully!
              </div>
            )}
            {error && (
              <div className="bg-red-900/30 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="LeetCode Username"
              type="text"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              placeholder="e.g. neetcode"
            />
            
            <Input
              label="Codeforces Handle"
              type="text"
              value={codeforces}
              onChange={(e) => setCodeforces(e.target.value)}
              placeholder="e.g. tourist"
            />
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Settings;
