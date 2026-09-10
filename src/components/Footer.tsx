import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, CheckCircle } from 'lucide-react';
import { TikTokIcon } from '../lib/icons';
import { useSettings } from '../hooks/useSettings';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const { settings } = useSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: email.trim(), is_active: true }, { onConflict: 'email' });
    if (!error) {
      setSubscribed(true);
      setEmail('');
    }
    setSubscribing(false);
  };

  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/assets/images/1787689787291.svg" alt="A.S Properties" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <span className="font-serif text-xl font-bold text-white block leading-none">
                  A.S Properties
                </span>
                <span className="text-xs text-accent-500 font-semibold tracking-wider">
                  NIGERIA
                </span>
              </div>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-4 max-w-sm">
              The premier real estate platform in Nigeria. We connect property owners,
              developers, and agents with serious buyers and investors.
            </p>
            <div className="flex gap-3">
              {settings?.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-200">
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.twitter_url && (
                <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-200">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {settings?.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-200">
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.linkedin_url && (
                <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-200">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings?.tiktok_url && (
                <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all duration-200">
                  <TikTokIcon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties" className="hover:text-primary-400 transition-colors">Browse Properties</Link></li>
              <li><Link to="/properties?type=houses" className="hover:text-primary-400 transition-colors">Houses</Link></li>
              <li><Link to="/properties?type=estates" className="hover:text-primary-400 transition-colors">Estates</Link></li>
              <li><Link to="/properties?type=lands" className="hover:text-primary-400 transition-colors">Land & Plots</Link></li>
              <li><Link to="/properties?type=commercial_buildings" className="hover:text-primary-400 transition-colors">Commercial</Link></li>
              <li><Link to="/blog" className="hover:text-primary-400 transition-colors">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              {settings?.phone_number && (
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                  <a href={`tel:${settings.phone_number}`} className="hover:text-primary-400 transition-colors">{settings.phone_number}</a>
                </li>
              )}
              {settings?.email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-primary-400 transition-colors">{settings.email}</a>
                </li>
              )}
              {settings?.office_address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                  <span>{settings.office_address}</span>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Newsletter</h3>
            <p className="text-sm text-neutral-400 mb-3">Get the latest property updates and news.</p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-success-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm">Subscribed successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button type="submit" disabled={subscribing} className="w-full btn-primary text-sm py-2.5">
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                  {!subscribing && <Send className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-800">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} A.S Properties. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-neutral-500">
            <Link to="/contact" className="hover:text-primary-400 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="hover:text-primary-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
