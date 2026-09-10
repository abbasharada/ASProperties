import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Star, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Testimonial } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: '', company: '', message: '', rating: 5, avatar_url: '', is_active: true });

  const load = useCallback(async () => {
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    setTestimonials(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from('testimonials').update(form).eq('id', editing.id);
    } else {
      await supabase.from('testimonials').insert(form);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', role: '', company: '', message: '', rating: 5, avatar_url: '', is_active: true });
    load();
  };

  const handleEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role, company: t.company, message: t.message, rating: t.rating, avatar_url: t.avatar_url, is_active: t.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('testimonials').delete().eq('id', id);
    load();
  };

  const toggleActive = async (t: Testimonial) => {
    await supabase.from('testimonials').update({ is_active: !t.is_active }).eq('id', t.id);
    load();
  };

  return (
    <AdminLayout title="Testimonials">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-neutral-500">{testimonials.length} testimonials</p>
        <button onClick={() => { setEditing(null); setForm({ name: '', role: '', company: '', message: '', rating: 5, avatar_url: '', is_active: true }); setShowForm(true); }} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Testimonial
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                {t.avatar_url ? <img src={t.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" /> : <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">{t.name.charAt(0)}</div>}
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}{t.company ? `, ${t.company}` : ''}</p>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-3 h-3 text-accent-500" fill="currentColor" />)}
                  </div>
                </div>
                <span className={`badge ${t.is_active ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>{t.is_active ? 'Active' : 'Hidden'}</span>
              </div>
              <p className="text-sm text-neutral-600 line-clamp-3 mb-3">{t.message}</p>
              <div className="flex gap-1 pt-3 border-t border-neutral-100">
                <button onClick={() => handleEdit(t)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                <button onClick={() => toggleActive(t)} className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg"><Star className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-neutral-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Role</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field" placeholder="e.g. Property Developer" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Company</label>
                  <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Message *</label>
                <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Rating</label>
                <select value={form.rating} onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) })} className="input-field">
                  {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Avatar URL</label>
                <input type="url" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="input-field" placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
                <span className="text-sm font-medium text-neutral-700">Active (visible on site)</span>
              </label>
              <button type="submit" className="btn-primary w-full">Save Testimonial</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
