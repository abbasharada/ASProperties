import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Newspaper, Eye, Calendar, Share2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { BlogPost } from '../lib/types';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).maybeSingle().then(({ data, error }) => {
      if (!error && data) {
        setPost(data);
        supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then();
        supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .eq('category', data.category)
          .neq('id', data.id)
          .limit(3)
          .order('created_at', { ascending: false })
          .then(({ data: rel }) => setRelated(rel || []));
      }
      setLoading(false);
    });
  }, [slug]);

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: post?.title, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Article Not Found</h2>
        <p className="text-neutral-500 mb-4">The article you are looking for does not exist.</p>
        <Link to="/blog" className="btn-primary">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-neutral-900">
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="w-full h-full object-cover opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container-custom pb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </button>
            <span className="inline-block px-3 py-1 bg-accent-500 text-neutral-900 rounded-full text-xs font-semibold mb-3">
              {post.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-white max-w-3xl">{post.title}</h1>
          </div>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-200">
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1"><Newspaper className="w-4 h-4" /> {post.author}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views} views</span>
            </div>
            <button onClick={handleShare} className="p-2 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
              {shared ? <Check className="w-5 h-5 text-success-600" /> : <Share2 className="w-5 h-5 text-neutral-600" />}
            </button>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-neutral-600 leading-relaxed mb-6 font-medium">{post.excerpt}</p>
            <div className="text-neutral-700 leading-relaxed whitespace-pre-line">{post.content}</div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-primary-50 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Looking to Advertise Your Property?</h3>
            <p className="text-neutral-600 mb-4">Reach thousands of serious buyers on A.S Properties.</p>
            <Link to="/advertise" className="btn-primary">View Advertising Packages</Link>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link key={rel.id} to={`/blog/${rel.slug}`} className="card group block">
                  <div className="h-40 overflow-hidden">
                    <img src={rel.image_url} alt={rel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-primary-600 uppercase">{rel.category}</span>
                    <h3 className="font-bold text-neutral-900 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">{rel.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
