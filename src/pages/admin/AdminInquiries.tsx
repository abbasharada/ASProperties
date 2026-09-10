import { useEffect, useState, useCallback } from 'react';
import { Mail, Phone, Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';
import { formatDateTime, timeAgo } from '../../lib/utils';

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);

  const loadInquiries = useCallback(async () => {
    let query = supabase.from('inquiries').select('*');
    if (filter === 'new') query = query.eq('status', 'new');
    if (filter === 'read') query = query.eq('status', 'read');
    if (filter === 'responded') query = query.eq('status', 'responded');
    query = query.order('created_at', { ascending: false });
    const { data } = await query;
    setInquiries(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadInquiries(); }, [loadInquiries]);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('inquiries').update({ status }).eq('id', id);
    loadInquiries();
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('inquiries').delete().eq('id', id);
    loadInquiries();
    setSelected(null);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-error-100 text-error-700',
      read: 'bg-accent-100 text-accent-700',
      responded: 'bg-success-100 text-success-700',
    };
    return styles[status] || 'bg-neutral-100 text-neutral-600';
  };

  return (
    <AdminLayout title="Inquiry Management">
      <div className="flex gap-2 mb-6">
        {['all', 'new', 'read', 'responded'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {f} {f === 'all' ? `(${inquiries.length})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : inquiries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {inq.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{inq.name}</p>
                    <p className="text-xs text-neutral-400">{timeAgo(inq.created_at)}</p>
                  </div>
                </div>
                <span className={`badge ${statusBadge(inq.status)}`}>{inq.status}</span>
              </div>
              <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{inq.message}</p>
              <div className="flex flex-wrap gap-3 text-xs text-neutral-500 mb-3">
                {inq.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {inq.phone}</span>}
                {inq.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {inq.email}</span>}
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDateTime(inq.created_at)}</span>
              </div>
              <div className="flex gap-2 pt-3 border-t border-neutral-100">
                <button onClick={() => { setSelected(inq); if (inq.status === 'new') updateStatus(inq.id, 'read'); }} className="btn-ghost text-sm flex-1">View Details</button>
                <button onClick={() => updateStatus(inq.id, 'responded')} className="p-2 text-success-600 hover:bg-success-50 rounded-lg" title="Mark Responded"><CheckCircle className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(inq.id)} className="p-2 text-error-600 hover:bg-error-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Mail className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">No inquiries found.</p>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">{selected.name}</h3>
                <span className={`badge ${statusBadge(selected.status)} mt-1`}>{selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-neutral-400 hover:text-neutral-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-4">
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"><Phone className="w-4 h-4" /> {selected.phone}</a>
              )}
              {selected.email && (
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600"><Mail className="w-4 h-4" /> {selected.email}</a>
              )}
              <p className="text-xs text-neutral-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDateTime(selected.created_at)}</p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-neutral-700">{selected.message}</p>
            </div>
            <div className="flex gap-2">
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 text-sm">Reply on WhatsApp</a>
              )}
              <button onClick={() => updateStatus(selected.id, 'responded')} className="btn-outline text-sm">Mark Responded</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
