import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api';

export default function Layout() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [appContext, setAppContext] = useState({ name: 'Loading...', role: 'Facility Manager', facility_name: 'Smart Parking' });

  useEffect(() => {
    const parkingName = localStorage.getItem('parking_name');
    api.get(`/profile?parking_name=${parkingName}`)
      .then(res => setAppContext(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        navigate(`/bookings?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/bookings`);
      }
      setSearchQuery('');
    }
  };
  return (
    <>
      <aside className="hidden md:flex flex-col h-screen w-64 border-r-0 bg-slate-50 dark:bg-slate-900 sticky top-0 py-6 shrink-0">
        <div className="px-6 mb-8">
          <h1 className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-headline">Indigo Orbit</h1>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Facility Manager</p>
        </div>
        <nav className="flex-1 space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium'
              }`
            }
          >
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="text-sm Inter">Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/live"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium'
              }`
            }
          >
            <span className="material-symbols-outlined" data-icon="sensors" style={{fontVariationSettings: "'FILL' 1"}}>sensors</span>
            <span className="text-sm Inter">Live Occupancy</span>
          </NavLink>

          <NavLink
            to="/bookings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium'
              }`
            }
          >
            <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
            <span className="text-sm Inter">Parking Logs</span>
          </NavLink>
          
          <NavLink
            to="/support"
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 transition-colors ${
                isActive
                  ? 'text-blue-700 dark:text-blue-400 font-bold border-r-4 border-blue-700 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium'
              }`
            }
          >
            <span className="material-symbols-outlined" data-icon="help">help</span>
            <span className="text-sm Inter">Support</span>
          </NavLink>
        </nav>
        <div className="px-6 pt-6 mt-auto space-y-2">
          <NavLink to="/profile" className={({ isActive }) => `flex items-center space-x-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-blue-500/20">
                <span className="material-symbols-outlined text-white text-lg">local_parking</span>
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{appContext.facility_name}</p>
              <p className="text-[10px] font-medium text-slate-500 truncate">{appContext.address || 'Loading Location...'}</p>
            </div>
          </NavLink>
          <button 
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('parking_name');
              window.location.href = '/';
            }} 
            className="w-full flex items-center space-x-3 p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">logout</span>
            </div>
            <p className="text-xs font-bold text-left flex-1">Logout</p>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center w-full px-8 py-4 sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="flex items-center gap-6 flex-1 max-w-2xl">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-50 font-headline hidden md:block whitespace-nowrap">{appContext.facility_name}</span>
            <div className="relative flex-1 group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" data-icon="search">search</span>
              <input 
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest rounded-lg border-none focus:ring-2 focus:ring-primary/40 text-sm transition-all shadow-sm outline-none" 
                placeholder="Search precise license plate and press Enter..." 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>
          <div className="flex items-center gap-4 ml-8">
            <NavLink to="/notifications" className={({isActive}) => `p-2 transition-opacity ${isActive ? 'text-blue-600 bg-blue-50 rounded-full' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-full opacity-90'}`}>
              <span className="material-symbols-outlined" data-icon="notifications">notifications</span>
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => `p-2 transition-opacity ${isActive ? 'text-blue-600 bg-blue-50 rounded-full' : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-full opacity-90'}`}>
              <span className="material-symbols-outlined" data-icon="settings">settings</span>
            </NavLink>
          </div>
        </header>

        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/70 glass-panel border-none z-50 flex justify-around items-center py-4 px-2 shadow-2xl">
        <NavLink to="/" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="text-[10px] font-bold">Dash</span>
        </NavLink>
        <NavLink to="/live" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined" data-icon="sensors">sensors</span>
          <span className="text-[10px] font-bold">Live</span>
        </NavLink>
        <NavLink to="/bookings" className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-blue-700' : 'text-slate-500'}`}>
          <span className="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
          <span className="text-[10px] font-bold">Logs</span>
        </NavLink>
        <button onClick={() => window.location.reload()} className="flex flex-col items-center gap-1 text-red-500">
          <span className="material-symbols-outlined" data-icon="logout">logout</span>
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </nav>
    </>
  );
}
