import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Loader2, GripVertical, Trash2, Edit2, X, 
  UserCheck, FolderOpen 
} from 'lucide-react';
import apiClient from '../apiClient';
import { useToast } from '../context/ToastContext';
import GalleryPickerModal from '../components/GalleryPickerModal';

export interface Leader {
  id: string | number;
  name: string;
  role: string;
  category: string;
  photo?: string;
  photoUrl?: string;
  bio?: string;
  order?: number;
}

export default function Leadership() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState('Executive');
  const [photo, setPhoto] = useState('');
  const [bio, setBio] = useState('');

  // Fetch leadership members
  const { data: leaders, isLoading, isError } = useQuery({
    queryKey: ['leadership'],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/v1/leadership');
        const items = res.data?.data;
        if (Array.isArray(items)) {
          return items as Leader[];
        }
      } catch (err) {
        console.warn('Could not fetch leadership from public endpoint, trying admin:', err);
        const adminRes = await apiClient.get('/v1/admin/leadership');
        return (adminRes.data?.data || []) as Leader[];
      }
      return [] as Leader[];
    },
  });

  const memberList = Array.isArray(leaders) ? leaders : [];

  // Create or Update mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        role,
        category,
        photo: photo || undefined,
        photoUrl: photo || undefined,
        bio: bio || undefined,
      };

      if (editingLeader) {
        await apiClient.put(`/v1/admin/leadership/${editingLeader.id}`, payload);
      } else {
        await apiClient.post('/v1/admin/leadership', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership'] });
      showToast(editingLeader ? 'Team member updated!' : 'Team member added! 🎉');
      handleCloseModal();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to save team member.';
      showToast(msg, 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      await apiClient.delete(`/v1/admin/leadership/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadership'] });
      showToast('Team member removed.');
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete member.';
      showToast(msg, 'error');
    },
  });

  const handleOpenCreate = () => {
    setEditingLeader(null);
    setName('');
    setRole('');
    setCategory('Executive');
    setPhoto('');
    setBio('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (leader: Leader) => {
    setEditingLeader(leader);
    setName(leader.name || '');
    setRole(leader.role || '');
    setCategory(leader.category || 'Executive');
    setPhoto(leader.photo || leader.photoUrl || '');
    setBio(leader.bio || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLeader(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Leadership Team</h2>
          <p className="text-sm text-gray-500">
            Manage organization executives, board members, and committee directors
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-sm text-sm"
        >
          <Plus className="w-4 h-4 text-accent" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Main List Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-sm">Team Directory</h3>
          {memberList.length > 0 && (
            <p className="text-xs text-gray-500 flex items-center">
              <GripVertical className="w-3.5 h-3.5 mr-1" /> Reorder items by dragging
            </p>
          )}
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-sm">Loading leadership team...</p>
            </div>
          ) : isError ? (
            <div className="py-12 text-center text-red-500 text-sm">
              Failed to load leadership team.
            </div>
          ) : memberList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">No team members added yet</h4>
              <p className="text-xs text-gray-400 mt-1 mb-4 max-w-sm mx-auto">
                Add executives, board members, and trustees to showcase your organization's leadership.
              </p>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90"
              >
                Add First Member
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {memberList.map((leader) => {
                const avatar = leader.photo || leader.photoUrl;
                return (
                  <div
                    key={leader.id}
                    className="flex items-center p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors group"
                  >
                    <GripVertical className="w-5 h-5 text-gray-300 mr-3 cursor-move group-hover:text-gray-500 flex-shrink-0" />

                    {avatar ? (
                      <img
                        src={avatar}
                        alt={leader.name}
                        className="w-11 h-11 rounded-full object-cover mr-4 border border-gray-100 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://ui-avatars.com/api/?name=' + encodeURIComponent(leader.name);
                        }}
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mr-4 text-sm flex-shrink-0">
                        {leader.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{leader.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{leader.role}</p>
                    </div>

                    <div className="mx-3">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold whitespace-nowrap">
                        {leader.category}
                      </span>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleOpenEdit(leader)}
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit member"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${leader.name}?`)) {
                            deleteMutation.mutate(leader.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">
                {editingLeader ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Director, Chairman"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="Board">Board of Trustees</option>
                  <option value="Executive">Executive Leadership</option>
                  <option value="Advisory">Advisory Council</option>
                  <option value="Management">Management Team</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">Photo URL</label>
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <FolderOpen className="w-3 h-3" />
                    Choose from Gallery
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://… or select from gallery"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setIsGalleryOpen(true)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Gallery
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bio (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of background and contributions..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-y"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 flex items-center space-x-1.5 disabled:opacity-60"
                >
                  {saveMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                  <span>{editingLeader ? 'Update Member' : 'Save Member'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Picker Modal for Profile Photos */}
      <GalleryPickerModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title="Select Leader Profile Photo"
        initialSelectedUrl={photo}
        onSelectImage={(url) => {
          setPhoto(url);
          setIsGalleryOpen(false);
        }}
      />
    </div>
  );
}