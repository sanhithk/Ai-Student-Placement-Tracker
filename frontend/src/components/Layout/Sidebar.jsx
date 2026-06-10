import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Briefcase, Code, Compass, Video, Settings, LogOut, Sparkles, Zap, X, Trophy, Target, Building2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';


const Sidebar = ({ onClose }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Placement Readiness', path: '/readiness', icon: <Target size={20} className="text-emerald-400" /> },
    { name: 'Company Hub', path: '/companies', icon: <Building2 size={20} className="text-sky-400" /> },
    { name: 'Resume Analyzer', path: '/resume', icon: <FileText size={20} /> },
    { name: 'Mock Interview', path: '/interview', icon: <Video size={20} /> },
    { name: 'Roadmap', path: '/roadmap', icon: <Compass size={20} /> },
    { name: 'Discover Jobs', path: '/discover', icon: <Sparkles size={20} className="text-primary-400" /> },
    { name: 'Job Tracker', path: '/jobs', icon: <Briefcase size={20} /> },
    { name: 'Coding Stats', path: '/coding', icon: <Code size={20} /> },
    { name: 'Proof of Work', path: '/pow', icon: <Zap size={20} className="text-amber-400" /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} className="text-yellow-400" /> },
  ];


  return (
    <aside className="w-72 md:w-64 bg-white dark:bg-slate-900 md:bg-white/80 md:dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 flex flex-col shadow-2xl md:shadow-none transition-colors duration-300">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          >
            <Compass className="text-primary-500" />
          </motion.div>
          Placement AI
        </h1>
        <button onClick={onClose} className="md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2">
          <X size={24} />
        </button>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-base md:text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
              }`
            }
          >
            <motion.div
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {item.icon}
            </motion.div>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="space-y-2">
          <button onClick={toggleTheme} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base md:text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200 transition-colors">
            <motion.div whileHover={{ scale: 1.2, rotate: 180 }} transition={{ type: "spring", stiffness: 400 }}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-xl text-base md:text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-200'
              }`
            }
          >
            <motion.div whileHover={{ scale: 1.2, rotate: 90 }} transition={{ type: "spring", stiffness: 400 }}>
              <Settings size={20} />
            </motion.div>
            Settings
          </NavLink>
          <button onClick={() => { logout(); onClose?.(); }} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-base md:text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-500 transition-colors">
            <motion.div whileHover={{ scale: 1.2, x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
              <LogOut size={20} />
            </motion.div>
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
