import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';

export default function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image_url: '',
    author: 'A.S Properties',
    category: 'Real Estate',
    is_published: true,
  });

  useEffect(() => {
    if (!id) return;
    supabase.from('blog_posts').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        setForm({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          image_url: data.image_url,
          author: data.author,
          category: data.category,
          is_published: data.is_published,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const slug = form.slug || generateSlug(form.title);
    const payload = { ...form, slug };

    const { error } = isEdit
      ? await supabase.from('blog_posts').update(payload).eq('id', id)
      : await supabase.from('blog_posts').insert(payload);

    if (error) {
      setError(error.message);
      setSaving(false);
    } else {
      navigate('/admin/blog');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Edit Article">
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Article' : 'New Article'}>
      <button onClick={() => navigate('/admin/blog')} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </button>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {error && <div className="bg-error-50 text-error-600 p-4 rounded-lg text-sm">{error}</div>}

        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: isEdit ? form.slug : generateSlug(e.target.value) })} className="input-field" placeholder="Article title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" placeholder="article-url-slug" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Excerpt *</label>
            <textarea required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="input-field resize-none" placeholder="Short summary..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Content *</label>
            <textarea required rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="input-field resize-none font-mono text-sm" placeholder="Write your article content here. Use ## for headings and blank lines for paragraphs." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
              <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" placeholder="e.g. Investment" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Author</label>
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Featured Image URL</label>
            <input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://images.pexels.com/..." />
            {form.image_url && <img src={form.image_url} alt="Preview" className="mt-2 w-full h-40 object-cover rounded-lg" />}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 rounded text-primary-600" />
            <span className="text-sm font-medium text-neutral-700">Published</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Article'} <Save className="w-4 h-4" /></button>
          <button type="button" onClick={() => navigate('/admin/blog')} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}
