import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, X, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { AdPackage } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';
import { formatPrice } from '../../lib/utils';

export default function AdminPackages() {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdPackage | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_days: '30', features: [] as string[], is_popular: false, display_order: '0', is_active: true });
  const [newFeature, setNewFeature] = useState('');

  const load = useCallback(async () => {
    const { data } = await supabase.from('ad_packages').select('*').order('display_order', { ascending: true });
    setPackages(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      duration_days: parseInt(form.duration_days) || 30,
      features: form.features,
      is_popular: form.is_popular,
      display_order: parseInt(form.display_order) || 0,
      is_active: form.is_active,
    };
    if (editing) {
      await supabase.from('ad_packages').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('ad_packages').insert(payload);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', description: '', price: '', duration_days: '30', features: [], is_popular: false, display_order: '0', is_active: true });
    load();
  };

  const handleEdit = (p: AdPackage) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description, price: String(p.price), duration_days: String(p.duration_days), features: p.features || [], is_popular: p.is_popular, display_order: String(p.display_order), is_active: p.is_active });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('ad_packages').delete().eq('id', id);
    load();
  };

  return (
    <AdminLayout title="Ad Packages">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-neutral-500">{packages.length} packages</p>
        <button onClick={() => { setEditing(null); setForm({ name: '', description: '', price: '', duration_days: '30', features: [], is_popular: false, display_order: '0', is_active: true }); setShowForm(true); }} className="btn-primary">
          <Plus className="w-5 h-5" /> Add Package
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((p) => (
            <div key={p.id} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${p.is_popular ? 'border-primary-600' : 'border-neutral-200'}`}>
              {p.is_popular && <div className="flex items-center gap-1 text-primary-600 text-xs font-semibold mb-2"><Crown className="w-3 h-3" /> POPULAR</div>}
              <h3 className="font-bold text-neutral-900">{p.name}</h3>
              <p className="text-sm text-neutral-500 mb-2">{p.description}</p>
              <p className="text-2xl font-bold text-neutral-900 mb-1">{formatPrice(p.price)}</p>
              <p className="text-xs text-neutral-400 mb-3">{p.duration_days} days</p>
              <ul className="space-y-1 mb-3">
                {p.features.slice(0, 3).map((f, i) => <li key={i} className="text-xs text-neutral-600 flex items-start gap-1"><span className="text-success-600">-</span> {f}</li>)}
                {p.features.length > 3 && <li className="text-xs text-neutral-400">+{p.features.length - 3} more</li>}
              </ul>
              <div className="flex gap-1 pt-3 border-t border-neutral-100">
                <button onClick={() => handleEdit(p)} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900">{editing ? 'Edit Package' : 'New Package'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 text-neutral-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Price (NGN) *</label>
                  <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Duration (days)</label>
                  <input type="number" value={form.duration_days} onChange={(e) => setForm({ ...form, duration_days: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Features</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newFeature.trim()) { setForm({ ...form, features: [...form.features, newFeature.trim()] }); setNewFeature(''); } } }} className="input-field" placeholder="Add feature..." />
                  <button type="button" onClick={() => { if (newFeature.trim()) { setForm({ ...form, features: [...form.features, newFeature.trim()] }); setNewFeature(''); } }} className="btn-outline"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.features.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded text-sm">{f}<button type="button" onClick={() => setForm({ ...form, features: form.features.filter((_, idx) => idx !== i) })}><X className="w-3 h-3" /></button></span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order</label>
                <input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} className="input-field" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_popular} onChange={(e) => setForm({ ...form, is_popular: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm font-medium text-neutral-700">Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
                  <span className="text-sm font-medium text-neutral-700">Active</span>
                </label>
              </div>
              <button type="submit" className="btn-primary w-full">Save Package</button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
