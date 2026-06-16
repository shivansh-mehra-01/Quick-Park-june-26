import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search') || '';
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchBookings = async () => {
    try {
      const parkingName = localStorage.getItem('parking_name');
      const res = await api.get(`/bookings/today?parking_name=${parkingName}`);
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredBookings = bookings.filter(b => 
    b.plate_text.toLowerCase().includes(query.toLowerCase())
  );

  const handleExport = () => {
    const parkingName = localStorage.getItem('parking_name');
    window.open(`${api.defaults.baseURL}/bookings/export?parking_name=${parkingName}&start_date=${startDate}&end_date=${endDate}`, '_blank');
  };

  return (
    <section className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Today&#39;s History</h2>
          <p className="text-on-surface-variant mt-2 font-body">Viewing {filteredBookings.length} LPR logs for today. {query && <span className="text-primary font-bold">Search: "{query}"</span>}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 bg-surface-container-lowest p-2 rounded-xl shadow-sm border border-outline-variant/10">
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-surface-container-low rounded-lg p-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-bold text-on-surface h-10 w-36"
            title="Start Date"
          />
          <span className="text-on-surface-variant font-bold text-sm px-1">to</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-surface-container-low rounded-lg p-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-bold text-on-surface h-10 w-36"
            title="End Date"
          />
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 h-10 bg-primary text-on-primary rounded-lg font-bold shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            CSV Range
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {!loading && filteredBookings.length === 0 && (
            <div className="p-6 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/10">No matching logs found for that plate.</div>
          )}
          {filteredBookings.map((b) => (
            <div key={b._id} className="group flex items-center p-6 bg-surface-container-lowest rounded-xl hover:bg-surface-container-low transition-all cursor-pointer shadow-sm">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${b.status === 'exited' ? 'bg-outline-variant/20 text-on-surface-variant' : 'bg-primary/10 text-primary'}`}>
                <span className="material-symbols-outlined" data-icon="directions_car">directions_car</span>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-on-surface tracking-widest">{b.plate_text}</h3>
                  <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant text-[10px] font-bold rounded uppercase tracking-wider">LPR SCAN</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">
                  Entry: {new Date(b.entry_time).toLocaleTimeString()}
                  {b.status === 'exited' && ` — Exit: ${new Date(b.exit_time).toLocaleTimeString()} (${Math.round(b.duration_mins)}m)`}
                </p>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${b.status === 'exited' ? 'bg-surface-container-high text-on-surface-variant' : 'bg-secondary/10 text-secondary'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${b.status === 'exited' ? 'bg-on-surface-variant' : 'bg-secondary'}`}></span>
                    {b.status === 'exited' ? 'Completed' : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container rounded-2xl p-6 space-y-6">
            <h4 className="font-bold text-on-surface font-headline">Arrival Momentum</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">LPR Vehicles Processed</span>
                <span className="text-sm font-bold">{bookings.length}</span>
              </div>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, bookings.length)}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
