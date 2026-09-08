import React from 'react';
import YouTube from 'react-youtube';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Shuffle, Repeat, Heart, ListMusic
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function PlayerBar({
  isLiked,
  onLike,
  onOpenQueue
}) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    formattedCurrentTime,
    formattedDuration,
    progressPercent,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    togglePlay,
    nextSong,
    prevSong,
    startScrub,
    updateScrub,
    endScrub,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    onYouTubeReady,
    onYouTubeStateChange,
    onYouTubeError,
  } = usePlayer();

  if (!currentSong) return null;

  // Scrubber events
  const handleRangePointerDown = (e) => {
    const val = parseFloat(e.target.value);
    startScrub(val);
  };

  const handleRangeChange = (e) => {
    const val = parseFloat(e.target.value);
    updateScrub(val);
  };

  const handleRangePointerUp = (e) => {
    const val = parseFloat(e.target.value);
    endScrub(val);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseInt(e.target.value, 10));
  };

  return (
    <div className="water-player fixed bottom-0 left-0 right-0 z-50 select-none">
      {/* Offscreen Active YouTube Player (Hidden from view, active audio engine) */}
      {currentSong?.youtubeVideoId && !currentSong?.audioUrl && (
        <div
          style={{
            position: 'fixed',
            top: -9999,
            left: -9999,
            width: '200px',
            height: '200px',
            opacity: 0.001,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <YouTube
            key={currentSong.youtubeVideoId}
            videoId={currentSong.youtubeVideoId}
            opts={{
              height: '200',
              width: '200',
              playerVars: {
                autoplay: 1,
                controls: 0,
                rel: 0,
                origin: window.location.origin,
                enablejsapi: 1,
              },
            }}
            onReady={onYouTubeReady}
            onStateChange={onYouTubeStateChange}
            onError={onYouTubeError}
          />
        </div>
      )}

      <div className="flex items-center justify-between px-8 py-3 max-w-screen-2xl mx-auto h-[78px]">
        {/* Left: Current Track Details */}
        <div className="flex items-center gap-3.5 w-72 shrink-0 min-w-0">
          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
            <img
              src={currentSong.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=100&q=80'}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-100 truncate">
              {currentSong.title}
            </p>
            <p className="text-[11px] text-stone-500 truncate mt-0.5">
              {currentSong.artist}
            </p>
          </div>
          <button
            onClick={() => onLike && onLike(currentSong)}
            className={`p-1.5 transition-colors ${isLiked ? 'text-rose-500' : 'text-stone-500 hover:text-stone-300'}`}
            title="Like track"
          >
            <Heart className="w-4 h-4" style={{ fill: isLiked ? 'currentColor' : 'none' }} />
          </button>
        </div>

        {/* Center: Controls + Progress Bar */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1.5 max-w-xl px-4">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? 'text-[#f5a77f]' : 'text-stone-500 hover:text-stone-300'}`}
              title={isShuffle ? 'Shuffle enabled' : 'Shuffle disabled'}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={prevSong}
              className="text-stone-300 hover:text-white transition-colors"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-[#f5a77f] text-[#170f0a] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={nextSong}
              className="text-stone-300 hover:text-white transition-colors"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`transition-colors ${isRepeat ? 'text-[#f5a77f]' : 'text-stone-500 hover:text-stone-300'}`}
              title={isRepeat ? 'Repeat enabled' : 'Repeat disabled'}
            >
              <Repeat className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Time Scrubber */}
          <div className="w-full flex items-center gap-3">
            <span className="text-[10px] font-mono text-stone-500 w-8 text-right font-medium tabular-nums">
              {formattedCurrentTime}
            </span>
            <div className="relative flex-1 h-3 flex items-center group">
              {/* Background Track */}
              <div className="absolute inset-y-0 my-auto w-full h-[3px] bg-white/[0.08] rounded-full group-hover:h-[4px] transition-all" />
              {/* Filled Track */}
              <div
                className="absolute inset-y-0 left-0 my-auto h-[3px] group-hover:h-[4px] bg-gradient-to-r from-[#f5a77f] to-[#e68d5f] rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Scrubber Thumb Indicator on hover/drag */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#f5a77f] shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />
              {/* Interactive Range Input */}
              <input
                type="range"
                min="0"
                max={duration > 0 ? duration : 100}
                step="0.1"
                value={currentTime}
                onPointerDown={handleRangePointerDown}
                onMouseDown={handleRangePointerDown}
                onTouchStart={handleRangePointerDown}
                onChange={handleRangeChange}
                onPointerUp={handleRangePointerUp}
                onMouseUp={handleRangePointerUp}
                onTouchEnd={handleRangePointerUp}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title={`Seek: ${formattedCurrentTime} / ${formattedDuration}`}
              />
            </div>
            <span className="text-[10px] font-mono text-stone-500 w-8 font-medium tabular-nums">
              {formattedDuration}
            </span>
          </div>
        </div>

        {/* Right: Volume & Queue */}
        <div className="flex items-center gap-3.5 w-60 justify-end shrink-0">
          <button
            onClick={toggleMute}
            className="text-stone-400 hover:text-stone-200 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <div className="relative w-20 h-3 flex items-center group">
            <div className="absolute inset-y-0 my-auto w-full h-[3px] bg-white/[0.08] rounded-full group-hover:h-[4px] transition-all" />
            <div
              className="absolute inset-y-0 left-0 my-auto h-[3px] group-hover:h-[4px] bg-gradient-to-r from-[#f5a77f] to-[#e68d5f] rounded-full transition-all"
              style={{ width: `${isMuted ? 0 : volume}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              title={`Volume: ${isMuted ? 0 : volume}%`}
            />
          </div>
          <button
            onClick={onOpenQueue}
            className="text-stone-500 hover:text-stone-300 transition-colors p-1"
            title="Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
