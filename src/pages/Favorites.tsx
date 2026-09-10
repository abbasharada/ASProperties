import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Property } from '../lib/types';
import { useFavorites } from '../hooks/useFavorites';
import PropertyCard from '../components/PropertyCard';

export default function Favorites() {
  const { favorites } = useFavorites();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setProperties([]);
      setLoading(false);
      return;
    }
    supabase
      .from('properties')
      .select('*')
      .in('id', favorites)
      .eq('is_active', true)
      .then(({ data }) => {
        setProperties(data || []);
        setLoading(false);
      });
  }, [favorites]);

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-neutral-900 text-white py-16">
        <div className="container-custom text-center">
          <Heart className="w-12 h-12 text-accent-500 mx-auto mb-4" fill="currentColor" />
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Your Favorite Properties</h1>
          <p className="text-neutral-300">{properties.length} saved {properties.length === 1 ? 'property' : 'properties'}</p>
        </div>
      </div>

      <div className="container-custom py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-72 animate-pulse bg-neutral-200 rounded-2xl" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto">
            <Heart className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 mb-2">No favorites yet</h3>
            <p className="text-neutral-500 mb-6">Browse properties and click the heart icon to save them here.</p>
            <Link to="/properties" className="btn-primary">Browse Properties</Link>
          </div>
        )}
      </div>
    </div>
  );
}
