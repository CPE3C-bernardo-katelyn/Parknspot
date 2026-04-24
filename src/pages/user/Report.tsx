import React from 'react';
import { CheckCircle2, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Report() {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [locations, setLocations] = React.useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = React.useState(true);

  const [form, setForm] = React.useState({
    location: '',
    status: 'available',
    notes: '',
  });

  // Fetch locations from API
  React.useEffect(() => {
    fetch(`${API_URL}/api/parking/cached`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          // Get unique development names
          const unique = [...new Set(data.data.map((spot: any) => spot.development))] as string[];
          setLocations(unique);
          setForm(prev => ({ ...prev, location: unique[0] })); // set default to first
        }
      })
      .catch(err => console.error('Failed to fetch locations', err))
      .finally(() => setLocationsLoading(false));
  }, []);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to submit a report.');
      setLoading(false);
      return;
    }

    const statusMap: Record<string, string> = {
      available: 'Parking Available',
      full: 'Parking Full',
      incorrect: 'Incorrect Parking Info',
    };

    try {
      const res = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: statusMap[form.status],
          description: form.notes || `User reported: ${statusMap[form.status]} at ${form.location}`,
          location: form.location,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit report');

      setSubmitted(true);
      setForm(prev => ({ ...prev, status: 'available', notes: '' }));
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-32 px-6 max-w-4xl mx-auto min-h-screen">
      <header className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-4">Help Make Park 'n Spot Better</h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">Report real-time parking availability at your location to help keep the data accurate and reliable.</p>
      </header>

      <section className="flex justify-center mb-4">
        <div className="w-full max-w-2xl bg-surface-container-low rounded-xl p-8 shadow-sm">
          <div className="space-y-8">

            {/* Location */}
            <div className="space-y-2">
              <label className="block font-headline text-sm font-bold tracking-widest uppercase text-[#330000]">Location</label>
              <div className="relative">
                <select
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  disabled={locationsLoading}
                  className="w-full bg-surface-container-high border-none rounded-sm py-4 px-5 text-on-surface focus:ring-1 focus:ring-outline appearance-none disabled:opacity-50">
                  {locationsLoading ? (
                    <option>Loading locations...</option>
                  ) : locations.length === 0 ? (
                    <option>No locations available</option>
                  ) : (
                    locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))
                  )}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-on-surface-variant">
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <label className="block font-headline text-sm font-bold tracking-widest uppercase text-[#330000]">Reported Status</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'available', label: 'Available', desc: 'Facilities are open and under capacity.' },
                  { value: 'full', label: 'Full', desc: 'Capacity reached. No further access.' },
                  { value: 'incorrect', label: 'Incorrect Info', desc: 'Digital data conflicts with physical site.' },
                ].map((option) => (
                  <label
                    key={option.value}
                    onClick={() => setForm({ ...form, status: option.value })}
                    className={`relative flex flex-col p-5 bg-surface-container-lowest rounded-md cursor-pointer border-l-4 border-[#660000] hover:bg-surface-container-highest transition-all ${form.status === option.value ? 'ring-2 ring-[#660000]' : ''}`}>
                    <span className="font-headline font-bold text-on-surface mb-1">{option.label}</span>
                    <span className="text-xs text-on-surface-variant">{option.desc}</span>
                    {form.status === option.value && (
                      <div className="absolute top-4 right-4 text-[#660000]">
                        <CheckCircle2 size={18} fill="currentColor" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block font-headline text-sm font-bold tracking-widest uppercase text-[#330000]">Additional Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-surface-container-high border-none rounded-sm py-4 px-5 text-on-surface focus:ring-1 focus:ring-outline placeholder:text-on-surface-variant/50"
                placeholder="Describe the current situation..."
                rows={4}
              />
            </div>

            {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

            {submitted && (
              <p className="text-[#330000] text-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> Report submitted! Your update helps keep parking information accurate.
              </p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || submitted || locationsLoading}
              className="w-full md:w-auto px-12 py-4 bg-primary-container text-white font-headline font-bold rounded-sm hover:bg-primary transition-all duration-300 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit Report'}
            </button>

          </div>
        </div>
      </section>
    </main>
  );
}