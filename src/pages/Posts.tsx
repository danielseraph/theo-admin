import { Plus } from 'lucide-react';

const mockPosts = [
  { id: 1, title: 'New Community Initiative Launched', category: 'News', status: 'Published', date: '2023-10-10' },
  { id: 2, title: 'Message from the Chairman', category: 'Announcement', status: 'Draft', date: '2023-10-12' },
];

export default function Posts() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockPosts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{post.title}</td>
                <td className="px-6 py-4 text-gray-600">{post.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    post.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{post.date}</td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-primary hover:underline font-medium">Edit</button>
                  {post.status === 'Draft' && <button className="text-green-600 hover:underline font-medium">Publish</button>}
                  <button className="text-red-600 hover:underline font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}