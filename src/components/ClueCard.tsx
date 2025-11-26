import { motion } from 'motion/react';
import { Image, Video, Music, FileText, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Location } from '../App';

interface ClueCardProps {
  location: Location;
}

export function ClueCard({ location }: ClueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-300"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-6 h-6" />
          <h3>{location.name}</h3>
        </div>
        <p className="text-orange-100">{location.clue}</p>
      </div>

      {/* Media Content */}
      <div className="p-6 space-y-4">
        {location.media.map((media, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-xl overflow-hidden border-2 border-orange-100"
          >
            {media.type === 'image' && media.url && (
              <div className="relative">
                <ImageWithFallback
                  src={media.url}
                  alt={`Clue for ${location.name}`}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg shadow-lg">
                  <Image className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            )}

            {media.type === 'video' && media.url && (
              <div className="relative bg-gray-900">
                <video
                  src={media.url}
                  controls
                  className="w-full h-64"
                  poster="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600"
                >
                  Your browser does not support video playback.
                </video>
                <div className="absolute top-4 right-4 p-2 bg-white/90 rounded-lg shadow-lg">
                  <Video className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            )}

            {media.type === 'audio' && media.url && (
              <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-500 rounded-xl">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-orange-600">Audio Clue</h4>
                    <p className="text-sm text-gray-600">Listen carefully for hints</p>
                  </div>
                </div>
                <audio
                  src={media.url}
                  controls
                  className="w-full"
                >
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {media.type === 'text' && media.content && (
              <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-orange-500 rounded-lg flex-shrink-0">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-700">{media.content}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {location.media.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-xl">
            <p className="text-gray-500">No additional media for this clue</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
