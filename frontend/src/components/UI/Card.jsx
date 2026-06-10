import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '' }) => {
  return (
    <motion.div 
      whileHover={{ y: -2, boxShadow: '0 10px 30px -5px rgba(99, 102, 241, 0.15)' }}
      transition={{ duration: 0.2 }}
      className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-xl overflow-hidden transition-colors duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-slate-200 dark:border-slate-200/50 dark:border-slate-700/50 transition-colors duration-300 ${className}`}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export default Card;
