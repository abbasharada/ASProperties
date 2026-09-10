import { useEffect, useState } from 'react';
import {
  Phone, Mail, MessageCircle, Check, ArrowRight, Star, TrendingUp,
  Shield, Users, Eye, BadgeCheck, Crown, Building2, Package,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AdPackage } from '../lib/types';
import { useSettings } from '../hooks/useSettings';
import ContactForm from '../components/ContactForm';
import { formatPrice } from '../lib/utils';

export default function Advertise() {
  const { settings } = useSettings();
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ad_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(({ data }) => {
        setPackages(data || []);
        setLoading(false);
      });
  }, []);

  const steps = [
    { num: 1, title: 'Contact Admin', desc: 'Reach out to us via WhatsApp, phone, or the contact form to express your interest.' },
    { num: 2, title: 'Send Property Details', desc: 'Provide us with property photos, videos, description, and all relevant details.' },
    { num: 3, title: 'Make Payment', desc: 'Choose and pay for your preferred advertising package from the options below.' },
    { num: 4, title: 'Property is Published', desc: 'We publish your property on our platform with professional presentation.' },
    { num: 5, title: 'Ad Runs Until Expiry', desc: 'Your advertisement runs for the duration of your package, reaching thousands of buyers.' },
  ];

  const benefits = [
    { icon: Users, title: 'Reach 10,000+ Buyers', desc: 'Our platform attracts serious property buyers and investors from across Nigeria and the diaspora.' },
    { icon: TrendingUp, title: 'Sell Faster', desc: 'Properties advertised on our platform sell 3x faster than traditional methods.' },
    { icon: Shield, title: 'Verified Badge', desc: 'Get a verified badge that builds trust with potential buyers and increases conversion rates.' },
    { icon: Eye, title: 'Maximum Exposure', desc: 'Featured properties get premium homepage placement and priority search ranking.' },
  ];

  const whatsappNumber = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-20">
        <div className="container-custom text-center">
          <span className="inline-block px-4 py-1.5 bg-accent-500/20 text-accent-300 rounded-full text-sm font-semibold mb-6">
            Advertise Your Property
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Reach Thousands of Serious Buyers</h1>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
            A.S Properties is the premier platform for advertising your properties. We connect you with serious buyers and investors across Nigeria and the diaspora.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </a>
            <a href={`tel:${settings?.phone_number || ''}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-neutral-100 transition-all">
              <Phone className="w-5 h-5" /> Call Now
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Advertising your property is simple and straightforward</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="text-center relative">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500">{step.desc}</p>
                {step.num < 5 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-3 w-6 h-6 text-neutral-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Advertise With Us</h2>
            <p className="section-subtitle">The benefits of choosing A.S Properties</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl p-6 shadow-sm text-center group hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
                  <benefit.icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-neutral-500">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="text-accent-600 font-semibold text-sm uppercase tracking-wide">Pricing</span>
            <h2 className="section-title">Advertising Packages</h2>
            <p className="section-subtitle">Choose the package that best suits your needs</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-96 animate-pulse bg-neutral-100 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border-2 relative flex flex-col ${
                    pkg.is_popular ? 'border-primary-600 lg:scale-105' : 'border-neutral-200'
                  }`}
                >
                  {pkg.is_popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="badge bg-primary-600 text-white px-4 py-1.5">
                        <Crown className="w-3 h-3" /> Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-4">
                    <Package className="w-8 h-8 text-primary-600 mb-2" />
                    <h3 className="font-bold text-lg text-neutral-900">{pkg.name}</h3>
                    <p className="text-sm text-neutral-500 mt-1">{pkg.description}</p>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-neutral-900">{formatPrice(pkg.price)}</span>
                    <span className="text-sm text-neutral-500"> / {pkg.duration_days} days</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Check className="w-4 h-4 text-success-600 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`I am interested in the ${pkg.name} (${formatPrice(pkg.price)} for ${pkg.duration_days} days).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full ${pkg.is_popular ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Get Started
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Revenue Options */}
      <section className="py-16 bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Additional Revenue Options</h2>
            <p className="section-subtitle">More ways to maximize your property exposure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Star, title: 'Featured Property Fees', desc: 'Pay extra to feature your property on the homepage for maximum visibility.' },
              { icon: Building2, title: 'Estate Promotion Packages', desc: 'Promote entire housing estates with dedicated showcase pages and custom branding.' },
              { icon: Eye, title: 'Banner Advertisement', desc: 'Real estate companies can place banner ads on our high-traffic pages.' },
              { icon: BadgeCheck, title: 'Property Verification', desc: 'Get a verified trust badge that increases buyer confidence and conversion rates.' },
              { icon: Package, title: 'Custom Packages', desc: 'Need something different? Contact us for custom advertising solutions.' },
              { icon: Users, title: 'Bulk Listings', desc: 'Multiple properties? Ask about our bulk listing discounts.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-accent-600" />
                </div>
                <h3 className="font-bold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="section-title">Get Started Today</h2>
              <p className="section-subtitle">Contact us to advertise your property</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card p-6 text-center group hover:border-success-200"
              >
                <MessageCircle className="w-8 h-8 text-success-500 mx-auto mb-2" />
                <h3 className="font-semibold text-neutral-900">WhatsApp</h3>
                <p className="text-sm text-neutral-500">{settings?.whatsapp_number || 'Chat with us'}</p>
              </a>
              <a href={`tel:${settings?.phone_number || ''}`} className="card p-6 text-center group hover:border-primary-200">
                <Phone className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <h3 className="font-semibold text-neutral-900">Phone Call</h3>
                <p className="text-sm text-neutral-500">{settings?.phone_number || 'Call us'}</p>
              </a>
              <a href={`mailto:${settings?.email || ''}`} className="card p-6 text-center group hover:border-accent-200">
                <Mail className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                <h3 className="font-semibold text-neutral-900">Email</h3>
                <p className="text-sm text-neutral-500">{settings?.email || 'Email us'}</p>
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="font-bold text-xl text-neutral-900 mb-6">Send Us a Message</h3>
              <ContactForm inquiryType="advertise" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
