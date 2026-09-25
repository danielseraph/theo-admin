
const mockMessages = [
  { id: 1, sender: 'Mark Taylor', email: 'mark@example.com', subject: 'Partnership Inquiry', status: 'New', date: 'Oct 24' },
  { id: 2, sender: 'Sarah Connor', email: 'sarah@example.com', subject: 'Volunteering Question', status: 'Read', date: 'Oct 23' },
  { id: 3, sender: 'James Bond', email: 'james@example.com', subject: 'Donation Receipt', status: 'Resolved', date: 'Oct 21' },
];

export default function Messages() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {mockMessages.map((msg) => (
          <div key={msg.id} className={`p-4 flex items-center space-x-4 hover:bg-gray-50/50 transition-colors cursor-pointer ${msg.status === 'New' ? 'bg-blue-50/30' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
              {msg.sender.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className={`truncate text-sm ${msg.status === 'New' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{msg.sender}</h4>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{msg.date}</span>
              </div>
              <p className={`truncate text-sm ${msg.status === 'New' ? 'font-semibold text-slate-800' : 'text-gray-600'}`}>{msg.subject}</p>
            </div>
            <div className="flex-shrink-0">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                msg.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                msg.status === 'Read' ? 'bg-gray-100 text-gray-600' : 
                'bg-green-100 text-green-700'
              }`}>
                {msg.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}