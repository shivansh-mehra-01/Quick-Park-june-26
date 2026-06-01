import { useState, useEffect } from 'react';
import api from '../api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const fetchProfile = () => {
    api.get('/profile')
      .then(res => setProfile(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/profile', {
        name: editForm.name,
        address: editForm.address,
        totalSlots: editForm.totalSlots,
        availableSlots: editForm.availableSlots
      });
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  if (!profile) return null;

  return (
    <section className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Facility Setup</h2>
        <p className="text-on-surface-variant mt-2 font-body">Manage specific details about the connected parking facility.</p>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm flex flex-col md:flex-row gap-8 items-start border border-outline-variant/10">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-surface-container-high border-4 border-white shadow-lg shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant">local_parking</span>
        </div>
        
        <div className="flex-1 w-full">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Facility Name</label>
                  <input required type="text" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-surface-container-low rounded-lg p-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Physical Address</label>
                  <input required type="text" value={editForm.address || ''} onChange={e => setEditForm({...editForm, address: e.target.value})} className="w-full bg-surface-container-low rounded-lg p-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-medium text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Total Capacity Slots</label>
                  <input required type="number" min="0" value={editForm.totalSlots || 0} onChange={e => setEditForm({...editForm, totalSlots: e.target.value})} className="w-full bg-surface-container-low rounded-lg p-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Available Free Slots</label>
                  <input required type="number" min="0" value={editForm.availableSlots || 0} onChange={e => setEditForm({...editForm, availableSlots: e.target.value})} className="w-full bg-surface-container-low rounded-lg p-3 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-medium" />
                </div>
              </div>
              
              <div className="pt-6 border-t border-outline-variant/10 flex gap-4">
                <button type="submit" className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity">Save Facility Data</button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 bg-surface-container-high text-on-surface font-bold rounded-lg hover:bg-surface-container-highest transition-colors">Cancel</button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-3xl font-extrabold font-headline text-on-surface">{profile.name || "Unnamed Facility"}</h3>
                <p className="text-primary font-bold">{profile.address || "Address Not Available"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">Total Capacity Slots</p>
                  <p className="font-medium bg-surface-container-lowest py-2 text-xl">{profile.totalSlots || 0}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-secondary uppercase mb-1">Current Active Free Slots</p>
                  <p className="font-bold text-secondary bg-surface-container-lowest py-2 text-xl">{profile.availableSlots || 0}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-outline-variant/10 flex flex-col sm:flex-row gap-4">
                <button onClick={handleEdit} className="px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-on-primary transition-colors">Edit Facility Specs</button>
                
                <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-red-100 dark:bg-red-900/20 text-red-600 font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">logout</span> User Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
