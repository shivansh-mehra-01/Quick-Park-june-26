import { useState, useEffect } from 'react';
import api from '../api';

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  const fetchPricing = () => {
    api.get('/pricing')
      .then(res => setPlans(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleEdit = (plan) => {
    setEditingId(plan._id);
    setEditForm({ ...plan });
  };

  const handleSave = async (id) => {
    try {
      await api.put(`/pricing/${id}`, {
        type: editForm.type,
        rate: editForm.rate,
        description: editForm.description,
        active: editForm.active
      });
      setEditingId(null);
      fetchPricing(); // Refresh the data
    } catch (err) {
      console.error(err);
      alert('Failed to update pricing plan');
    }
  };

  return (
    <section className="p-8 space-y-8">
      <div>
        <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Pricing Plans</h2>
        <p className="text-on-surface-variant mt-2 font-body">Manage current active tariff configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map(plan => (
          <div key={plan._id} className={`p-6 rounded-2xl flex flex-col justify-between shadow-sm border transition-colors ${editingId === plan._id ? 'bg-white border-primary ring-2 ring-primary/20' : 'bg-surface-container-lowest border-outline-variant/10 hover:border-primary/30'}`}>
            
            {editingId === plan._id ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Plan Type</label>
                  <input type="text" value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="mt-1 w-full bg-surface-container-low rounded-lg p-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-bold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Rate (Currency/Time)</label>
                  <input type="text" value={editForm.rate} onChange={e => setEditForm({...editForm, rate: e.target.value})} className="mt-1 w-full bg-surface-container-low rounded-lg p-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none font-extrabold text-primary" />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Description</label>
                  <textarea rows="2" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="mt-1 w-full bg-surface-container-low rounded-lg p-2 text-sm border-none focus:ring-2 focus:ring-primary outline-none resize-none" />
                </div>
                
                <div className="flex gap-2 mt-6">
                  <button onClick={() => handleSave(plan._id)} className="flex-1 py-3 px-4 rounded-lg bg-primary text-on-primary font-bold shadow-sm hover:opacity-90">Save</button>
                  <button onClick={() => setEditingId(null)} className="py-3 px-4 rounded-lg bg-surface-container-high text-on-surface font-bold hover:bg-surface-container-highest">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <span className="inline-block px-3 py-1 bg-surface-container text-xs font-bold rounded-full mb-4">{plan.type}</span>
                  <h3 className="text-3xl font-extrabold font-headline text-primary mb-2">{plan.rate}</h3>
                  <p className="text-sm text-on-surface-variant h-12">{plan.description}</p>
                </div>
                <button onClick={() => handleEdit(plan)} className="mt-8 w-full py-3 rounded-lg bg-surface-container-high text-on-surface font-bold hover:bg-primary hover:text-on-primary transition-colors">
                  Edit Tariff
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
