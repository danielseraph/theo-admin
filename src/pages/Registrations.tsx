import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  state: string;
  country: string;
  areaOfInterest: string;
  createdAt: string;
}

interface PaginatedResponse {
  data: Member[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function Registrations() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['registrations', page, search],
    queryFn: async () => {
      const url = search 
        ? `/v1/admin/registrations?page=${page}&limit=20&search=${encodeURIComponent(search)}`
        : `/v1/admin/registrations?page=${page}&limit=20`;
      const response = await apiClient.get(url);
      return response.data as PaginatedResponse;
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 text-sm"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto min-h-[300px]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : isError ? (
          <div className="p-6 text-red-500 text-center">Failed to load registrations.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">First Name</th>
                <th className="px-6 py-4">Last Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">State / Country</th>
                <th className="px-6 py-4">Area of Interest</th>
                <th className="px-6 py-4">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {result?.data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">{row.firstName}</td>
                  <td className="px-6 py-4">{row.lastName}</td>
                  <td className="px-6 py-4 text-gray-600">{row.email}</td>
                  <td className="px-6 py-4 text-gray-600">{row.phoneNumber}</td>
                  <td className="px-6 py-4 text-gray-600">{row.state}, {row.country}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{row.areaOfInterest}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {result?.data.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {result && result.pagination && (
        <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
          <span>
            Showing page {result.pagination.page} of {result.pagination.totalPages} ({result.pagination.total} total)
          </span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded">{page}</button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= result.pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}