import { Users, FileText, Calendar, Mail, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';

interface DashboardStats {
  totalMembers: number;
  publishedPosts: number;
  upcomingEvents: number;
  unreadMessages: number;
  recentActivity: Array<{ id: number; description: string; date: string }>;
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await apiClient.get('/v1/admin/dashboard');
      return response.data.data as DashboardStats;
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="text-red-500">Failed to load dashboard data.</div>;
  }

  const statCards = [
    { title: 'Total Members', value: data.totalMembers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Published Posts', value: data.publishedPosts, icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Upcoming Events', value: data.upcomingEvents, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Unread Messages', value: data.unreadMessages, icon: Mail, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Recent Activity</h3>
        <div className="space-y-4">
          {data.recentActivity?.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <p className="text-sm text-gray-600 flex-1">{activity.description}</p>
              <span className="text-xs text-gray-400">{new Date(activity.date).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}