import { useState, useEffect } from 'react';
import api from '../api';

export default function Login({ onLogin }) {
  const [parkings, setParkings] = useState([]);
  const [selectedParking, setSelectedParking] = useState('');
  const [deviceKey, setDeviceKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/parkings')
      .then(res => {
        setParkings(res.data);
        if (res.data.length > 0) setSelectedParking(res.data[0]);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to connect to the server.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/auth/login', {
        parking_name: selectedParking,
        device_key: deviceKey
      });
      onLogin(selectedParking); // Pass the parking name back
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your Device Key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-surface">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[60%] bg-primary/10 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[55%] bg-secondary/10 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl shadow-xl relative z-10 border border-outline-variant/30 overflow-hidden">
        {/* Header Strip */}
        <div className="bg-primary/5 border-b border-outline-variant/20 px-8 py-7 text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-primary/20">
            <span className="material-symbols-outlined text-primary text-3xl">shield_lock</span>
          </div>
          <h2 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">Access Control</h2>
          <p className="mt-1 text-on-surface-variant font-semibold text-xs tracking-widest uppercase">Authenticate Terminal</p>
        </div>

        {/* Form Body */}
        <div className="px-8 py-7">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-error/10 text-error text-sm font-semibold flex rounded-xl items-center gap-2 border border-error/20">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            {/* Select Facility */}
            <div>
              <label htmlFor="parking" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Select Facility
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">location_city</span>
                <select
                  id="parking"
                  value={selectedParking}
                  onChange={(e) => setSelectedParking(e.target.value)}
                  className="w-full pl-11 pr-9 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all text-on-surface font-semibold appearance-none cursor-pointer hover:bg-surface-container"
                  required
                >
                  {parkings.length === 0 ? (
                    <option value="">Locating active facilities...</option>
                  ) : (
                    parkings.map(p => <option key={p} value={p}>{p}</option>)
                  )}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-lg">expand_more</span>
              </div>
            </div>

            {/* Hardware Key */}
            <div>
              <label htmlFor="device_key" className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Hardware Key
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">password</span>
                <input
                  id="device_key"
                  type="password"
                  value={deviceKey}
                  onChange={(e) => setDeviceKey(e.target.value)}
                  placeholder="Enter 12-digit terminal key"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-surface-container-low border border-outline-variant/40 rounded-xl text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all text-on-surface font-semibold hover:bg-surface-container"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedParking}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 mt-2 rounded-xl text-sm font-bold text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-4 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
              ) : (
                <span className="material-symbols-outlined text-lg">login</span>
              )}
              {loading ? 'Verifying...' : 'Authorize Access'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
