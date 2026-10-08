import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Heart, Search, User, ChevronDown, LogOut, LayoutDashboard, Bell, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (user) {
      (async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .or(`user_id.eq.${user.id},user_id.is.null`)
          .eq('is_read', false);
        setUnreadCount(count ?? 0);
      })();
    }
  }, [user, location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/properties', label: 'Properties' },
    { to: '/properties?type=houses', label: 'Houses' },
    { to: '/properties?type=estates', label: 'Estates' },
    { to: '/properties?type=lands', label: 'Land & Plots' },
    { to: '/properties?type=commercial_buildings', label: 'Commercial' },
    { to: '/blog', label: 'Blog' },
    { to: '/advertise', label: 'Advertise' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/properties?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white shadow-lg py-2' : 'bg-white/95 backdrop-blur-md py-3'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/assets/images/logo.jpg"
              alt="A.S Properties"
              className="w-12 h-12 rounded-xl object-cover group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md"
            />
            <div>
              <span className="font-serif text-xl font-bold text-neutral-900 block leading-none">
                A.S Properties
              </span>
              <span className="text-xs text-accent-600 font-semibold tracking-wider">
                NIGERIA
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-3 py-2 text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors duration-200 group/nav"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary-600 rounded-full transition-all duration-300 group-hover/nav:w-full" />
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/favorites"
              className="p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Favorites"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {user && isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 max-w-[100px] truncate">
                    {profile?.full_name || user.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-neutral-100 py-2 z-50 animate-fade-in-up">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-semibold text-neutral-900 truncate">
                          {profile?.full_name || 'My Account'}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" /> My Dashboard
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Bell className="w-4 h-4" /> Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto bg-error-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-error-50 hover:text-error-600 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors px-3 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button
            className="lg:hidden p-2 text-neutral-700"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {searchOpen && (
          <div className="hidden lg:block mt-3 animate-fade-in-up">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location, property type, or keyword..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </form>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="lg:hidden bg-white border-t border-neutral-200 animate-fade-in-up">
          <div className="container-custom py-4 space-y-1">
            <form onSubmit={handleSearch} className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-3 py-2.5 text-sm font-medium text-neutral-700 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-200 flex gap-2">
              <Link to="/favorites" className="flex-1 btn-ghost text-sm">
                <Heart className="w-4 h-4" /> Favorites
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="flex-1 text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 transition-colors">
                      <Shield className="w-4 h-4" /> Admin
                    </Link>
                  )}
                  <Link to="/dashboard" className="flex-1 btn-outline text-sm">
                    Dashboard
                  </Link>
                  <button onClick={handleSignOut} className="flex-1 btn-primary text-sm">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex-1 btn-outline text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="flex-1 btn-primary text-sm">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
