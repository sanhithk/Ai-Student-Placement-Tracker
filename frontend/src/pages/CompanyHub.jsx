import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Card, { CardBody } from '../components/UI/Card';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const CompanyHub = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        const res = await axios.get('/api/companies', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCompanies(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) return <div className="text-slate-600 dark:text-slate-400 text-center py-20">Loading Top Companies...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary-900/30 text-primary-400 text-sm font-medium border border-primary-900/50 mb-2">
          <Building2 size={16} className="mr-2" /> Target Your Dream Company
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Company Prep Hub</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Detailed hiring workflows, recommended topics, and personalized readiness matching for top tech companies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {companies.map((company, idx) => (
          <Link to={`/company/${company.id}`} key={company.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="h-full"
            >
              <Card className="h-full bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50/80 dark:bg-slate-800/80 hover:border-primary-500/50 transition-all duration-300 cursor-pointer group">
                <CardBody className="p-6 flex flex-col items-center text-center h-full">
                  <div className="w-20 h-20 bg-white rounded-2xl p-4 flex items-center justify-center shadow-lg shadow-black/50 mb-6">
                    <img src={company.logoUrl} alt={company.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-400 transition-colors">{company.name}</h2>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-full mb-4">
                    {company.tier}
                  </span>
                  
                  <div className="mt-auto w-full border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between">
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Difficulty</span>
                      <div className="flex items-center gap-1">
                        <ShieldCheck size={14} className={company.difficultyScore > 80 ? "text-red-400" : company.difficultyScore > 65 ? "text-amber-400" : "text-emerald-400"} />
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{company.difficultyScore}/100</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CompanyHub;
