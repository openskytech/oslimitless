import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  downloads: '#6366f1',
  active_users: '#10b981',
  purchases: '#f59e0b',
  revenue: '#ec4899'
};

export default function AnalyticsChart({ 
  title, 
  data, 
  dataKeys = ['downloads', 'active_users'], 
  type = 'area' 
}) {
  const ChartComponent = type === 'area' ? AreaChart : type === 'bar' ? BarChart : LineChart;

  const formatValue = (value, key) => {
    if (key === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                {dataKeys.map(key => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[key]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS[key]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                }}
                formatter={(value, name) => [formatValue(value, name), name.replace('_', ' ')]}
              />
              <Legend />
              {dataKeys.map(key => (
                type === 'area' ? (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[key]}
                    strokeWidth={2}
                    fill={`url(#gradient-${key})`}
                    name={key.replace('_', ' ')}
                  />
                ) : type === 'bar' ? (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[key]}
                    radius={[4, 4, 0, 0]}
                    name={key.replace('_', ' ')}
                  />
                ) : (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[key]}
                    strokeWidth={2}
                    dot={false}
                    name={key.replace('_', ' ')}
                  />
                )
              ))}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}