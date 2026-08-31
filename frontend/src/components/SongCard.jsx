import React, { useRef, useState } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function SongCard({
  song,
  isActive: propIsActive,
  isPlaying: propIsPlaying,
  onPlay,
  isLiked,
  onLike,
  variant = 'standard', // 'standard' | 'wide' | 'square'
  subtitle
}) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [hovered, setHovered] = useState(false);

  const { isCurrentSong, isPlaying: contextIsPlaying, playSong, togglePlay } = usePlayer();

  // Determine if active & playing from context or fallback props
  const active = propIsActive !== undefined ? propIsActive : isCurrentSong(song);
  const playing = active && (propIsPlaying !== undefined ? propIsPlaying : contextIsPlaying);

  const handleCardPlay = (e) => {
    if (e) e.stopPropagation();
    if (onPlay) {
      onPlay(song);
    } else {
      if (active) {
        togglePlay();
      } else {
        playSong(song);
      }
    }
  };

  const onMouseMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -cy * 8, ry: cx * 8 });
  };

  // 1. "Made for you" Wide Atmospheric Card
  if (variant === 'wide') {
    return (
      <div
        onClick={handleCardPlay}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="water-card group relative h-36 rounded-2xl cursor-pointer overflow-hidden flex flex-col justify-end p-4 shrink-0 transition-all select-none"
      >
        <img
          src={song?.thumbnailUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'}
          alt={song?.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <div className="relative z-10 pr-10">
          <p className="text-sm font-bold text-white group-hover:text-[#f5a77f] transition-colors truncate">
            {song?.title}
          </p>
          <p className="text-[11px] text-stone-400 truncate mt-0.5">
            {subtitle || song?.artist}
          </p>
        </div>

        {/* White circle play button on bottom right */}
        <button
          onClick={handleCardPlay}
          className="absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full bg-white/95 text-[#170f0a] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#f5a77f] active:scale-95 transition-all"
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>
    );
  }

  // 2. "Recently Played" Clean Square Card
  if (variant === 'square') {
    return (
      <div
        onClick={handleCardPlay}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group flex flex-col cursor-pointer select-none"
      >
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-900 mb-2.5 shadow-md">
          <img
            src={song?.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80'}
            alt={song?.title}
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

          {/* Equalizer when active and playing */}
          {playing && (
            <div className="absolute bottom-2.5 right-2.5 flex items-end gap-0.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#f5a77f]/40">
              <span className="soundwave-bar" style={{ animationDelay: '0ms' }} />
              <span className="soundwave-bar" style={{ animationDelay: '200ms' }} />
              <span className="soundwave-bar" style={{ animationDelay: '400ms' }} />
            </div>
          )}

          {/* Play button overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${hovered || playing ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleCardPlay}
              className="w-10 h-10 rounded-full bg-[#f5a77f] text-[#170f0a] flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>
        <p className={`text-xs font-semibold truncate ${active ? 'text-[#f5a77f]' : 'text-stone-200 group-hover:text-[#f5a77f]'}`}>
          {song?.title}
        </p>
        <p className="text-[11px] text-stone-500 truncate mt-0.5">
          {song?.artist}
        </p>
      </div>
    );
  }

  // 3. Standard Card with 3D Tilt & Specular Highlights
  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ rx: 0, ry: 0 }); }}
      onClick={handleCardPlay}
      style={{ perspective: '1000px', cursor: 'pointer' }}
      className="select-none"
    >
      <div
        className={`water-card flex flex-col p-3 rounded-2xl relative ${active ? 'border-[#f5a77f]/40 ring-1 ring-[#f5a77f]/30' : ''}`}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: hovered
            ? 'transform 0.1s ease, border-color 0.25s ease'
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease',
        }}
      >
        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-stone-900">
          <img
            src={song?.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80'}
            alt={song?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Equalizer when playing */}
          {playing && (
            <div className="absolute bottom-2 right-2 flex items-end gap-0.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-[#f5a77f]/40">
              <span className="soundwave-bar" style={{ animationDelay: '0ms' }} />
              <span className="soundwave-bar" style={{ animationDelay: '200ms' }} />
              <span className="soundwave-bar" style={{ animationDelay: '400ms' }} />
            </div>
          )}

          {/* Hover play */}
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${hovered || playing ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleCardPlay}
              className="w-10 h-10 rounded-full bg-[#f5a77f] text-[#170f0a] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start justify-between gap-1.5 min-w-0">
          <div className="min-w-0 flex-1">
            <p className={`text-xs font-bold truncate ${active ? 'text-[#f5a77f]' : 'text-stone-200'}`}>
              {song?.title}
            </p>
            <p className="text-[10px] text-stone-500 truncate mt-0.5">
              {song?.artist}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onLike && onLike(song); }}
            className={`p-1 transition-colors ${isLiked ? 'text-rose-500' : 'text-stone-600 hover:text-stone-400'}`}
            title="Like track"
          >
            <Heart className="w-3.5 h-3.5" style={{ fill: isLiked ? 'currentColor' : 'none' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
