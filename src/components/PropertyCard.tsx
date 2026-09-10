import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, MapPin, Heart, BadgeCheck, Eye } from 'lucide-react';
import type { Property } from '../lib/types';
import { formatPriceShort, getPropertyTypeLabel, getStatusColor, getStatusLabel } from '../lib/utils';
import { useFavorites } from '../hooks/useFavorites';

export default function PropertyCard({ property }: { property: Property }) {
  const { isFavorite, toggleFavorite } = useFavorites(property.id);
  const hasImages = property.images && property.images.length > 0;
  const imageUrl = hasImages ? property.images[0] : 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800';

  return (
    <Link
      to={`/properties/${property.id}`}
      className="card group block relative hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`badge ${getStatusColor(property.status)}`}>
            {getStatusLabel(property.status)}
          </span>
          {property.is_verified && (
            <span className="badge bg-primary-600 text-white">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFavorite();
          }}
          className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Toggle favorite"
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-error-500 text-error-500' : 'text-neutral-600'}`}
          />
        </button>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-1 text-white/90 text-xs mb-1">
            <MapPin className="w-3 h-3" />
            {property.area}, {property.city}, {property.state}
          </div>
          <p className="text-white font-bold text-lg drop-shadow-lg">
            {formatPriceShort(property.price)}
          </p>
        </div>
      </div>

      <div className="p-4">
        <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
          {getPropertyTypeLabel(property.property_type)}
        </span>
        <h3 className="font-semibold text-neutral-900 mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {property.title}
        </h3>

        <div className="flex items-center gap-4 mt-3 text-sm text-neutral-500">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bed className="w-4 h-4" /> {property.bedrooms}
            </span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-4 h-4" /> {property.bathrooms}
            </span>
          )}
          {property.land_size > 0 && (
            <span className="flex items-center gap-1">
              <Maximize className="w-4 h-4" /> {property.land_size} sqm
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Eye className="w-4 h-4" /> {property.views}
          </span>
        </div>
      </div>
    </Link>
  );
}
