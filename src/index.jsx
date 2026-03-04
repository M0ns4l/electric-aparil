import { useState, useEffect } from 'react';
import { Sun, Moon, } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import HeroSetion from "./components/Herosection";
import Cards from "./components/Cards";
import EncodeData from "./components/EncodeData";
import TableBill from "./components/TableBill";
import Footer from "./components/Footer";


export default function HeroSection() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('electric-bill-theme');
      return savedTheme || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('electric-bill-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    toast.success(`Switched to ${newTheme} mode`, {
      icon: newTheme === 'dark' ? '🌙' : '☀️',
      duration: 2000,
    });
  };
const [tableKey, setTableKey] = useState();
const [cardsKey, setcardsKey] = useState();
const [heroKey, setheroKey] = useState();

const handleBillSaved = () => {
  setTableKey(prev => prev + 1);
  setcardsKey(prev => prev + 1);
  setheroKey(prev => prev + 1);
};



  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: theme === 'dark' ? '#1e293b' : '#ffffff',
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          },
        }}
      />
     
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950 transition-colors duration-300">
        <nav className="border-b border-orange-200/30 dark:border-orange-900/20 backdrop-blur-sm bg-white/70 dark:bg-slate-950/50 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                  Electric Bill Monitoring
                </span>
              </div>
              
              <button
                onClick={toggleTheme}
                className="group relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700/80 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border border-orange-500/20"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 group-hover:text-orange-500 transition-colors" />
                ) : (
                  <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400 group-hover:text-orange-300 transition-colors" />
                )}
              </button>
            </div>
          </div>
        </nav>
        <HeroSetion key={heroKey}/>
        <Cards key={cardsKey}/>
        <EncodeData onBillSaved={handleBillSaved}/>
        <TableBill key={tableKey}/>
        <Footer />

      </div>
   
   
    </>
  );
}