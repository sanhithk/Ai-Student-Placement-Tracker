import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobTracker from './pages/JobTracker';
import JobMatch from './pages/JobMatch';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import CodingStats from './pages/CodingStats';
import Roadmap from './pages/Roadmap';
import MockInterview from './pages/MockInterview';
import ProofOfWork from './pages/ProofOfWork';
import Leaderboard from './pages/Leaderboard';

function App() {

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="discover" element={<JobMatch />} />
            <Route path="jobs" element={<JobTracker />} />
            <Route path="coding" element={<CodingStats />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="interview" element={<MockInterview />} />
            <Route path="pow" element={<ProofOfWork />} />
            <Route path="settings" element={<Settings />} />
            <Route path="leaderboard" element={<Leaderboard />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
