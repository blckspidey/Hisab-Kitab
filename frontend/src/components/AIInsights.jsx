import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Sparkles } from 'lucide-react';

export default function AIInsights() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchInsight = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/insights/monthly');
      setMessage(res.data?.message || '');
    } catch {
      setError('Could not load insights right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-lime-400/10 dark:border-lime-400/20 shadow-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
          <h3 className="text-lg font-bold">AI Expense Insights</h3>
        </div>
        <button onClick={fetchInsight} className="px-3 py-1 rounded bg-lime-500/90 text-gray-900 text-sm hover:bg-lime-400">Refresh</button>
      </div>
      {loading ? (
        <div className="h-16 animate-pulse rounded-xl bg-lime-400/10" />
      ) : error ? (
        <div className="text-sm text-red-500">{error}</div>
      ) : (
        <p className="text-sm leading-6 text-gray-800 dark:text-gray-200">{message}</p>
      )}
    </div>
  );
}



