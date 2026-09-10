import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    let query = supabase.from('blog_posts').select('*').eq('is_published', true);
    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false });
    query.then(({ data }) => {
      setPosts(data || []);
      setLoading(false);
    });
  }, [search, category]);

  const categories = ['Investment', 'Buying Guide', 'Estate Review', 'Financing', 'Market Analysis'];

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-neutral-900 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">A.S Properties Blog</h1>
          <p className="text-neutral-300">Real estate news, investment advice, and market insights</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="input-field pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field md:w-56"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 animate-pulse bg-neutral-200 rounded-2xl" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="card group block">
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">{post.category}</span>
                  <h3 className="font-bold text-lg text-neutral-900 mt-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-2 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-neutral-400">
                    <Newspaper className="w-3 h-3" />
                    {post.author} &middot; {new Date(post.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Newspaper className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No articles found</h3>
            <p className="text-neutral-500">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
