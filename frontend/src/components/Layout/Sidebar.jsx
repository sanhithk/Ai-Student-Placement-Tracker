import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, Code, Compass, Video, Settings, LogOut, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


const Sidebar = () => {
  const { logout } = useAuth();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Discover Jobs', path: '/discover', icon: <Sparkles size={20} className="text-primary-400" /> },
    { name: 'Job Tracker', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Resume Analyzer', path: '/resume', icon: <FileText size={20} /> },
    { name: 'Coding Stats', path: '/coding', icon: <Code size={20} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Compass size={20} /> },
    { name: 'Proof of Work', path: '/pow', icon: <Zap size={20} className="text-amber-400" /> },
    { name: 'Mock Interview', path: '/interview', icon: <Video size={20} /> },
  ];


  return (
    <aside className="w-64 bg-slate-900/50 backdrop-blur-md border-r border-slate-800 h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Compass className="text-primary-500" />
          Placement AI
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-500/10 text-primary-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-500/10 text-primary-400' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`
            }
          >
            <Settings size={20} />
            Settings
          </NavLink>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
