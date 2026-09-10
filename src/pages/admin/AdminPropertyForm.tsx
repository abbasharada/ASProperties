import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Image as ImageIcon, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Property } from '../../lib/types';
import { PROPERTY_TYPES, PROPERTY_STATUS, NIGERIAN_STATES } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';

export default function AdminPropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'NGN',
    property_type: 'houses',
    status: 'for_sale',
    state: 'Lagos',
    city: '',
    area: '',
    address: '',
    bedrooms: '0',
    bathrooms: '0',
    land_size: '0',
    built_size: '0',
    is_featured: false,
    is_verified: false,
    is_active: true,
    ad_start_date: '',
    ad_expiry_date: '',
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideo, setNewVideo] = useState('');

  useEffect(() => {
    if (!id) return;
    supabase.from('properties').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        const p = data as Property;
        setForm({
          title: p.title,
          description: p.description,
          price: String(p.price),
          currency: p.currency,
          property_type: p.property_type,
          status: p.status,
          state: p.state,
          city: p.city,
          area: p.area,
          address: p.address,
          bedrooms: String(p.bedrooms),
          bathrooms: String(p.bathrooms),
          land_size: String(p.land_size),
          built_size: String(p.built_size),
          is_featured: p.is_featured,
          is_verified: p.is_verified,
          is_active: p.is_active,
          ad_start_date: p.ad_start_date || '',
          ad_expiry_date: p.ad_expiry_date || '',
        });
        setFeatures(p.features || []);
        setImages(p.images || []);
        setVideos(p.videos || []);
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price) || 0,
      currency: form.currency,
      property_type: form.property_type,
      status: form.status,
      state: form.state,
      city: form.city,
      area: form.area,
      address: form.address,
      bedrooms: parseInt(form.bedrooms) || 0,
      bathrooms: parseInt(form.bathrooms) || 0,
      land_size: parseFloat(form.land_size) || 0,
      built_size: parseFloat(form.built_size) || 0,
      is_featured: form.is_featured,
      is_verified: form.is_verified,
      is_active: form.is_active,
      ad_start_date: form.ad_start_date || null,
      ad_expiry_date: form.ad_expiry_date || null,
      features,
      images,
      videos,
    };

    const { error } = isEdit
      ? await supabase.from('properties').update(payload).eq('id', id)
      : await supabase.from('properties').insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      navigate('/admin/properties');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Property">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Property' : 'Add New Property'}>
      <button onClick={() => navigate('/admin/properties')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </button>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {error && <div className="bg-error-50 text-error-600 p-4 rounded-lg text-sm">{error}</div>}

        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Luxury 5-Bedroom House in Lekki" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Description *</label>
              <textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" placeholder="Detailed property description..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Price *</label>
                <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Property Type *</label>
                <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className="input-field">
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status *</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                  {PROPERTY_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">State *</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field">
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
              <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field" placeholder="e.g. Lekki" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Area</label>
              <input type="text" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="input-field" placeholder="e.g. Lekki Phase 1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Full Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" placeholder="Street address" />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Property Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Bedrooms</label>
              <input type="number" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Land Size (sqm)</label>
              <input type="number" value={form.land_size} onChange={(e) => setForm({ ...form, land_size: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Built Size (sqm)</label>
              <input type="number" value={form.built_size} onChange={(e) => setForm({ ...form, built_size: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Property Features</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newFeature.trim()) { setFeatures([...features, newFeature.trim()]); setNewFeature(''); } } }} className="input-field" placeholder="e.g. Swimming Pool" />
            <button type="button" onClick={() => { if (newFeature.trim()) { setFeatures([...features, newFeature.trim()]); setNewFeature(''); } }} className="btn-outline"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm">
                {f}
                <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))} className="hover:text-error-600"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Property Images</h2>
          <div className="flex gap-2 mb-4">
            <input type="url" value={newImage} onChange={(e) => setNewImage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newImage.trim()) { setImages([...images, newImage.trim()]); setNewImage(''); } } }} className="input-field" placeholder="Paste image URL..." />
            <button type="button" onClick={() => { if (newImage.trim()) { setImages([...images, newImage.trim()]); setNewImage(''); } }} className="btn-outline"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative group h-32 rounded-lg overflow-hidden">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-6 h-6 bg-error-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400 mt-2">Paste image URLs from Pexels or other image hosts.</p>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2"><Video className="w-5 h-5" /> Property Videos</h2>
          <div className="flex gap-2 mb-4">
            <input type="url" value={newVideo} onChange={(e) => setNewVideo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newVideo.trim()) { setVideos([...videos, newVideo.trim()]); setNewVideo(''); } } }} className="input-field" placeholder="Paste video URL..." />
            <button type="button" onClick={() => { if (newVideo.trim()) { setVideos([...videos, newVideo.trim()]); setNewVideo(''); } }} className="btn-outline"><Plus className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2">
            {videos.map((vid, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
                <Video className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span className="text-sm text-neutral-600 truncate flex-1">{vid}</span>
                <button type="button" onClick={() => setVideos(videos.filter((_, idx) => idx !== i))} className="text-neutral-400 hover:text-error-600"><X className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Advertisement Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Advertisement Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Ad Start Date</label>
              <input type="date" value={form.ad_start_date} onChange={(e) => setForm({ ...form, ad_start_date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Ad Expiry Date</label>
              <input type="date" value={form.ad_expiry_date} onChange={(e) => setForm({ ...form, ad_expiry_date: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm font-medium text-neutral-700">Featured on Homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_verified} onChange={(e) => setForm({ ...form, is_verified: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm font-medium text-neutral-700">Verified Listing</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
              <span className="text-sm font-medium text-neutral-700">Active (Visible)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Property'} <Save className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => navigate('/admin/properties')} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}
