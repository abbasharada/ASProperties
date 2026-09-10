import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import ContactForm from '../components/ContactForm';

export default function Contact() {
  const { settings } = useSettings();
  const whatsappNumber = settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="bg-neutral-900 text-white py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Contact Us</h1>
          <p className="text-neutral-300">Get in touch with A.S Properties</p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Get in Touch</h2>
            <p className="text-neutral-600 mb-8">
              Have questions about advertising your property or need more information about any listing?
              We are here to help. Reach out to us through any of the channels below.
            </p>

            <div className="space-y-4">
              {settings?.whatsapp_number && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center group-hover:bg-success-500 transition-colors">
                    <MessageCircle className="w-6 h-6 text-success-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">WhatsApp</h3>
                    <p className="text-sm text-neutral-500">{settings.whatsapp_number}</p>
                  </div>
                </a>
              )}

              {settings?.phone_number && (
                <a href={`tel:${settings.phone_number}`} className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                    <Phone className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Phone</h3>
                    <p className="text-sm text-neutral-500">{settings.phone_number}</p>
                  </div>
                </a>
              )}

              {settings?.email && (
                <a href={`mailto:${settings.email}`} className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center group-hover:bg-accent-500 transition-colors">
                    <Mail className="w-6 h-6 text-accent-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Email</h3>
                    <p className="text-sm text-neutral-500">{settings.email}</p>
                  </div>
                </a>
              )}

              {settings?.office_address && (
                <div className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm">
                  <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Office Address</h3>
                    <p className="text-sm text-neutral-500">{settings.office_address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Send a Message</h2>
            <ContactForm inquiryType="general" />
          </div>
        </div>
      </div>
    </div>
  );
}
