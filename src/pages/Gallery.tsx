import { UploadCloud } from 'lucide-react';

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
}