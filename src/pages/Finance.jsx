import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react';

export default function Finance() {
  const [workspace, setWorkspace] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      const memberships = await base44.entities.WorkspaceMember.filter({ user_email: currentUser.email });
      if (memberships.length > 0) {
        const workspaces = await base44.entities.Workspace.filter({ id: memberships[0].workspace_id });
        if (workspaces.length > 0) {
          setWorkspace(workspaces[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const { data: analytics = [] } = useQuery({
    queryKey: ['projectAnalytics', workspace?.id],
    queryFn: () => base44.entities.ProjectAnalytics.filter({ workspace_id: workspace?.id }, '-date', 100),
    enabled: !!workspace?.id,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects', workspace?.id],
    queryFn: () => base44.entities.Project.filter({ workspace_id: workspace?.id }),
    enabled: !!workspace?.id,
  });

  // Calculate totals and summaries
  const totalRevenue = analytics.reduce((sum, entry) => sum + (entry.revenue || 0), 0);
  const totalDownloads = analytics.reduce((sum, entry) => sum + (entry.downloads || 0), 0);
  const totalPurchases = analytics.reduce((sum, entry) => sum + (entry.purchases || 0), 0);
  const totalActiveUsers = Math.max(...analytics.map(e => e.active_users || 0), 0);

  // Group analytics by date for trending
  const trendingData = analytics.reduce((acc, entry) => {
    const existing = acc.find(d => d.date === entry.date);
    if (existing) {
      existing.revenue += entry.revenue || 0;
      existing.downloads += entry.downloads || 0;
    } else {
      acc.push({
        date: entry.date,
        revenue: entry.revenue || 0,
        downloads: entry.downloads || 0,
      });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30);

  // Group by platform
  const platformData = projects.map(project => ({
    name: project.name,
    revenue: analytics
      .filter(a => a.project_id === project.id)
      .reduce((sum, a) => sum + (a.revenue || 0), 0),
  })).filter(p => p.revenue > 0);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-2">Track revenue, downloads, and user metrics across your projects</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <Activity className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPurchases.toLocaleString()}</div>
              <p className="text-xs text-gray-600">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Active Users</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActiveUsers.toLocaleString()}</div>
              <p className="text-xs text-gray-600">Single day peak</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trending Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Downloads Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trendingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      name="Revenue ($)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="downloads"
                      stroke="#3b82f6"
                      name="Downloads"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No analytics data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Project Revenue Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Project</CardTitle>
            </CardHeader>
            <CardContent>
              {platformData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No project revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed Table */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4 font-medium">Date</th>
                    <th className="text-left py-2 px-4 font-medium">Project</th>
                    <th className="text-left py-2 px-4 font-medium">Downloads</th>
                    <th className="text-left py-2 px-4 font-medium">Purchases</th>
                    <th className="text-left py-2 px-4 font-medium">Revenue</th>
                    <th className="text-left py-2 px-4 font-medium">Active Users</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.length > 0 ? (
                    analytics.slice(-20).map((entry) => {
                      const project = projects.find(p => p.id === entry.project_id);
                      return (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4">{entry.date}</td>
                          <td className="py-2 px-4">{project?.name || 'Unknown'}</td>
                          <td className="py-2 px-4">{entry.downloads.toLocaleString()}</td>
                          <td className="py-2 px-4">{entry.purchases.toLocaleString()}</td>
                          <td className="py-2 px-4 font-medium">${entry.revenue.toLocaleString()}</td>
                          <td className="py-2 px-4">{entry.active_users.toLocaleString()}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        No analytics data available yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}