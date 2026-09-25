const fs = require('fs');
const path = require('path');

const dir = (p) => fs.mkdirSync(path.join(__dirname, p), { recursive: true });
const file = (p, content) => fs.writeFileSync(path.join(__dirname, p), content);

dir('src/components');
dir('src/pages');

file('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000080', // Deep Navy Blue
        accent: '#FFD700', // Gold
        background: '#ffffff', // Crisp White
        subtle: '#f3f4f6', // Light Gray
      }
    },
  },
  plugins: [],
}`);

file('src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-subtle text-slate-800;
}`);

file('src/App.tsx', `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Registrations from './pages/Registrations';
import Events from './pages/Events';
import Posts from './pages/Posts';
import Leadership from './pages/Leadership';
import Gallery from './pages/Gallery';
import Messages from './pages/Messages';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="events" element={<Events />} />
          <Route path="posts" element={<Posts />} />
          <Route path="leadership" element={<Leadership />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="messages" element={<Messages />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;`);

file('src/components/Sidebar.tsx', `import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, FileText, UserCheck, Image, Mail, LogOut } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Registrations', path: '/registrations', icon: Users },
  { name: 'Events', path: '/events', icon: Calendar },
  { name: 'News & Posts', path: '/posts', icon: FileText },
  { name: 'Leadership', path: '/leadership', icon: UserCheck },
  { name: 'Gallery', path: '/gallery', icon: Image },
  { name: 'Messages', path: '/messages', icon: Mail },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-primary text-white h-screen sticky top-0 flex flex-col shadow-xl hidden md:flex">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-accent mb-1">Dr Theos</h1>
        <p className="text-xs text-blue-200">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive ? 'bg-white/10 text-accent' : 'hover:bg-white/5'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10">
        <button className="flex items-center space-x-3 px-4 py-3 w-full text-left rounded-lg hover:bg-white/5 transition-colors text-red-300">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}`);

file('src/components/Header.tsx', `import { useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const path = location.pathname;
  let title = "Dashboard Overview";
  if (path.includes('registrations')) title = "Community Registrations";
  else if (path.includes('events')) title = "Events Management";
  else if (path.includes('posts')) title = "News & Posts";
  else if (path.includes('leadership')) title = "Leadership Team";
  else if (path.includes('gallery')) title = "Gallery Management";
  else if (path.includes('messages')) title = "Contact Messages";

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        <div className="text-sm text-gray-500">Working Together. Growing Together. Winning Together.</div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-slate-800">Admin User</div>
          <div className="text-xs text-gray-500">Superadmin</div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent font-bold">
          A
        </div>
      </div>
    </header>
  );
}`);

file('src/components/Layout.tsx', `import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-subtle">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto bg-subtle">
          <Outlet />
        </main>
      </div>
    </div>
  );
}`);

file('src/pages/Dashboard.tsx', `import { Users, FileText, Calendar, Mail } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Members', value: '1,234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { title: 'Published Posts', value: '56', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
          { title: 'Upcoming Events', value: '4', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-100' },
          { title: 'Unread Messages', value: '12', icon: Mail, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={\`p-3 rounded-lg \${stat.bg}\`}>
              <stat.icon className={\`w-6 h-6 \${stat.color}\`} />
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
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <p className="text-sm text-gray-600 flex-1">New member <span className="font-semibold text-primary">John Doe</span> registered.</p>
              <span className="text-xs text-gray-400">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`);

file('src/pages/Registrations.tsx', `import { Search } from 'lucide-react';

const mockData = [
  { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '555-0101', interest: 'Volunteering', date: '2023-10-01' },
  { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '555-0102', interest: 'Donations', date: '2023-10-02' },
  { id: 3, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '555-0103', interest: 'Events', date: '2023-10-03' },
];

export default function Registrations() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search members..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 text-sm"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">First Name</th>
              <th className="px-6 py-4">Last Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Area of Interest</th>
              <th className="px-6 py-4">Date Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">{row.firstName}</td>
                <td className="px-6 py-4">{row.lastName}</td>
                <td className="px-6 py-4">{row.email}</td>
                <td className="px-6 py-4">{row.phone}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">{row.interest}</span>
                </td>
                <td className="px-6 py-4 text-gray-500">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
        <span>Showing 1 to 3 of 3 entries</span>
        <div className="flex space-x-1">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
          <button className="px-3 py-1 bg-primary text-white rounded">1</button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}`);

file('src/pages/Events.tsx', `import { Plus } from 'lucide-react';

const mockEvents = [
  { id: 1, title: 'Annual General Meeting', date: '2023-11-15', venue: 'Community Center', status: 'Upcoming' },
  { id: 2, title: 'Fundraising Gala', date: '2023-12-01', venue: 'Grand Hotel', status: 'Upcoming' },
  { id: 3, title: 'Volunteer Orientation', date: '2023-09-20', venue: 'Virtual', status: 'Completed' },
];

export default function Events() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Venue</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{event.title}</td>
                  <td className="px-6 py-4 text-gray-600">{event.date}</td>
                  <td className="px-6 py-4 text-gray-600">{event.venue}</td>
                  <td className="px-6 py-4">
                    <span className={\`px-3 py-1 rounded-full text-xs font-medium \${
                      event.status === 'Upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }\`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-primary hover:underline font-medium">Edit</button>
                    <button className="text-red-600 hover:underline font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}`);

file('src/pages/Posts.tsx', `import { Plus } from 'lucide-react';

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
                  <span className={\`px-3 py-1 rounded-full text-xs font-medium \${
                    post.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }\`}>
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
}`);

file('src/pages/Leadership.tsx', `import { GripVertical } from 'lucide-react';

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
}`);

file('src/pages/Gallery.tsx', `import { UploadCloud } from 'lucide-react';

const mockPhotos = [
  { id: 1, url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=500&q=80', category: 'Events' },
  { id: 2, url: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=500&q=80', category: 'Community' },
  { id: 3, url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&q=80', category: 'Fundraising' },
  { id: 4, url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=500&q=80', category: 'Events' },
];

export default function Gallery() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockPhotos.map((photo) => (
          <div key={photo.id} className="group relative rounded-xl overflow-hidden shadow-sm border border-gray-100 aspect-square bg-gray-100">
            <img src={photo.url} alt="Gallery item" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <span className="text-white text-sm font-medium">{photo.category}</span>
              <button className="mt-2 text-xs text-red-300 hover:text-red-100 self-start font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`);

file('src/pages/Messages.tsx', `
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
          <div key={msg.id} className={\`p-4 flex items-center space-x-4 hover:bg-gray-50/50 transition-colors cursor-pointer \${msg.status === 'New' ? 'bg-blue-50/30' : ''}\`}>
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold flex-shrink-0">
              {msg.sender.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <h4 className={\`truncate text-sm \${msg.status === 'New' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}\`}>{msg.sender}</h4>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{msg.date}</span>
              </div>
              <p className={\`truncate text-sm \${msg.status === 'New' ? 'font-semibold text-slate-800' : 'text-gray-600'}\`}>{msg.subject}</p>
            </div>
            <div className="flex-shrink-0">
              <span className={\`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                msg.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                msg.status === 'Read' ? 'bg-gray-100 text-gray-600' : 
                'bg-green-100 text-green-700'
              }\`}>
                {msg.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`);
