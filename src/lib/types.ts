export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  property_type: string;
  status: string;
  state: string;
  city: string;
  area: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  land_size: number;
  built_size: number;
  features: string[];
  images: string[];
  videos: string[];
  is_featured: boolean;
  is_verified: boolean;
  views: number;
  ad_start_date: string | null;
  ad_expiry_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id: string | null;
  inquiry_type: string;
  status: string;
  user_id: string | null;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
  category: string;
  is_published: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  message: string;
  rating: number;
  avatar_url: string;
  is_active: boolean;
  created_at: string;
}

export interface AdPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_popular: boolean;
  display_order: number;
  is_active: boolean;
}

export interface SiteSettings {
  id: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  whatsapp_number: string;
  phone_number: string;
  email: string;
  office_address: string;
  about_text: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  tiktok_url: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  property_id: string;
  session_id: string;
  user_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  user_id: string | null;
  is_active: boolean;
  subscribed_at: string;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export const PROPERTY_TYPES = [
  { value: 'houses', label: 'Houses' },
  { value: 'estates', label: 'Estates' },
  { value: 'lands', label: 'Lands' },
  { value: 'plots', label: 'Plots' },
  { value: 'shops', label: 'Shops' },
  { value: 'offices', label: 'Offices' },
  { value: 'warehouses', label: 'Warehouses' },
  { value: 'commercial_buildings', label: 'Commercial Buildings' },
];

export const PROPERTY_STATUS = [
  { value: 'for_sale', label: 'For Sale' },
  { value: 'for_rent', label: 'For Rent' },
  { value: 'sold', label: 'Sold' },
  { value: 'rented', label: 'Rented' },
];

export const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Delta', 'Edo',
  'Kaduna', 'Ogun', 'Anambra', 'Imo', 'Cross River', 'Akwa Ibom',
  'Plateau', 'Benue', 'Ondo', 'Ekiti', 'Osun', 'Kwara',
];
