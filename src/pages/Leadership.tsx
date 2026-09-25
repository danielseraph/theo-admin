import { GripVertical } from 'lucide-react';

const mockLeaders = [
  { id: 1, name: 'Dr. Theos', role: 'Founder & Chairman', category: 'Board', photo: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'Jane Doe', role: 'Executive Director', category: 'Executive', photo: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'John Smith', role: 'Treasurer', category: 'Board', photo: 'https://i.pravatar.cc/150?u=3' },
];

export default function Leadership() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h3 className="font-semibold text-slate-800">Team Members</h3>
        <button className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">Add Member</button>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500 mb-4 flex items-center"><GripVertical className="w-4 h-4 mr-1"/> Drag and drop rows to reorder display.</p>
        <div className="space-y-3">
          {mockLeaders.map((leader) => (
            <div key={leader.id} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300 transition-colors cursor-move group">
              <GripVertical className="w-5 h-5 text-gray-400 mr-4 group-hover:text-gray-600" />
              <img src={leader.photo} alt={leader.name} className="w-10 h-10 rounded-full object-cover mr-4" />
              <div className="flex-1">
                <h4 className="font-medium text-slate-800">{leader.name}</h4>
                <p className="text-xs text-gray-500">{leader.role}</p>
              </div>
              <div className="mx-4">
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">{leader.category}</span>
              </div>
              <div className="flex space-x-2">
                <button className="text-sm text-gray-500 hover:text-primary font-medium px-2 py-1">Edit</button>
                <button className="text-sm text-gray-500 hover:text-red-600 font-medium px-2 py-1">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}