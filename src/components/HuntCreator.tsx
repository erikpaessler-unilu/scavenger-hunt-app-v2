import { useState } from 'react';
import { motion } from 'motion/react';
import { Save, X, Plus, Trash2, MapPin, Image, Video, Music, FileText } from 'lucide-react';
import type { Hunt, Location, MediaContent, Answer } from '../App';

interface HuntCreatorProps {
  hunt?: Hunt | null;
  userId: string;
  onSave: (hunt: Hunt) => void;
  onCancel: () => void;
}

export function HuntCreator({ hunt, userId, onSave, onCancel }: HuntCreatorProps) {
  const [title, setTitle] = useState(hunt?.title || '');
  const [description, setDescription] = useState(hunt?.description || '');
  const [thumbnail, setThumbnail] = useState(hunt?.thumbnail || '');
  const [locations, setLocations] = useState<Location[]>(
    hunt?.locations || [createEmptyLocation()]
  );
  const [expandedLocationId, setExpandedLocationId] = useState<string | null>(
    locations[0]?.id || null
  );

  function createEmptyLocation(): Location {
    return {
      id: `loc-${Date.now()}-${Math.random()}`,
      name: '',
      lat: 40.7589,
      lng: -73.9851,
      clue: '',
      media: [],
      answer: {
        type: 'text',
        correctAnswer: ''
      },
      unlocked: false
    };
  }

  const handleAddLocation = () => {
    const newLocation = createEmptyLocation();
    setLocations([...locations, newLocation]);
    setExpandedLocationId(newLocation.id);
  };

  const handleRemoveLocation = (locationId: string) => {
    if (locations.length <= 1) {
      alert('You need at least one location!');
      return;
    }
    setLocations(locations.filter(loc => loc.id !== locationId));
    if (expandedLocationId === locationId) {
      setExpandedLocationId(locations[0]?.id || null);
    }
  };

  const handleUpdateLocation = (locationId: string, updates: Partial<Location>) => {
    setLocations(locations.map(loc =>
      loc.id === locationId ? { ...loc, ...updates } : loc
    ));
  };

  const handleAddMedia = (locationId: string, type: MediaContent['type']) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    let newMedia: MediaContent;
    if (type === 'text') {
      newMedia = { type: 'text', content: '' };
    } else {
      newMedia = { type, url: '' };
    }

    handleUpdateLocation(locationId, {
      media: [...location.media, newMedia]
    });
  };

  const handleUpdateMedia = (locationId: string, mediaIndex: number, updates: Partial<MediaContent>) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    const updatedMedia = location.media.map((media, idx) =>
      idx === mediaIndex ? { ...media, ...updates } : media
    );
    handleUpdateLocation(locationId, { media: updatedMedia });
  };

  const handleRemoveMedia = (locationId: string, mediaIndex: number) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;

    handleUpdateLocation(locationId, {
      media: location.media.filter((_, idx) => idx !== mediaIndex)
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a quest title');
      return;
    }

    if (locations.some(loc => !loc.name.trim() || !loc.clue.trim() || !loc.answer.correctAnswer.trim())) {
      alert('Please fill in all location details (name, clue, and answer)');
      return;
    }

    const savedHunt: Hunt = {
      id: hunt?.id || `hunt-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      creatorId: userId,
      thumbnail: thumbnail.trim() || undefined,
      locations: locations.map((loc, index) => ({
        ...loc,
        unlocked: index === 0 // First location starts unlocked
      }))
    };

    onSave(savedHunt);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-300 mb-6"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-orange-600">
              {hunt ? 'Edit Quest' : 'Create New Quest'}
            </h1>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl flex items-center gap-2 hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                <Save className="w-5 h-5" />
                Save
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onCancel}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-300 mb-6"
        >
          <h2 className="text-orange-600 mb-4">Quest Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Quest Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Campus History Quest"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this quest is about..."
                rows={3}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Thumbnail URL (optional)</label>
              <input
                type="text"
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </motion.div>

        {/* Locations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-300 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-orange-600">Locations ({locations.length})</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddLocation}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl flex items-center gap-2 hover:bg-orange-600 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Location
            </motion.button>
          </div>

          <div className="space-y-4">
            {locations.map((location, index) => (
              <LocationEditor
                key={location.id}
                location={location}
                index={index}
                isExpanded={expandedLocationId === location.id}
                onToggleExpand={() =>
                  setExpandedLocationId(
                    expandedLocationId === location.id ? null : location.id
                  )
                }
                onUpdate={handleUpdateLocation}
                onRemove={handleRemoveLocation}
                onAddMedia={handleAddMedia}
                onUpdateMedia={handleUpdateMedia}
                onRemoveMedia={handleRemoveMedia}
                canRemove={locations.length > 1}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

interface LocationEditorProps {
  location: Location;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (locationId: string, updates: Partial<Location>) => void;
  onRemove: (locationId: string) => void;
  onAddMedia: (locationId: string, type: MediaContent['type']) => void;
  onUpdateMedia: (locationId: string, mediaIndex: number, updates: Partial<MediaContent>) => void;
  onRemoveMedia: (locationId: string, mediaIndex: number) => void;
  canRemove: boolean;
}

function LocationEditor({
  location,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onRemove,
  onAddMedia,
  onUpdateMedia,
  onRemoveMedia,
  canRemove
}: LocationEditorProps) {
  return (
    <div className="border-2 border-orange-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="w-full p-4 bg-orange-50 flex items-center justify-between">
        <button
          onClick={onToggleExpand}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 text-left"
        >
          <div className="p-2 bg-orange-500 rounded-lg">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-orange-600">
              Location {index + 1}: {location.name || 'Unnamed'}
            </h3>
            {!isExpanded && location.clue && (
              <p className="text-sm text-gray-600 line-clamp-1">{location.clue}</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canRemove && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(location.id);
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </motion.button>
          )}
          <button
            onClick={onToggleExpand}
            className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.div>
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Location Name *</label>
              <input
                type="text"
                value={location.name}
                onChange={(e) => onUpdate(location.id, { name: e.target.value })}
                placeholder="e.g., Main Library"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-gray-700 mb-2">Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={location.lat}
                  onChange={(e) => onUpdate(location.id, { lat: parseFloat(e.target.value) })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  value={location.lng}
                  onChange={(e) => onUpdate(location.id, { lng: parseFloat(e.target.value) })}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Clue *</label>
            <textarea
              value={location.clue}
              onChange={(e) => onUpdate(location.id, { clue: e.target.value })}
              placeholder="Write a riddle or puzzle for this location..."
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Media */}
          <div>
            <label className="block text-gray-700 mb-2">Media Clues</label>
            <div className="space-y-3 mb-3">
              {location.media.map((media, mediaIndex) => (
                <div
                  key={mediaIndex}
                  className="p-4 border-2 border-gray-200 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {media.type === 'image' && <Image className="w-4 h-4 text-orange-600" />}
                      {media.type === 'video' && <Video className="w-4 h-4 text-orange-600" />}
                      {media.type === 'audio' && <Music className="w-4 h-4 text-orange-600" />}
                      {media.type === 'text' && <FileText className="w-4 h-4 text-orange-600" />}
                      <span className="text-sm text-gray-600 capitalize">{media.type}</span>
                    </div>
                    <button
                      onClick={() => onRemoveMedia(location.id, mediaIndex)}
                      className="p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  {media.type === 'text' ? (
                    <textarea
                      value={media.content || ''}
                      onChange={(e) =>
                        onUpdateMedia(location.id, mediaIndex, { content: e.target.value })
                      }
                      placeholder="Enter text clue..."
                      rows={2}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={media.url || ''}
                      onChange={(e) =>
                        onUpdateMedia(location.id, mediaIndex, { url: e.target.value })
                      }
                      placeholder={`Enter ${media.type} URL...`}
                      className="w-full p-2 border border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onAddMedia(location.id, 'image')}
                className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors text-sm"
              >
                <Image className="w-4 h-4" />
                Image
              </button>
              <button
                onClick={() => onAddMedia(location.id, 'video')}
                className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg flex items-center gap-2 hover:bg-purple-100 transition-colors text-sm"
              >
                <Video className="w-4 h-4" />
                Video
              </button>
              <button
                onClick={() => onAddMedia(location.id, 'audio')}
                className="px-3 py-2 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-colors text-sm"
              >
                <Music className="w-4 h-4" />
                Audio
              </button>
              <button
                onClick={() => onAddMedia(location.id, 'text')}
                className="px-3 py-2 bg-orange-50 text-orange-600 rounded-lg flex items-center gap-2 hover:bg-orange-100 transition-colors text-sm"
              >
                <FileText className="w-4 h-4" />
                Text
              </button>
            </div>
          </div>

          {/* Answer */}
          <div>
            <label className="block text-gray-700 mb-2">Answer Type</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() =>
                  onUpdate(location.id, {
                    answer: { type: 'text', correctAnswer: location.answer.correctAnswer }
                  })
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.answer.type === 'text'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Text Input
              </button>
              <button
                onClick={() =>
                  onUpdate(location.id, {
                    answer: {
                      type: 'multiple-choice',
                      correctAnswer: location.answer.correctAnswer,
                      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4']
                    }
                  })
                }
                className={`px-4 py-2 rounded-lg transition-colors ${
                  location.answer.type === 'multiple-choice'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Multiple Choice
              </button>
            </div>

            {location.answer.type === 'multiple-choice' && (
              <div className="space-y-2 mb-3">
                {location.answer.options?.map((option, optionIndex) => (
                  <input
                    key={optionIndex}
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(location.answer.options || [])];
                      newOptions[optionIndex] = e.target.value;
                      onUpdate(location.id, {
                        answer: { ...location.answer, options: newOptions }
                      });
                    }}
                    placeholder={`Option ${optionIndex + 1}`}
                    className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-orange-400 focus:outline-none transition-colors"
                  />
                ))}
              </div>
            )}

            <div>
              <label className="block text-gray-700 mb-2">Correct Answer *</label>
              <input
                type="text"
                value={location.answer.correctAnswer}
                onChange={(e) =>
                  onUpdate(location.id, {
                    answer: { ...location.answer, correctAnswer: e.target.value }
                  })
                }
                placeholder={
                  location.answer.type === 'multiple-choice'
                    ? 'Enter the exact correct option'
                    : 'Enter the correct answer'
                }
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}