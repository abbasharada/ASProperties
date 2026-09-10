import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactFormProps {
  propertyId?: string;
  inquiryType?: string;
  compact?: boolean;
}

export default function ContactForm({ propertyId, inquiryType = 'general', compact = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('inquiries').insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      property_id: propertyId || null,
      inquiry_type: inquiryType,
    });

    if (error) {
      setError('Failed to send message. Please try again.');
    } else {
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className={`text-center py-8 ${compact ? '' : 'py-12'}`}>
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-success-600" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">Message Sent!</h3>
        <p className="text-neutral-500">We will get back to you as soon as possible.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-primary-600 font-medium hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={compact ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="input-field"
            placeholder="+234 800 000 0000"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="input-field"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Message *</label>
        <textarea
          required
          rows={compact ? 3 : 4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="input-field resize-none"
          placeholder="Tell us what you are looking for..."
        />
      </div>
      {error && (
        <div className="bg-error-50 text-error-600 text-sm p-3 rounded-lg">{error}</div>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Sending...' : 'Send Message'}
        {!submitting && <Send className="w-4 h-4" />}
      </button>
    </form>
  );
}
