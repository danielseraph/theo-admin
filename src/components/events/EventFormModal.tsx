import { useState, useEffect } from 'react';
import { 
  X, Loader2, Sparkles, MapPin, 
  Clock, Users, DollarSign 
} from 'lucide-react';
import { 
  type EventItem, 
  type EventFormData, 
  type EventType, 
  type EventStatus,
  EVENT_TYPES, 
  EVENT_STATUSES 
} from '../../services/eventsService';
import MediaUploader from '../MediaUploader';
import GalleryPickerModal from '../GalleryPickerModal';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: EventFormData) => Promise<void>;
  eventToEdit?: EventItem | null;
  isSubmitting: boolean;
}

export default function EventFormModal({
  isOpen,
  onClose,
  onSubmit,
  eventToEdit,
  isSubmitting,
}: EventFormModalProps) {
  const isEditing = !!eventToEdit;

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('TRAINING');
  const [status, setStatus] = useState<EventStatus>('UPCOMING');
  const [eventDate, setEventDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [seats, setSeats] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [fee, setFee] = useState('Free');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // Gallery Picker modal state
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Pre-fill fields when editing
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || '');
      setDescription(eventToEdit.description || '');
      setType(eventToEdit.type || 'TRAINING');
      
      // Map status
      const editStatus = eventToEdit.status === 'COMPLETED' ? 'COMPLETED' : eventToEdit.status || 'UPCOMING';
      setStatus(editStatus);

      // Format date to YYYY-MM-DD
      if (eventToEdit.eventDate) {
        const rawDate = eventToEdit.eventDate.includes('T') 
          ? eventToEdit.eventDate.split('T')[0] 
          : eventToEdit.eventDate;
        setEventDate(rawDate);
      } else {
        setEventDate('');
      }

      setTime(eventToEdit.time || '');
      setLocation(eventToEdit.location || '');
      setSeats(eventToEdit.seats || '');
      setIsFree(eventToEdit.isFree ?? true);
      setFee(eventToEdit.isFree ? 'Free' : (eventToEdit.fee || ''));
      setCoverImageUrl(eventToEdit.coverImageUrl || '');
    } else {
      // Default blank values for new event
      setTitle('');
      setDescription('');
      setType('TRAINING');
      setStatus('UPCOMING');
      setEventDate(new Date().toISOString().split('T')[0]);
      setTime('9:00 AM – 5:00 PM WAT');
      setLocation('');
      setSeats('50 seats available');
      setIsFree(true);
      setFee('Free');
      setCoverImageUrl('');
    }
    setValidationError('');
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Event title is required.');
      return;
    }

    if (!eventDate) {
      setValidationError('Event date is required.');
      return;
    }

    if (!isFree && (!fee.trim() || fee.trim().toLowerCase() === 'free')) {
      setValidationError('Please specify the fee amount (e.g. ₦5,000) for paid events.');
      return;
    }

    const payload: EventFormData = {
      title: title.trim(),
      description: description.trim(),
      type,
      status: status === 'COMPLETED' ? 'COMPLETED' : status,
      eventDate,
      time: time.trim() || '9:00 AM – 5:00 PM WAT',
      location: location.trim() || 'Venue to be announced',
      seats: seats.trim() || 'Open seating',
      isFree,
      fee: isFree ? 'Free' : fee.trim(),
      coverImageUrl: coverImageUrl || undefined,
    };

    await onSubmit(payload);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
          
          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 bg-white flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {isEditing ? 'Edit Event or Program' : 'Create New Event or Program'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Fill in the event details, venue schedule, ticketing, and banner.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {validationError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                {validationError}
              </div>
            )}

            {/* Banner Image Upload Dropzone */}
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl">
              <MediaUploader
                label="Event Banner / Cover Image"
                value={coverImageUrl}
                onChange={(url) => setCoverImageUrl(url)}
                onChooseFromGallery={() => setIsGalleryOpen(true)}
                helperText="Upload banner image directly to Cloudinary or select from Gallery"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Digital Skills Bootcamp 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>

            {/* Type & Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Type / Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-medium"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.value})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EventStatus)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-medium"
                >
                  {EVENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({s.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Time Schedule <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9:00 AM – 5:00 PM WAT"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Location & Seats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Location / Venue <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 53 Erepa Road, Yenagoa, Bayelsa State"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Capacity / Seats Available
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. 50 seats available"
                    value={seats}
                    onChange={(e) => setSeats(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Pricing: isFree Toggle & Fee */}
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800">
                    Free Event Registration
                  </label>
                  <p className="text-[11px] text-gray-500">
                    Toggle off if this is a paid event requiring an admission fee
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsFree(checked);
                      if (checked) {
                        setFee('Free');
                      } else {
                        setFee('');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Reveal Fee Input when isFree is false */}
              {!isFree && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Admission Fee Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={!isFree}
                      placeholder="e.g. ₦5,000 or $25"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Event Description & Agenda <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe the objectives, speakers, prerequisites, and itinerary..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-y leading-relaxed"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 text-slate-700 hover:bg-gray-50 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-accent" />
                )}
                <span>{isEditing ? 'Save Changes' : 'Create Event'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* Gallery Picker Modal */}
      <GalleryPickerModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        title="Select Event Banner from Gallery"
        initialSelectedUrl={coverImageUrl}
        onSelectImage={(url) => {
          setCoverImageUrl(url);
          setIsGalleryOpen(false);
        }}
      />
    </>
  );
}
