import { useState, useEffect } from 'react';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_capacity: 120,
    active_sessions: 0,
    entries_today: 0,
    exits_today: 0,
    avg_dwell_time_mins: 0,
    recent_logs: []
  });

  const fetchStats = async () => {
    try {
      const parkingName = localStorage.getItem('parking_name');
      const res = await api.get(`/dashboard/stats?parking_name=${parkingName}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalCapacity = stats.total_capacity || 120;
  const occupancyPercent = ((stats.active_sessions / totalCapacity) * 100).toFixed(1);

  const parkingName = localStorage.getItem('parking_name') || 'Parking Facility';

  return (
    <section className="p-8 space-y-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold font-headline">{parkingName}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-sm relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="text-on-surface-variant font-medium text-sm tracking-wide uppercase">Facility Occupancy</span>
              <div className="flex items-baseline gap-4 mt-2">
                <h2 className="text-5xl md:text-6xl font-extrabold text-primary font-headline">{occupancyPercent}%</h2>
                <span className="text-secondary font-bold flex items-center gap-1 text-sm">
                  <span className="material-symbols-outlined text-sm" data-icon="trending_up">trending_up</span> Live
                </span>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-4">
              <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${occupancyPercent}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">{stats.active_sessions} Active Sessions</span>
                <span className="text-on-surface-variant font-medium">{totalCapacity - stats.active_sessions} Available Spots</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:scale-110 transition-transform"></div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary" data-icon="confirmation_number">login</span>
            </div>
            <span className="text-on-surface-variant font-medium text-xs uppercase">Today&#39;s Entries</span>
            <h3 className="text-2xl font-bold font-headline mt-1">{stats.entries_today}</h3>
          </div>
        </div>

        <div className="bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary" data-icon="confirmation_number">logout</span>
            </div>
            <span className="text-on-surface-variant font-medium text-xs uppercase">Today&#39;s Exits</span>
            <h3 className="text-2xl font-bold font-headline mt-1">{stats.exits_today}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-high p-8 rounded-xl flex flex-col gap-6">
          <div>
            <h3 className="text-xl font-bold font-headline mb-2">Facility Summary</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">High-level operational metrics and critical system health.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg border-l-4 border-primary">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">Avg. Dwell Time</p>
                <p className="text-lg font-bold">
                  {Math.floor(stats.avg_dwell_time_mins / 60)}h {Math.round(stats.avg_dwell_time_mins % 60)}m
                </p>
              </div>
              <span className="material-symbols-outlined text-primary/40" data-icon="schedule">schedule</span>
            </div>
          </div>
          <div className="mt-auto bg-surface/50 rounded-lg p-4 border-l-4 border-secondary">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
              <span className="text-xs font-bold text-secondary uppercase">System LPR Active</span>
            </div>
            <p className="text-[10px] text-on-surface-variant">Cameras are detecting vehicles normally.</p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold font-headline">Live Event Stream</h3>
          </div>
          <div className="space-y-0 flex-1 overflow-y-auto max-h-[300px]">
            {stats.recent_logs.map((log, i) => (
              <div key={log._id || i} className="px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors border-t border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${log.status === 'inside' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    <span className="material-symbols-outlined">{log.status === 'inside' ? 'login' : 'logout'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{log.plate_text}</p>
                    <p className="text-xs text-on-surface-variant">
                      {log.status === 'inside' 
                        ? `Entry: ${new Date(log.entry_time).toLocaleTimeString()}`
                        : `Exit: ${new Date(log.exit_time).toLocaleTimeString()}`
                      }
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-on-surface-variant uppercase">{log.status}</span>
              </div>
            ))}
            {stats.recent_logs.length === 0 && (
              <div className="p-6 text-center text-sm text-on-surface-variant">No recent events.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
