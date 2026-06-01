import { useState, useEffect } from 'react';
import api from '../api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .catch(err => console.error(err));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'error': return { icon: 'warning', color: 'text-error', bg: 'bg-error-container/40' };
      case 'warning': return { icon: 'error', color: 'text-tertiary', bg: 'bg-tertiary-fixed-dim/20' };
      default: return { icon: 'info', color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  return (
    <section className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">System Alerts</h2>
        <p className="text-on-surface-variant mt-2 font-body">Recent system events and maintenance alerts.</p>
      </div>

      <div className="space-y-4">
        {notifications.map(notif => {
          const { icon, color, bg } = getIcon(notif.type);
          return (
            <div key={notif.id} className="flex gap-6 p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 items-start">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-on-surface">{notif.title}</h3>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">{notif.time}</span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">{notif.message}</p>
                {notif.type === 'error' && (
                  <button className="mt-4 px-4 py-2 bg-error text-on-error rounded-lg text-sm font-bold shadow-sm hover:opacity-90">Investigate Issue</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
