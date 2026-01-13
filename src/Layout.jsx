import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  Home, Settings, LogOut, Bell, Crown, Users, 
  Lock, Menu, X, Zap, DollarSign
} from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
    document.documentElement.classList.remove('dark');
  }, [currentPageName]);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const memberships = await base44.entities.WorkspaceMember.filter({ user_email: currentUser.email });
      if (memberships.length > 0) {
        setMembership(memberships[0]);
        const workspaces = await base44.entities.Workspace.filter({ id: memberships[0].workspace_id });
        if (workspaces.length > 0) {
          setWorkspace(workspaces[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ 
      user_email: user.email,
      is_read: false
    }, '-created_date', 10),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    ...(membership?.role === 'ceo' ? [{ name: 'CEO Inbox', icon: Crown, page: 'CEOInbox' }] : []),
    ...(membership?.role === 'ceo' ? [{ name: 'Finances', icon: DollarSign, page: 'Finances' }] : []),
    { name: 'Vault', icon: Lock, page: 'Vault' },
    { name: 'Team', icon: Users, page: 'Team' },
    { name: 'Settings', icon: Settings, page: 'Settings' }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <Zap className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading OSLimitless...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-black text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              {workspace?.logo_url ? (
                <img src={workspace.logo_url} alt={workspace.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <Zap className="w-8 h-8" />
              )}
              <div>
                <h1 className="text-xl font-bold">OSLimitless</h1>
                {workspace && (
                  <p className="text-xs text-white/80">{workspace.name}</p>
                )}
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white hover:bg-white/10"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>

              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-white/20">
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-medium whitespace-nowrap text-center">{membership?.user_name || user.full_name || user.email}</p>
                  {membership && <RoleBadge role={membership.role} size="xs" />}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-gray-900">
            <div className="px-4 py-4 space-y-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white w-full transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}