import { useState, useEffect } from 'react';
import api from '../api';

export default function LiveOccupancy() {
  const [sessions, setSessions] = useState([]);
  const [totalCapacity, setTotalCapacity] = useState(120);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const parkingName = localStorage.getItem('parking_name');
      const res = await api.get(`/occupancy/live?parking_name=${parkingName}`);
      setSessions(res.data.sessions || []);
      setTotalCapacity(res.data.total_capacity || 120);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 5000);
    return () => clearInterval(interval);
  }, []);

  const occupancyPercent = totalCapacity > 0 ? ((sessions.length / totalCapacity) * 100).toFixed(1) : 0;

  const calculateDuration = (entryTimeStr) => {
    const entry = new Date(entryTimeStr);
    const now = new Date();
    const diffInMins = Math.floor((now - entry) / 60000);
    const h = Math.floor(diffInMins / 60);
    const m = diffInMins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline text-on-surface tracking-tight">Live Occupancy</h2>
          <p className="text-on-surface-variant mt-1">Real-time status of {totalCapacity} parking bays across the facility.</p>
        </div>
        <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-6 shadow-sm border border-outline-variant/10">
          <div className="relative flex items-center justify-center w-16 h-16 bg-surface-container-high rounded-full">
            <span className="text-xs font-extrabold font-headline text-primary">{occupancyPercent}%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-label">Total Occupancy</p>
            <p className="text-xl font-extrabold font-headline">{sessions.length} / {totalCapacity}</p>
            <p className="text-[10px] text-secondary font-bold">{totalCapacity - sessions.length} Slots Available</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold font-headline">Active Parking Sessions</h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{sessions.length} LIVE</span>
          </div>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors" onClick={fetchLive}>
            <span className="material-symbols-outlined text-xl" data-icon="refresh">refresh</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Vehicle Plate</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Entry Details</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant font-label text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {sessions.map((s) => (
                  <tr key={s._id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] font-mono border border-slate-300">IND</div>
                        <span className="font-mono font-medium text-lg">{s.plate_text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col text-sm">
                        <span className="text-on-surface font-medium">{new Date(s.entry_time).toLocaleTimeString()}</span>
                        <span className="text-[10px] text-on-surface-variant capitalize">{s.source || 'Cam'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-sm font-medium">
                      {calculateDuration(s.entry_time)}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded">Inside</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="px-3 py-1.5 bg-surface-container hover:bg-primary hover:text-on-primary rounded text-xs font-bold transition-all">Details</button>
                    </td>
                  </tr>
                ))}
                {!loading && sessions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-on-surface-variant">
                      No live sessions active right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
