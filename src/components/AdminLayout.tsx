import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard, Building2, Mail, Newspaper, Settings, Star, Package,
  LogOut, Menu, X, Users, Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children, title }: { children: ReactNode; title: string }) {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/properties', label: 'Properties', icon: Building2 },
    { to: '/admin/inquiries', label: 'Inquiries', icon: Mail },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/blog', label: 'Blog Posts', icon: Newspaper },
    { to: '/admin/newsletter', label: 'Newsletter', icon: Send },
    { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
    { to: '/admin/packages', label: 'Ad Packages', icon: Package },
    { to: '/admin/settings', label: 'Site Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-neutral-900 text-white z-50 transition-transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6">
          <Link to="/admin" className="flex items-center gap-2 mb-8" onClick={() => setSidebarOpen(false)}>
            <img src="/assets/images/1787689787291.svg" alt="A.S Properties" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <span className="font-serif text-lg font-bold block leading-none">A.S Properties</span>
              <span className="text-xs text-accent-500 font-semibold tracking-wider">ADMIN</span>
            </div>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-primary-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:bg-error-600 hover:text-white transition-colors w-full mt-8"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-neutral-600">
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
            </div>
            <Link to="/" target="_blank" className="text-sm text-primary-600 hover:underline">
              View Website
            </Link>
          </div>
        </header>

        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
