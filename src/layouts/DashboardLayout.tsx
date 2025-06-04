import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { 
  LayoutDashboard, 
  FileEdit, 
  MailPlus, 
  Gift, 
  Users, 
  Link as LinkIcon, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Bell,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        const { data } = await supabase
          .from('auth')
          .select('is_admin')
          .eq('email', user.email)
          .maybeSingle();
        
        setIsAdmin(!!data?.is_admin);
      }
    };

    checkAdmin();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const baseNavItems = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Formulaires', path: '/review-forms', icon: <FileEdit size={20} /> },
    { name: 'Campagnes', path: '/campaigns', icon: <MailPlus size={20} /> },
    { name: 'Cadeaux', path: '/gifts', icon: <Gift size={20} /> },
    { name: 'Clients', path: '/customers', icon: <Users size={20} /> },
    { name: 'Connexions', path: '/connections', icon: <LinkIcon size={20} /> },
    { name: 'Paramètres', path: '/settings', icon: <Settings size={20} /> },
  ];

  const adminNavItems = isAdmin ? [
    { name: 'Admin Dashboard', path: '/admin', icon: <Shield size={20} /> },
    ...baseNavItems
  ] : baseNavItems;

  const activeNavClass = "flex items-center gap-3 px-4 py-3 bg-primary-50 text-primary-600 font-medium rounded-lg";
  const inactiveNavClass = "flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <div className="ml-3 text-xl font-bold text-primary-600">ABK Review</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
            {user?.full_name?.[0] || '?'}
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
      )}
      
      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="text-xl font-bold text-primary-600">ABK Review</div>
          <button 
            onClick={closeMobileMenu}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto h-full py-4">
          <nav className="px-4 space-y-2">
            {adminNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => isActive ? activeNavClass : inactiveNavClass}
                onClick={closeMobileMenu}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto px-4 py-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <LogOut size={20} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside 
          className={`bg-white border-r border-gray-200 transition-all duration-300 hidden lg:block ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className={`p-4 flex ${sidebarOpen ? 'justify-between' : 'justify-center'} items-center border-b border-gray-200`}>
            {sidebarOpen && <div className="text-xl font-bold text-primary-600">ABK Review</div>}
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
          </div>
          <div className="p-4">
            <nav className="space-y-2">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    isActive 
                      ? `${activeNavClass} ${!sidebarOpen && 'justify-center px-2'}`
                      : `${inactiveNavClass} ${!sidebarOpen && 'justify-center px-2'}`
                  }
                  title={!sidebarOpen ? item.name : undefined}
                >
                  {item.icon}
                  {sidebarOpen && <span>{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout}
              className={`flex ${!sidebarOpen && 'justify-center'} items-center gap-3 px-4 py-3 w-full text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200`}
              title={!sidebarOpen ? 'Déconnexion' : undefined}
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Déconnexion</span>}
            </button>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="hidden lg:flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-800">
              {/* Page title would be set by individual pages */}
            </h1>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                  {user?.full_name?.[0] || '?'}
                </div>
                <div>
                  <div className="font-medium text-sm">{user?.full_name}</div>
                  <div className="text-xs text-gray-500">{user?.company_name}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;