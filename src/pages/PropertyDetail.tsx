import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Bed, Bath, Maximize, MapPin, BadgeCheck, Eye, Heart, Share2,
  Phone, MessageCircle, Mail, ArrowLeft, Check, Play, Calendar, Tag,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Property } from '../lib/types';
import { useSettings } from '../hooks/useSettings';
import { useFavorites } from '../hooks/useFavorites';
import ContactForm from '../components/ContactForm';
import PropertyCard from '../components/PropertyCard';
import {
  formatPrice, getPropertyTypeLabel, getStatusColor, getStatusLabel, formatDate,
} from '../lib/utils';

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [property, setProperty] = useState<Property | null>(null);
  const [similar, setSimilar] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [shared, setShared] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase.from('properties').select('*').eq('id', id).maybeSingle().then(({ data, error }) => {
      if (!error && data) {
        setProperty(data);
        supabase.from('properties').update({ views: (data.views || 0) + 1 }).eq('id', id).then();
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!property) return;
    supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .eq('property_type', property.property_type)
      .neq('id', property.id)
      .limit(3)
      .order('created_at', { ascending: false })
      .then(({ data }) => setSimilar(data || []));
  }, [property]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: property?.title, url: window.location.href });
      } catch {}
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

  if (!property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Property Not Found</h2>
        <p className="text-neutral-500 mb-4">The property you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/properties')} className="btn-primary">Browse Properties</button>
      </div>
    );
  }

  const whatsappNumber = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
  const whatsappMessage = `Hello, I am interested in "${property.title}" listed on A.S Properties. Price: ${formatPrice(property.price)}. Location: ${property.area}, ${property.city}.`;

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container-custom py-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Properties
          </button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="container-custom py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-3 relative h-80 md:h-[500px] rounded-2xl overflow-hidden bg-neutral-200">
            {property.images.length > 0 ? (
              <img
                src={property.images[activeImage]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">No images available</div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              <span className={`badge ${getStatusColor(property.status)}`}>{getStatusLabel(property.status)}</span>
              {property.is_verified && (
                <span className="badge bg-primary-600 text-white"><BadgeCheck className="w-3 h-3" /> Verified</span>
              )}
              {property.is_featured && (
                <span className="badge bg-accent-500 text-neutral-900"><Tag className="w-3 h-3" /> Featured</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-3">
            {property.images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative h-20 lg:h-28 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImage === i ? 'border-primary-600' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                    {getPropertyTypeLabel(property.property_type)}
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mt-1">{property.title}</h1>
                  <p className="text-neutral-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {property.address || `${property.area}, ${property.city}, ${property.state}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={toggleFavorite}
                    className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-error-500 text-error-500' : 'text-neutral-600'}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-neutral-200 transition-colors"
                  >
                    {shared ? <Check className="w-5 h-5 text-success-600" /> : <Share2 className="w-5 h-5 text-neutral-600" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-neutral-100">
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(property.price, property.currency)}
                </div>
                <div className="flex items-center gap-1 text-sm text-neutral-400 ml-auto">
                  <Eye className="w-4 h-4" /> {property.views} views
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {property.bedrooms > 0 && (
                  <div className="text-center p-3 bg-neutral-50 rounded-xl">
                    <Bed className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-neutral-900">{property.bedrooms}</p>
                    <p className="text-xs text-neutral-500">Bedrooms</p>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="text-center p-3 bg-neutral-50 rounded-xl">
                    <Bath className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-neutral-900">{property.bathrooms}</p>
                    <p className="text-xs text-neutral-500">Bathrooms</p>
                  </div>
                )}
                {property.land_size > 0 && (
                  <div className="text-center p-3 bg-neutral-50 rounded-xl">
                    <Maximize className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-neutral-900">{property.land_size}</p>
                    <p className="text-xs text-neutral-500">sqm Land</p>
                  </div>
                )}
                {property.built_size > 0 && (
                  <div className="text-center p-3 bg-neutral-50 rounded-xl">
                    <Maximize className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-neutral-900">{property.built_size}</p>
                    <p className="text-xs text-neutral-500">sqm Built</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Description</h2>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Features */}
            {property.features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Property Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {property.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                      <div className="w-5 h-5 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-success-600" />
                      </div>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {property.videos.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Property Videos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.videos.map((_, i) => (
                    <div key={i} className="relative h-48 bg-neutral-900 rounded-xl overflow-hidden group cursor-pointer">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-accent-500 transition-colors">
                          <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </div>
                      </div>
                      <p className="absolute bottom-3 left-3 text-white text-sm">Video {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ad Info */}
            {(property.ad_start_date || property.ad_expiry_date) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900 mb-4">Listing Information</h2>
                <div className="flex flex-wrap gap-6 text-sm">
                  {property.ad_start_date && (
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-4 h-4 text-primary-600" />
                      Listed: {formatDate(property.ad_start_date)}
                    </div>
                  )}
                  {property.ad_expiry_date && (
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-4 h-4 text-accent-600" />
                      Ad expires: {formatDate(property.ad_expiry_date)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-neutral-900 mb-4">Contact About This Property</h3>
                <div className="space-y-3">
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-success-500 text-white font-semibold rounded-lg hover:bg-success-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${settings?.phone_number || ''}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Phone className="w-5 h-5" /> Call Now
                  </a>
                  <a
                    href={`mailto:${settings?.email || ''}?subject=${encodeURIComponent(`Inquiry: ${property.title}`)}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
                  >
                    <Mail className="w-5 h-5" /> Email
                  </a>
                  <button
                    onClick={() => setShowContact(!showContact)}
                    className="w-full btn-outline"
                  >
                    {showContact ? 'Hide Form' : 'Send Message'}
                  </button>
                </div>

                {showContact && (
                  <div className="mt-6 pt-6 border-t border-neutral-100 animate-fade-in">
                    <ContactForm propertyId={property.id} inquiryType="info" compact />
                  </div>
                )}
              </div>

              <div className="bg-primary-50 rounded-2xl p-6">
                <h3 className="font-bold text-neutral-900 mb-2">Want to Advertise?</h3>
                <p className="text-sm text-neutral-600 mb-4">List your property on A.S Properties and reach thousands of buyers.</p>
                <Link to="/advertise" className="btn-primary w-full text-sm">View Packages</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
