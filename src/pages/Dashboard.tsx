import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Heart, Mail, Bell, Save, Check, Trash2, Building2, Upload, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Property, Inquiry, Notification } from '../lib/types';
import PropertyCard from '../components/PropertyCard';

type Tab = 'profile' | 'favorites' | 'inquiries' | 'notifications';

export default function Dashboard() {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    setFullName(profile?.full_name || '');
    setPhone(profile?.phone || '');
    setAvatarUrl(profile?.avatar_url || '');
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file');
      return;
    }

    setAvatarError(null);
    setUploadingAvatar(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadError) {
      setAvatarError(uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
    const newAvatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(newAvatarUrl);

    await supabase
      .from('profiles')
      .update({ avatar_url: newAvatarUrl })
      .eq('id', user.id);

    await refreshProfile();
    setUploadingAvatar(false);
  };

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    setLoadingFavorites(true);
    const { data: favs } = await supabase
      .from('user_favorites')
      .select('property_id')
      .eq('user_id', user.id);
    if (!favs || favs.length === 0) {
      setFavoriteProperties([]);
      setLoadingFavorites(false);
      return;
    }
    const { data: props } = await supabase
      .from('properties')
      .select('*')
      .in('id', favs.map((f) => f.property_id))
      .eq('is_active', true);
    setFavoriteProperties(props || []);
    setLoadingFavorites(false);
  }, [user]);

  const loadInquiries = useCallback(async () => {
    if (!user) return;
    setLoadingInquiries(true);
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setInquiries(data || []);
    setLoadingInquiries(false);
  }, [user]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoadingNotifications(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .order('created_at', { ascending: false })
      .limit(50);
    setNotifications(data || []);
    setLoadingNotifications(false);
  }, [user]);

  useEffect(() => {
    loadFavorites();
    loadInquiries();
    loadNotifications();
  }, [loadFavorites, loadInquiries, loadNotifications]);

  const [profileError, setProfileError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileSaved(false);
    setProfileError(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user.id);
    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSaved(true);
      await refreshProfile();
      setTimeout(() => setProfileSaved(false), 3000);
    }
    setSavingProfile(false);
  };

  const markNotificationRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .or(`user_id.eq.${user.id},user_id.is.null`)
      .eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const removeFavorite = async (propertyId: string) => {
    if (!user) return;
    await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
    setFavoriteProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  const tabs: { key: Tab; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'favorites', label: 'Favorites', icon: Heart },
    { key: 'inquiries', label: 'Inquiries', icon: Mail },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-neutral-900 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name || 'My Account'}</h1>
              <p className="text-neutral-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-3 shadow-sm flex lg:flex-col gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                  {tab.key === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-error-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {tab.key === 'favorites' && favoriteProperties.length > 0 && (
                    <span className="ml-auto bg-neutral-200 text-neutral-700 text-xs px-2 py-0.5 rounded-full">
                      {favoriteProperties.length}
                    </span>
                  )}
                  {tab.key === 'inquiries' && inquiries.length > 0 && (
                    <span className="ml-auto bg-neutral-200 text-neutral-700 text-xs px-2 py-0.5 rounded-full">
                      {inquiries.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Profile Settings</h2>
                {profileSaved && (
                  <div className="bg-success-50 text-success-600 text-sm p-3 rounded-lg flex items-center gap-2 mb-4">
                    <Check className="w-4 h-4" /> Profile saved successfully
                  </div>
                )}
                {profileError && (
                  <div className="bg-error-50 text-error-600 text-sm p-3 rounded-lg flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4" /> {profileError}
                  </div>
                )}
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="input-field bg-neutral-100 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      placeholder="08012345678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center flex-shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-neutral-300" />
                        )}
                        {uploadingAvatar && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingAvatar}
                          className="btn-outline text-sm py-2"
                        >
                          <Upload className="w-4 h-4" /> Upload Photo
                        </button>
                        <p className="text-xs text-neutral-400 mt-1">JPG, PNG up to 5MB</p>
                        {avatarError && (
                          <p className="text-xs text-error-500 mt-1">{avatarError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={savingProfile} className="btn-primary">
                    {savingProfile ? 'Saving...' : 'Save Changes'} <Save className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Saved Properties</h2>
                {loadingFavorites ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-72 animate-pulse bg-neutral-200 rounded-2xl" />
                    ))}
                  </div>
                ) : favoriteProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {favoriteProperties.map((property) => (
                      <div key={property.id} className="relative group">
                        <PropertyCard property={property} />
                        <button
                          onClick={() => removeFavorite(property.id)}
                          className="absolute top-3 right-3 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error-50"
                          aria-label="Remove favorite"
                        >
                          <Trash2 className="w-4 h-4 text-error-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <Heart className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No favorites yet</h3>
                    <p className="text-neutral-500 mb-6">Browse properties and click the heart icon to save them.</p>
                    <Link to="/properties" className="btn-primary">Browse Properties</Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div>
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Your Inquiries</h2>
                {loadingInquiries ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-32 animate-pulse bg-neutral-200 rounded-2xl" />
                    ))}
                  </div>
                ) : inquiries.length > 0 ? (
                  <div className="space-y-4">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <span className={`badge ${inq.status === 'new' ? 'bg-primary-100 text-primary-700' : 'bg-neutral-100 text-neutral-600'}`}>
                              {inq.inquiry_type}
                            </span>
                            <span className="ml-2 text-xs text-neutral-400">
                              {new Date(inq.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${inq.status === 'new' ? 'bg-primary-50 text-primary-600' : 'bg-neutral-50 text-neutral-500'}`}>
                            {inq.status}
                          </span>
                        </div>
                        {inq.property_id && (
                          <Link to={`/properties/${inq.property_id}`} className="text-sm text-primary-600 hover:underline flex items-center gap-1 mb-2">
                            <Building2 className="w-3.5 h-3.5" /> View Property
                          </Link>
                        )}
                        <p className="text-sm text-neutral-600">{inq.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <Mail className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No inquiries yet</h3>
                    <p className="text-neutral-500">When you contact us about a property, your messages will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-neutral-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-sm text-primary-600 hover:underline">
                      Mark all as read
                    </button>
                  )}
                </div>
                {loadingNotifications ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-20 animate-pulse bg-neutral-200 rounded-2xl" />
                    ))}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`bg-white rounded-2xl p-5 shadow-sm flex items-start gap-4 transition-all ${
                          !notif.is_read ? 'border-l-4 border-primary-600' : ''
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'property' ? 'bg-primary-100' : notif.type === 'inquiry' ? 'bg-accent-100' : 'bg-success-100'
                        }`}>
                          <Bell className={`w-5 h-5 ${
                            notif.type === 'property' ? 'text-primary-600' : notif.type === 'inquiry' ? 'text-accent-600' : 'text-success-600'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-neutral-900 text-sm">{notif.title}</h3>
                          <p className="text-sm text-neutral-500 mt-1">{notif.message}</p>
                          <p className="text-xs text-neutral-400 mt-2">
                            {new Date(notif.created_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <button
                            onClick={() => markNotificationRead(notif.id)}
                            className="text-xs text-primary-600 hover:underline flex-shrink-0"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center">
                    <Bell className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">No notifications</h3>
                    <p className="text-neutral-500">You're all caught up!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
