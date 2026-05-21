import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/apiClient';
import { isLoggedIn } from '../services/userService';

function Prescriptions() {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    load();
  }, [navigate]);

  async function load() {
    try {
      setListLoading(true);
      const { data } = await api.get('/prescriptions/my-prescriptions');
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setPrescriptions([]);
    } finally {
      setListLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fileUrl?.trim()) return;
    setLoading(true);
    try {
      await api.post('/prescriptions', { fileUrl: fileUrl.trim() });
      setFileUrl('');
      load();
    } catch (err) {
      console.error(err);
      alert('Failed to upload. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn()) return null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-semibold text-white">My prescriptions</h1>
      <form onSubmit={handleSubmit} className="panel mb-8 space-y-4 p-6">
        <div>
          <label className="block text-xs font-medium text-gray-300">Prescription image URL</label>
          <input
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/prescription.jpg"
            className="input mt-1"
          />
          <p className="hint mt-1">
            Paste a public URL to your prescription image. Our team will review it.
          </p>
        </div>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? 'Submitting…' : 'Submit prescription'}
        </button>
      </form>
      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Submitted prescriptions</h2>
        {listLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : prescriptions.length === 0 ? (
          <p className="text-sm text-gray-400">No prescriptions yet.</p>
        ) : (
          <div className="space-y-2">
            {prescriptions.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827] px-4 py-3 shadow-sm"
              >
                <div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      p.status === 'APPROVED'
                        ? 'bg-green-500/15 text-green-200'
                        : p.status === 'REJECTED'
                        ? 'bg-red-500/15 text-red-200'
                        : 'bg-amber-500/15 text-amber-200'
                    }`}
                  >
                    {p.status}
                  </span>
                  {p.adminNotes && (
                    <span className="ml-2 text-xs text-gray-400">– {p.adminNotes}</span>
                  )}
                </div>
                {p.fileUrl && (
                  <a
                    href={p.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Prescriptions;
