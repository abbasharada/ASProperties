import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Grid3x3, List, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Property } from '../lib/types';
import { PROPERTY_TYPES, PROPERTY_STATUS, NIGERIAN_STATES } from '../lib/types';
import PropertyCard from '../components/PropertyCard';
import { getPropertyTypeLabel } from '../lib/utils';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    state: searchParams.get('state') || '',
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || '',
    status: searchParams.get('status') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    bathrooms: searchParams.get('bathrooms') || '',
    landSize: searchParams.get('landSize') || '',
    search: searchParams.get('search') || '',
  });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('properties').select('*', { count: 'exact' }).eq('is_active', true);

    if (filters.type) query = query.eq('property_type', filters.type);
    if (filters.state) query = query.ilike('state', `%${filters.state}%`);
    if (filters.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters.area) query = query.ilike('area', `%${filters.area}%`);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
    if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));
    if (filters.bedrooms) query = query.gte('bedrooms', parseInt(filters.bedrooms));
    if (filters.bathrooms) query = query.gte('bathrooms', parseInt(filters.bathrooms));
    if (filters.landSize) query = query.gte('land_size', parseFloat(filters.landSize));
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%,area.ilike.%${filters.search}%`);
    }

    query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false });

    const { data, count, error } = await query;
    if (!error) {
      setProperties(data || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      type: '', state: '', city: '', area: '', status: '',
      minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '',
      landSize: '', search: '',
    });
    setSearchParams({});
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== '');

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {filters.type ? getPropertyTypeLabel(filters.type) + 's' : 'All Properties'}
          </h1>
          <p className="text-neutral-300">
            {loading ? 'Loading...' : `${totalCount} ${totalCount === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden btn-outline text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <div className="hidden lg:block">
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-ghost text-sm text-error-600">
                <X className="w-4 h-4" /> Clear all filters
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-400'}`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 flex-shrink-0`}>
            <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-neutral-900">Filters</h3>
                <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline lg:hidden">
                  Clear
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Property Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">All Types</option>
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">All States</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Area</label>
                  <input
                    type="text"
                    value={filters.area}
                    onChange={(e) => handleFilterChange('area', e.target.value)}
                    className="input-field text-sm"
                    placeholder="Enter area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Any Status</option>
                    {PROPERTY_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Min Price</label>
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="input-field text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Max Price</label>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="input-field text-sm"
                      placeholder="Any"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Min Bedrooms</label>
                  <select
                    value={filters.bedrooms}
                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Min Bathrooms</label>
                  <select
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Min Land Size (sqm)</label>
                  <input
                    type="number"
                    value={filters.landSize}
                    onChange={(e) => handleFilterChange('landSize', e.target.value)}
                    className="input-field text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full mt-4 btn-ghost text-sm text-error-600 hidden lg:flex">
                  <X className="w-4 h-4" /> Clear all filters
                </button>
              )}
            </div>
          </aside>

          {/* Properties Grid */}
          <div className="flex-1">
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-72 animate-pulse bg-neutral-200" />
                ))}
              </div>
            ) : properties.length > 0 ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {properties.map((property) => (
                    <PropertyListItem key={property.id} property={property} />
                  ))}
                </div>
              )
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center">
                <MapPin className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-neutral-900 mb-2">No properties found</h3>
                <p className="text-neutral-500 mb-4">Try adjusting your filters to see more results.</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyListItem({ property }: { property: Property }) {
  const imageUrl = property.images[0] || 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800';
  return (
    <a href={`/properties/${property.id}`} className="card flex flex-col sm:flex-row group">
      <div className="sm:w-72 h-56 sm:h-auto flex-shrink-0 overflow-hidden">
        <img src={imageUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="p-5 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-primary-600 uppercase">{getPropertyTypeLabel(property.property_type)}</span>
          {property.is_verified && <span className="badge bg-primary-100 text-primary-700">Verified</span>}
        </div>
        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-600 transition-colors mb-1">{property.title}</h3>
        <p className="text-sm text-neutral-500 mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> {property.area}, {property.city}, {property.state}</p>
        <p className="text-sm text-neutral-600 line-clamp-2 mb-3">{property.description}</p>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          {property.bedrooms > 0 && <span>{property.bedrooms} Bed</span>}
          {property.bathrooms > 0 && <span>{property.bathrooms} Bath</span>}
          {property.land_size > 0 && <span>{property.land_size} sqm</span>}
          <span className="ml-auto text-primary-600 font-bold text-lg">
            {'\u20A6'}{property.price.toLocaleString('en-NG')}
          </span>
        </div>
      </div>
    </a>
  );
}
