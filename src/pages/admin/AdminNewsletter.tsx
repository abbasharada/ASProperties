import { useState, useEffect } from 'react';
import { Send, Mail, Trash2, Search, Users, Check } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { supabase } from '../../lib/supabase';
import type { NewsletterSubscriber } from '../../lib/types';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .then(({ data }) => {
        setSubscribers(data || []);
        setLoading(false);
      });
  }, []);

  const toggleActive = async (id: string, currentActive: boolean) => {
    await supabase.from('newsletter_subscribers').update({ is_active: !currentActive }).eq('id', id);
    setSubscribers((prev) => prev.map((s) => (s.id === id ? { ...s, is_active: !currentActive } : s)));
  };

  const removeSubscriber = async (id: string) => {
    await supabase.from('newsletter_subscribers').delete().eq('id', id);
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSent(false);

    const activeSubs = subscribers.filter((s) => s.is_active);
    if (activeSubs.length === 0) {
      setError('No active subscribers to send to.');
      setSending(false);
      return;
    }

    const { error: fnError } = await supabase.functions.invoke('send-newsletter', {
      body: { subject, body, subscriberIds: activeSubs.map((s) => s.id) },
    });

    if (fnError) {
      setError(fnError.message);
    } else {
      setSent(true);
      setSubject('');
      setBody('');
      setTimeout(() => setSent(false), 4000);
    }
    setSending(false);
  };

  const filtered = subscribers.filter(
    (s) => !search || s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Newsletter">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary-600" /> Compose Newsletter
          </h2>

          {error && (
            <div className="bg-error-50 text-error-600 text-sm p-3 rounded-lg mb-4">{error}</div>
          )}
          {sent && (
            <div className="bg-success-50 text-success-600 text-sm p-3 rounded-lg flex items-center gap-2 mb-4">
              <Check className="w-4 h-4" /> Newsletter sent successfully!
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field"
                placeholder="Newsletter subject..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
              <textarea
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="input-field resize-none"
                placeholder="Write your newsletter content here..."
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                Will be sent to <span className="font-semibold text-neutral-700">{subscribers.filter((s) => s.is_active).length}</span> active subscribers
              </p>
              <button type="submit" disabled={sending} className="btn-primary">
                {sending ? 'Sending...' : 'Send Newsletter'} <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Subscribers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" /> Subscribers
            </h2>
            <span className="text-sm text-neutral-500">{subscribers.length} total</span>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribers..."
              className="input-field pl-10 text-sm"
            />
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-neutral-200 rounded-xl" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">{sub.email}</p>
                    <p className="text-xs text-neutral-400">
                      {new Date(sub.subscribed_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleActive(sub.id, sub.is_active)}
                    className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                      sub.is_active ? 'bg-success-100 text-success-700' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {sub.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => removeSubscriber(sub.id)}
                    className="p-1.5 text-neutral-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                    aria-label="Remove subscriber"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
              <p className="text-neutral-500 text-sm">No subscribers yet.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
