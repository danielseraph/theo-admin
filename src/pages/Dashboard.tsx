import { Users, FileText, Calendar, Mail, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';

interface DashboardStats {
  totalRegistered: number;
  registeredToday: number;
  registeredThisWeek: number;
  registeredThisMonth: number;
  totalPosts: number;
  publishedPosts: number;
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
    { title: 'Total Members',    value: data.totalRegistered,  icon: Users,    color: 'text-blue-600',   bg: 'bg-blue-100' },
    { title: 'Registered Today', value: data.registeredToday,  icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Total Posts',      value: data.totalPosts,       icon: FileText, color: 'text-green-600',  bg: 'bg-green-100' },
    { title: 'Published Posts',  value: data.publishedPosts,   icon: Mail,     color: 'text-red-600',    bg: 'bg-red-100' },
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Registered This Week</p>
          <h3 className="text-3xl font-bold text-slate-800">{data.registeredThisWeek}</h3>
          <p className="text-xs text-green-600 mt-1 font-medium">↑ Past 7 days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Registered This Month</p>
          <h3 className="text-3xl font-bold text-slate-800">{data.registeredThisMonth}</h3>
          <p className="text-xs text-blue-600 mt-1 font-medium">↑ Past 30 days</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Post Publish Rate</p>
          <h3 className="text-3xl font-bold text-slate-800">
            {data.totalPosts > 0 ? Math.round((data.publishedPosts / data.totalPosts) * 100) : 0}%
          </h3>
          <p className="text-xs text-gray-400 mt-1">{data.publishedPosts} of {data.totalPosts} posts published</p>
        </div>
      </div>
    </div>
  );
}