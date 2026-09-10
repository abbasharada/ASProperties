import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Star, Eye, BadgeCheck, AlertCircle, Power } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Property } from '../../lib/types';
import AdminLayout from '../../components/AdminLayout';
import { formatPriceShort, getPropertyTypeLabel, getStatusLabel, formatDate } from '../../lib/utils';

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadProperties = useCallback(async () => {
    let query = supabase.from('properties').select('*');
    if (filterType) query = query.eq('property_type', filterType);
    if (search) query = query.or(`title.ilike.%${search}%,city.ilike.%${search}%,area.ilike.%${search}%`);
    query = query.order('created_at', { ascending: false });
    const { data } = await query;
    setProperties(data || []);
    setLoading(false);
  }, [search, filterType]);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const handleDelete = async (id: string) => {
    await supabase.from('properties').delete().eq('id', id);
    setDeleteId(null);
    loadProperties();
  };

  const toggleActive = async (prop: Property) => {
    await supabase.from('properties').update({ is_active: !prop.is_active }).eq('id', prop.id);
    loadProperties();
  };

  const toggleFeatured = async (prop: Property) => {
    await supabase.from('properties').update({ is_featured: !prop.is_featured }).eq('id', prop.id);
    loadProperties();
  };

  const toggleVerified = async (prop: Property) => {
    await supabase.from('properties').update({ is_verified: !prop.is_verified }).eq('id', prop.id);
    loadProperties();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AdminLayout title="Property Management">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search properties..."
            className="input-field pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field sm:w-48">
          <option value="">All Types</option>
          <option value="houses">Houses</option>
          <option value="estates">Estates</option>
          <option value="lands">Lands</option>
          <option value="plots">Plots</option>
          <option value="shops">Shops</option>
          <option value="offices">Offices</option>
          <option value="warehouses">Warehouses</option>
          <option value="commercial_buildings">Commercial Buildings</option>
        </select>
        <Link to="/admin/properties/new" className="btn-primary whitespace-nowrap">
          <Plus className="w-5 h-5" /> Add Property
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : properties.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Property</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase hidden lg:table-cell">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase hidden xl:table-cell">Expiry</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {properties.map((prop) => {
                const isExpired = prop.ad_expiry_date && prop.ad_expiry_date < today;
                return (
                  <tr key={prop.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {prop.images[0] ? (
                          <img src={prop.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-neutral-100 rounded-lg flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate max-w-xs">{prop.title}</p>
                          <p className="text-xs text-neutral-500">{prop.city}, {prop.state}</p>
                          <div className="flex gap-1 mt-1">
                            {prop.is_featured && <Star className="w-3 h-3 text-accent-500" fill="currentColor" />}
                            {prop.is_verified && <BadgeCheck className="w-3 h-3 text-primary-600" />}
                            {isExpired && <AlertCircle className="w-3 h-3 text-error-500" />}
                            {!prop.is_active && <span className="text-xs text-neutral-400">Inactive</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-neutral-600">{getPropertyTypeLabel(prop.property_type)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm font-medium text-neutral-900">{formatPriceShort(prop.price)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-neutral-600">{getStatusLabel(prop.status)}</span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className={`text-sm ${isExpired ? 'text-error-600 font-medium' : 'text-neutral-600'}`}>
                        {prop.ad_expiry_date ? formatDate(prop.ad_expiry_date) : 'No expiry'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/properties/${prop.id}`} target="_blank" className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/admin/properties/${prop.id}/edit`} className="p-1.5 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => toggleFeatured(prop)} className={`p-1.5 rounded-lg transition-colors ${prop.is_featured ? 'text-accent-500 hover:bg-accent-50' : 'text-neutral-400 hover:text-accent-500 hover:bg-accent-50'}`} title="Toggle Featured">
                          <Star className="w-4 h-4" fill={prop.is_featured ? 'currentColor' : 'none'} />
                        </button>
                        <button onClick={() => toggleVerified(prop)} className={`p-1.5 rounded-lg transition-colors ${prop.is_verified ? 'text-primary-600 hover:bg-primary-50' : 'text-neutral-400 hover:text-primary-600 hover:bg-primary-50'}`} title="Toggle Verified">
                          <BadgeCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => toggleActive(prop)} className={`p-1.5 rounded-lg transition-colors ${prop.is_active ? 'text-success-600 hover:bg-success-50' : 'text-neutral-400 hover:text-success-600 hover:bg-success-50'}`} title="Toggle Active">
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(prop.id)} className="p-1.5 text-neutral-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-neutral-500 mb-4">No properties found.</p>
          <Link to="/admin/properties/new" className="btn-primary">
            <Plus className="w-5 h-5" /> Add Your First Property
          </Link>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-error-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 text-center mb-2">Delete Property?</h3>
            <p className="text-sm text-neutral-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-error-600 text-white font-semibold rounded-lg hover:bg-error-700 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
