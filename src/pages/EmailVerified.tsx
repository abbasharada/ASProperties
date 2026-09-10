import { Link } from 'react-router-dom';
import { MailCheck, LogIn } from 'lucide-react';

export default function EmailVerified() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-primary-900 to-neutral-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <img src="/assets/images/1787689787291.svg" alt="A.S Properties" className="w-12 h-12 rounded-xl object-cover" />
          <div>
            <span className="font-serif text-2xl font-bold text-white block leading-none">A.S Properties</span>
            <span className="text-sm text-accent-500 font-semibold tracking-wider">NIGERIA</span>
          </div>
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-success-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Your email has been verified!</h1>
          <p className="text-neutral-500 mb-6">
            Your account is now active. You can sign in to start browsing and saving properties.
          </p>
          <Link to="/login" className="btn-primary w-full inline-flex items-center justify-center gap-2">
            <LogIn className="w-5 h-5" /> Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
