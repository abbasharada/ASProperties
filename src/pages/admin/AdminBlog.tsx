import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Newspaper } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';
import { formatDate } from '../../lib/utils';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleDelete = async (id: string) => {
    await supabase.from('blog_posts').delete().eq('id', id);
    setDeleteId(null);
    loadPosts();
  };

  const togglePublished = async (post: BlogPost) => {
    await supabase.from('blog_posts').update({ is_published: !post.is_published }).eq('id', post.id);
    loadPosts();
  };

  return (
    <AdminLayout title="Blog Management">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-neutral-500">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>
        <Link to="/admin/blog/new" className="btn-primary"><Plus className="w-5 h-5" /> New Article</Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex">
                {post.image_url && <img src={post.image_url} alt="" className="w-32 h-32 object-cover flex-shrink-0" />}
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary-600 uppercase">{post.category}</span>
                    <span className={`badge ${post.is_published ? 'bg-success-100 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
                      {post.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h3 className="font-bold text-neutral-900 line-clamp-2 mb-1">{post.title}</h3>
                  <p className="text-xs text-neutral-400 mb-2">{formatDate(post.created_at)} &middot; {post.views} views</p>
                  <div className="flex gap-1">
                    <Link to={`/blog/${post.slug}`} target="_blank" className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="View"><Eye className="w-4 h-4" /></Link>
                    <Link to={`/admin/blog/${post.id}/edit`} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit"><Edit className="w-4 h-4" /></Link>
                    <button onClick={() => togglePublished(post)} className="p-1.5 text-neutral-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg" title="Toggle Published"><Newspaper className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(post.id)} className="p-1.5 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Newspaper className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500 mb-4">No blog posts yet.</p>
          <Link to="/admin/blog/new" className="btn-primary"><Plus className="w-5 h-5" /> Write First Article</Link>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-error-600" /></div>
            <h3 className="text-lg font-bold text-neutral-900 text-center mb-2">Delete Article?</h3>
            <p className="text-sm text-neutral-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-error-600 text-white font-semibold rounded-lg hover:bg-error-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
