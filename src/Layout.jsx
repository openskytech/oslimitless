import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  Home, Settings, LogOut, Bell, Crown, Users, 
  Lock, Menu, X, Zap
} from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

export default function Layout() {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [workspace, setWorkspace] = useState(null);

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
    { name: 'Vault', icon: Lock, page: 'Vault' },
    { name: 'Team', icon: Users, page: 'Team' },
    { name: 'Settings', icon: Settings, page: 'Settings' }
  ];

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
          background: "#fff",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        >
          {/* Replace with your icon if you want */}
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path
              d="M13 2L3 14h8l-1 8 11-14h-8l0-6z"
              stroke="#7C8CF8"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ fontSize: 20, color: "#5b6270" }}>Loading OSLimitless...</div>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.98); opacity: 0.65; }
            50% { transform: scale(1.03); opacity: 1; }
            100% { transform: scale(0.98); opacity: 0.65; }
          }
        `}</style>
      </div>
    );
  }

  // Provide context to child pages (optional, but useful)
  // If you already have a context provider, plug these values in there instead.
  return (
    <div style={{ minHeight: "100vh" }}>
      {/* 
        If your app expects layout-level UI (nav/sidebar), keep it here.
        Outlet renders the routed page.
      */}
      <Outlet context={{ user, membership, workspace }} />
    </div>
  );
}
