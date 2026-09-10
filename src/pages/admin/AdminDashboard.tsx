import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Mail, Eye, TrendingUp, Newspaper, Star, Package,
  ArrowRight, Plus, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/AdminLayout';
import { formatPriceShort, timeAgo, getPropertyTypeLabel } from '../../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalInquiries: 0,
    newInquiries: 0,
    totalBlogPosts: 0,
    totalViews: 0,
    featuredProperties: 0,
    expiredProperties: 0,
  });
  const [topProperties, setTopProperties] = useState<any[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const [
        { count: totalProperties },
        { count: activeProperties },
        { count: totalInquiries },
        { count: newInquiries },
        { count: totalBlogPosts },
        { count: featuredProperties },
        { data: topProps },
        { data: inquiries },
        { data: propsData },
      ] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }),
        supabase.from('inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_featured', true),
        supabase.from('properties').select('*').order('views', { ascending: false }).limit(5),
        supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('properties').select('views'),
      ]);

      const totalViews = (propsData || []).reduce((sum, p) => sum + (p.views || 0), 0);
      const today = new Date().toISOString().split('T')[0];
      const expired = (propsData || []).length > 0
        ? await supabase.from('properties').select('*', { count: 'exact', head: true }).lt('ad_expiry_date', today).eq('is_active', true)
        : { count: 0 };

      setStats({
        totalProperties: totalProperties || 0,
        activeProperties: activeProperties || 0,
        totalInquiries: totalInquiries || 0,
        newInquiries: newInquiries || 0,
        totalBlogPosts: totalBlogPosts || 0,
        totalViews: totalViews,
        featuredProperties: featuredProperties || 0,
        expiredProperties: expired.count || 0,
      });
      setTopProperties(topProps || []);
      setRecentInquiries(inquiries || []);
      setLoading(false);
    };
    loadDashboard();
  }, []);

  const statCards = [
    { label: 'Total Properties', value: stats.totalProperties, icon: Building2, color: 'bg-primary-600', link: '/admin/properties' },
    { label: 'Active Listings', value: stats.activeProperties, icon: TrendingUp, color: 'bg-success-600', link: '/admin/properties' },
    { label: 'Total Inquiries', value: stats.totalInquiries, icon: Mail, color: 'bg-accent-600', link: '/admin/inquiries' },
    { label: 'New Inquiries', value: stats.newInquiries, icon: Mail, color: 'bg-error-600', link: '/admin/inquiries' },
    { label: 'Featured Properties', value: stats.featuredProperties, icon: Star, color: 'bg-primary-500', link: '/admin/properties' },
    { label: 'Blog Posts', value: stats.totalBlogPosts, icon: Newspaper, color: 'bg-neutral-700', link: '/admin/blog' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'bg-primary-700', link: '/admin/properties' },
    { label: 'Expired Ads', value: stats.expiredProperties, icon: AlertCircle, color: 'bg-error-500', link: '/admin/properties' },
  ];

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => (
              <Link
                key={stat.label}
                to={stat.link}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-neutral-900">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to="/admin/properties/new" className="bg-primary-600 text-white rounded-2xl p-5 hover:bg-primary-700 transition-colors group">
              <Plus className="w-8 h-8 mb-2" />
              <h3 className="font-bold">Add New Property</h3>
              <p className="text-sm text-primary-100">Upload a new property listing</p>
            </Link>
            <Link to="/admin/blog/new" className="bg-neutral-800 text-white rounded-2xl p-5 hover:bg-neutral-700 transition-colors group">
              <Newspaper className="w-8 h-8 mb-2" />
              <h3 className="font-bold">Write Blog Post</h3>
              <p className="text-sm text-neutral-300">Create a new article</p>
            </Link>
            <Link to="/admin/settings" className="bg-accent-500 text-neutral-900 rounded-2xl p-5 hover:bg-accent-400 transition-colors group">
              <Package className="w-8 h-8 mb-2" />
              <h3 className="font-bold">Update Settings</h3>
              <p className="text-sm text-neutral-700">Manage site content</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Properties */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-neutral-900">Most Viewed Properties</h2>
                <Link to="/admin/properties" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {topProperties.map((prop, i) => (
                  <Link key={prop.id} to={`/admin/properties/${prop.id}/edit`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                    <span className="text-sm font-bold text-neutral-400 w-6">{i + 1}</span>
                    {prop.images[0] && <img src={prop.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">{prop.title}</p>
                      <p className="text-xs text-neutral-500">{getPropertyTypeLabel(prop.property_type)} &middot; {prop.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary-600">{formatPriceShort(prop.price)}</p>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 justify-end"><Eye className="w-3 h-3" /> {prop.views}</p>
                    </div>
                  </Link>
                ))}
                {topProperties.length === 0 && <p className="text-neutral-400 text-sm text-center py-4">No properties yet.</p>}
              </div>
            </div>

            {/* Recent Inquiries */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg text-neutral-900">Recent Inquiries</h2>
                <Link to="/admin/inquiries" className="text-sm text-primary-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold flex-shrink-0">
                      {inq.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-neutral-900 truncate">{inq.name}</p>
                        {inq.status === 'new' && <span className="badge bg-error-100 text-error-700 text-xs">New</span>}
                      </div>
                      <p className="text-xs text-neutral-500 truncate">{inq.message}</p>
                      <p className="text-xs text-neutral-400 mt-1">{timeAgo(inq.created_at)}</p>
                    </div>
                  </div>
                ))}
                {recentInquiries.length === 0 && <p className="text-neutral-400 text-sm text-center py-4">No inquiries yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
