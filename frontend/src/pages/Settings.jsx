import { useState, useEffect } from 'react';

export default function Settings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [emailReports, setEmailReports] = useState(false);

  // Initialize Dark Mode state from DOM on mount
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    } else if (localStorage.getItem('theme') === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <section className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">System Settings</h2>
        <p className="text-on-surface-variant mt-2 font-body">Global dashboard parameters and preferences.</p>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10 space-y-8 transition-colors">
        
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between pb-6 border-b border-outline-variant/10">
          <div>
            <h4 className="text-lg font-bold font-headline text-on-surface">Dark Mode Theme</h4>
            <p className="text-sm text-on-surface-variant">Switch the interface between light and dark themes.</p>
          </div>
          <div 
            onClick={toggleDarkMode}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isDarkMode ? 'bg-primary' : 'bg-outline-variant'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isDarkMode ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>

        {/* Auto Refresh */}
        <div className="flex items-center justify-between pb-6 border-b border-outline-variant/10">
          <div>
            <h4 className="text-lg font-bold font-headline text-on-surface">Live Stream Auto-Refresh</h4>
            <p className="text-sm text-on-surface-variant">Ping the database every 5 seconds for new entry/exit records.</p>
          </div>
          <div 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${autoRefresh ? 'bg-primary' : 'bg-outline-variant'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${autoRefresh ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>

        {/* Daily Email Reports (Replaced OCR Threshold) */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-bold font-headline text-on-surface">Daily Email Reports</h4>
            <p className="text-sm text-on-surface-variant">Send a summary of occupancy and revenue to the manager's email at midnight.</p>
          </div>
          <div 
            onClick={() => setEmailReports(!emailReports)}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${emailReports ? 'bg-primary' : 'bg-outline-variant'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${emailReports ? 'right-1' : 'left-1'}`}></div>
          </div>
        </div>

      </div>
    </section>
  );
}
