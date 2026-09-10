import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Home as HomeIcon, Building2, Trees, Store, Briefcase, Warehouse, Factory,
  Play, Star, ArrowRight, TrendingUp, Shield, Users, Eye, MessageCircle,
  Quote, Newspaper,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Property, BlogPost, Testimonial, AdPackage } from '../lib/types';
import { useSettings } from '../hooks/useSettings';
import PropertyCard from '../components/PropertyCard';
import { formatPriceShort, getPropertyTypeLabel } from '../lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [latestProperties, setLatestProperties] = useState<Property[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    type: '',
    state: '',
    status: '',
  });

  useEffect(() => {
    const loadData = async () => {
      const [featured, latest, blog, test, pkgs] = await Promise.all([
        supabase.from('properties').select('*').eq('is_active', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(6),
        supabase.from('properties').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(6),
        supabase.from('blog_posts').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
        supabase.from('testimonials').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(6),
        supabase.from('ad_packages').select('*').eq('is_active', true).order('display_order', { ascending: true }),
      ]);
      setFeaturedProperties(featured.data || []);
      setLatestProperties(latest.data || []);
      setBlogPosts(blog.data || []);
      setTestimonials(test.data || []);
      setPackages(pkgs.data || []);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchParams.type) params.set('type', searchParams.type);
    if (searchParams.state) params.set('state', searchParams.state);
    if (searchParams.status) params.set('status', searchParams.status);
    navigate(`/properties?${params.toString()}`);
  };

  const categories = [
    { icon: HomeIcon, label: 'Houses', value: 'houses', count: 0 },
    { icon: Building2, label: 'Estates', value: 'estates', count: 0 },
    { icon: Trees, label: 'Lands', value: 'lands', count: 0 },
    { icon: Building2, label: 'Plots', value: 'plots', count: 0 },
    { icon: Store, label: 'Shops', value: 'shops', count: 0 },
    { icon: Briefcase, label: 'Offices', value: 'offices', count: 0 },
    { icon: Warehouse, label: 'Warehouses', value: 'warehouses', count: 0 },
    { icon: Factory, label: 'Commercial', value: 'commercial_buildings', count: 0 },
  ];

  const benefits = [
    { icon: Users, title: 'Reach Serious Buyers', desc: 'Connect with thousands of serious property buyers and investors actively searching for properties in Nigeria.' },
    { icon: TrendingUp, title: 'Maximum Visibility', desc: 'Your properties get premium placement on our homepage and search results for maximum exposure.' },
    { icon: Shield, title: 'Verified Listings', desc: 'Our verification system builds trust with buyers, increasing the likelihood of a successful sale.' },
    { icon: Eye, title: 'Professional Presentation', desc: 'We showcase your properties with high-quality images, videos, and detailed descriptions.' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={settings?.hero_image_url || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1920'}
            alt="Hero"
            className="w-full h-full object-cover animate-[float_8s_ease-in-out_infinite] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/80 via-neutral-900/60 to-neutral-900/80" />
        </div>

        <div className="relative z-10 container-custom py-20 text-center">
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 bg-accent-500/20 text-accent-300 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm border border-accent-500/30">
              Nigeria's Premier Property Advertising Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-balance leading-tight">
              {settings?.hero_title || 'Find Your Dream Property in Nigeria'}
            </h1>
            <p className="text-lg md:text-xl text-neutral-200 mb-8 max-w-2xl mx-auto">
              {settings?.hero_subtitle || 'Premium properties, estates, and land for sale and rent across Nigeria.'}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={searchParams.type}
                  onChange={(e) => setSearchParams({ ...searchParams, type: e.target.value })}
                  className="input-field"
                >
                  <option value="">Property Type</option>
                  <option value="houses">Houses</option>
                  <option value="estates">Estates</option>
                  <option value="lands">Lands</option>
                  <option value="plots">Plots</option>
                  <option value="shops">Shops</option>
                  <option value="offices">Offices</option>
                  <option value="warehouses">Warehouses</option>
                  <option value="commercial_buildings">Commercial Buildings</option>
                </select>
                <select
                  value={searchParams.state}
                  onChange={(e) => setSearchParams({ ...searchParams, state: e.target.value })}
                  className="input-field"
                >
                  <option value="">All States</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Kano">Kano</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Delta">Delta</option>
                  <option value="Edo">Edo</option>
                </select>
                <select
                  value={searchParams.status}
                  onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                  className="input-field"
                >
                  <option value="">Any Status</option>
                  <option value="for_sale">For Sale</option>
                  <option value="for_rent">For Rent</option>
                </select>
                <button type="submit" className="btn-primary">
                  <Search className="w-5 h-5" /> Search
                </button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {[
                { label: 'Search Properties', to: '/properties' },
                { label: 'Houses', to: '/properties?type=houses' },
                { label: 'Estates', to: '/properties?type=estates' },
                { label: 'Land & Plots', to: '/properties?type=lands' },
                { label: 'Commercial', to: '/properties?type=commercial_buildings' },
              ].map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all border border-white/20"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Categories */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Find the perfect property type for your needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`/properties?type=${cat.value}`}
                className="card p-5 text-center group hover:bg-primary-50 hover:border-primary-200"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-600 transition-colors">
                  <cat.icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <span className="text-sm font-semibold text-neutral-700 group-hover:text-primary-600">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-accent-600 font-semibold text-sm uppercase tracking-wide">Premium Selection</span>
              <h2 className="section-title">Featured Properties</h2>
              <p className="section-subtitle mb-0">Premium sponsored properties handpicked for you</p>
            </div>
            <Link to="/properties" className="btn-ghost hidden md:flex">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse bg-neutral-100" />
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-12">No featured properties available.</p>
          )}
          <div className="text-center mt-8 md:hidden">
            <Link to="/properties" className="btn-outline">View All Properties</Link>
          </div>
        </div>
      </section>

      {/* Latest Properties */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Just Listed</span>
              <h2 className="section-title">Latest Properties</h2>
              <p className="section-subtitle mb-0">Newest properties added to our platform</p>
            </div>
            <Link to="/properties" className="btn-ghost hidden md:flex">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card h-80 animate-pulse bg-neutral-200" />
              ))}
            </div>
          ) : latestProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <p className="text-center text-neutral-500 py-12">No properties available.</p>
          )}
        </div>
      </section>

      {/* Property Videos Section */}
      <section className="py-16 bg-neutral-900 text-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <span className="text-accent-400 font-semibold text-sm uppercase tracking-wide">Video Tours</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Property Videos</h2>
            <p className="text-neutral-400 text-lg">Experience luxury properties through immersive video tours</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestProperties.slice(0, 3).map((property) => (
              <Link key={property.id} to={`/properties/${property.id}`} className="group relative h-64 rounded-2xl overflow-hidden">
                <img
                  src={property.images[0] || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-accent-500 group-hover:scale-110 transition-all">
                    <Play className="w-7 h-7 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-accent-400 text-xs font-semibold uppercase">{getPropertyTypeLabel(property.property_type)}</span>
                  <h3 className="text-white font-semibold line-clamp-2">{property.title}</h3>
                  <p className="text-white/70 text-sm">{formatPriceShort(property.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Advertise With Us */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-10">
            <span className="text-accent-600 font-semibold text-sm uppercase tracking-wide">For Property Owners</span>
            <h2 className="section-title">Why Advertise With Us</h2>
            <p className="section-subtitle">We help you sell or rent your property faster</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center group">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
                  <benefit.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-neutral-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/advertise" className="btn-accent">
              Start Advertising <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-10">
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wide">Client Stories</span>
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="section-subtitle">Trusted by property owners, developers, and investors across Nigeria</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card p-6">
                <Quote className="w-8 h-8 text-accent-400 mb-4" />
                <p className="text-neutral-600 leading-relaxed mb-4 line-clamp-4">{testimonial.message}</p>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent-500" fill="currentColor" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
                  {testimonial.avatar_url ? (
                    <img src={testimonial.avatar_url} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                    <p className="text-sm text-neutral-500">{testimonial.role}{testimonial.company ? `, ${testimonial.company}` : ''}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-primary-600 font-semibold text-sm uppercase tracking-wide">News & Insights</span>
              <h2 className="section-title">Latest from Our Blog</h2>
              <p className="section-subtitle mb-0">Real estate news and investment advice</p>
            </div>
            <Link to="/blog" className="btn-ghost hidden md:flex">
              All Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
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
                  <h3 className="font-bold text-neutral-900 mt-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs text-neutral-400">
                    <Newspaper className="w-3 h-3" />
                    {post.author} &middot; {new Date(post.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Advertise Your Property?</h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of property owners and developers who trust A.S Properties to showcase their properties to serious buyers and investors.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/advertise" className="btn-accent">
              View Advertising Packages <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={`https://wa.me/${settings?.whatsapp_number?.replace(/[^0-9]/g, '') || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-neutral-100 transition-all"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
