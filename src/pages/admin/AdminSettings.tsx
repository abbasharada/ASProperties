import { useEffect, useState } from 'react';
import { Save, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { SiteSettings } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('*').limit(1).maybeSingle().then(({ data }) => {
      if (data) setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await supabase.from('site_settings').update({
      hero_title: settings.hero_title,
      hero_subtitle: settings.hero_subtitle,
      hero_image_url: settings.hero_image_url,
      whatsapp_number: settings.whatsapp_number,
      phone_number: settings.phone_number,
      email: settings.email,
      office_address: settings.office_address,
      about_text: settings.about_text,
      facebook_url: settings.facebook_url,
      twitter_url: settings.twitter_url,
      instagram_url: settings.instagram_url,
      linkedin_url: settings.linkedin_url,
      tiktok_url: settings.tiktok_url,
    }).eq('id', settings.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading || !settings) {
    return (
      <AdminLayout title="Site Settings">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Site Settings">
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4 flex items-center gap-2"><Building2 className="w-5 h-5" /> Homepage Hero</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Hero Title</label>
              <input type="text" value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Hero Subtitle</label>
              <textarea rows={2} value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Hero Image URL</label>
              <input type="url" value={settings.hero_image_url} onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })} className="input-field" />
              {settings.hero_image_url && <img src={settings.hero_image_url} alt="Hero" className="mt-2 w-full h-40 object-cover rounded-lg" />}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">WhatsApp Number</label>
              <input type="text" value={settings.whatsapp_number} onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })} className="input-field" placeholder="+234..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
              <input type="text" value={settings.phone_number} onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })} className="input-field" placeholder="+234..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Office Address</label>
              <input type="text" value={settings.office_address} onChange={(e) => setSettings({ ...settings, office_address: e.target.value })} className="input-field" />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">Social Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Facebook URL</label>
              <input type="url" value={settings.facebook_url} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Twitter URL</label>
              <input type="url" value={settings.twitter_url} onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Instagram URL</label>
              <input type="url" value={settings.instagram_url} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">LinkedIn URL</label>
              <input type="url" value={settings.linkedin_url} onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">TikTok URL</label>
              <input type="url" value={settings.tiktok_url} onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })} className="input-field" placeholder="https://www.tiktok.com/@yourpage" />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-neutral-900 mb-4">About Text</h2>
          <textarea rows={4} value={settings.about_text} onChange={(e) => setSettings({ ...settings, about_text: e.target.value })} className="input-field resize-none" placeholder="About A.S Properties..." />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Settings'} <Save className="w-4 h-4" />
          </button>
          {saved && <span className="text-sm text-success-600 font-medium">Settings saved successfully!</span>}
        </div>
      </form>
    </AdminLayout>
  );
}
