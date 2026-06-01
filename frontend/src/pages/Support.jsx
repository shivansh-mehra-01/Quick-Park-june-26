export default function Support() {
  return (
    <section className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">Need Help?</h2>
        <p className="text-on-surface-variant mt-2 font-body">Contact the infrastructure team or consult the FAQ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/10">
          <h3 className="text-xl font-bold font-headline mb-6">Contact IT Operations</h3>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-xs font-bold mb-1">Issue Category</label>
              <select className="w-full p-2.5 rounded-lg border-none bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none">
                <option>LPR Camera Offline</option>
                <option>Database Sync Error</option>
                <option>Gate Actuator Fault</option>
                <option>Other Firmware Issue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Description</label>
              <textarea rows="4" className="w-full p-2.5 rounded-lg border-none bg-surface-container-low text-sm focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="Explain the hardware or software issue..."></textarea>
            </div>
            <button className="w-full py-3 bg-secondary text-on-secondary font-bold rounded-lg hover:opacity-90">Submit Ticket</button>
          </form>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold font-headline mb-4">Quick Documentation</h3>
          
          <div className="p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
            <h4 className="font-bold flex items-center justify-between">
              ResetTING an LPR Camera 
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </h4>
          </div>
          
          <div className="p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
            <h4 className="font-bold flex items-center justify-between">
              Manual Override for Gate B
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </h4>
          </div>
          
          <div className="p-4 bg-surface-container rounded-xl cursor-pointer hover:bg-surface-container-high transition-colors">
            <h4 className="font-bold flex items-center justify-between">
              Calibrating OCR Confidence Thresholds
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </h4>
          </div>
        </div>
      </div>
    </section>
  );
}
