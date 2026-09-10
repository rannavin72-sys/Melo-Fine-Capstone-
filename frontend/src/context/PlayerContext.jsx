import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { formatTime, parseDurationToSeconds } from '../utils/formatTime';

export { formatTime, parseDurationToSeconds };

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  // Playback state
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  // Scrubber dragging state
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  // Queue state
  const [queue, setQueue] = useState([]);

  // HTML5 Audio element ref
  const audioRef = useRef(null);
  // YouTube player instance ref
  const ytPlayerRef = useRef(null);
  // YouTube timer ref for onTimeUpdate
  const ytTimerRef = useRef(null);
  // Ended callback ref to avoid circular dependencies
  const onEndedCallbackRef = useRef(null);

  // Helper to determine if track uses direct HTML5 Audio or YouTube
  const isDirectAudio = useCallback((song) => {
    return Boolean(song && (song.audioUrl || song.streamUrl || song.url));
  }, []);

  // Initialize HTML5 Audio instance
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsBuffering(true);
    };

    const handlePlaying = () => {
      setIsBuffering(false);
    };

    const handleEnded = () => {
      if (onEndedCallbackRef.current) {
        onEndedCallbackRef.current();
      }
    };

    const handleError = (e) => {
      console.warn("HTML5 audio playback error:", e);
      setIsBuffering(false);
      if (onEndedCallbackRef.current) {
        onEndedCallbackRef.current();
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isScrubbing]);

  // Sync volume with HTML5 Audio and YouTube
  useEffect(() => {
    const effectiveVolume = isMuted ? 0 : volume / 100;
    if (audioRef.current) {
      audioRef.current.volume = effectiveVolume;
      audioRef.current.muted = isMuted;
    }
    if (ytPlayerRef.current) {
      try {
        if (isMuted) {
          ytPlayerRef.current.mute();
        } else {
          ytPlayerRef.current.unMute();
          ytPlayerRef.current.setVolume(volume);
        }
      } catch (_) {}
    }
  }, [volume, isMuted]);

  // Clean play action
  const play = useCallback(() => {
    if (!currentSong) return;
    setIsPlaying(true);

    if (isDirectAudio(currentSong) && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn("Audio play prevented:", err);
      });
    } else if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.playVideo();
      } catch (_) {}
    }
  }, [currentSong, isDirectAudio]);

  // Clean pause action
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (_) {}
    }
  }, []);

  // Clean togglePlay action
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  // Play a specific song and update queue
  const playSong = useCallback((song, newQueue = null) => {
    if (!song) return;

    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue);
    }

    const sameSong = currentSong && (
      (song.youtubeVideoId && currentSong.youtubeVideoId === song.youtubeVideoId) ||
      (song.id && currentSong.id === song.id)
    );

    if (sameSong) {
      togglePlay();
      return;
    }

    // Changing song: reset dynamic progress
    setCurrentSong(song);
    setCurrentTime(0);
    setScrubTime(0);
    setIsScrubbing(false);
    setIsBuffering(false);

    // Initial placeholder duration if present on song object
    if (song.duration) {
      const parsedDur = parseDurationToSeconds(song.duration);
      if (parsedDur > 0) setDuration(parsedDur);
    } else {
      setDuration(0);
    }

    setIsPlaying(true);

    // If direct HTML5 audio track
    if (isDirectAudio(song) && audioRef.current) {
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.stopVideo(); } catch (_) {}
      }
      audioRef.current.src = song.audioUrl || song.streamUrl || song.url;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn("Direct play error:", e));
    }
  }, [currentSong, togglePlay, isDirectAudio]);

  // Seek position seamlessly
  const seek = useCallback((timeInSeconds) => {
    const clamped = Math.max(0, Math.min(timeInSeconds, duration || 3600));
    setCurrentTime(clamped);

    if (isDirectAudio(currentSong) && audioRef.current) {
      audioRef.current.currentTime = clamped;
    } else if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(clamped, true);
      } catch (_) {}
    }
  }, [currentSong, duration, isDirectAudio]);

  // Track advancement: Next Song
  const nextSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return;

    if (isShuffle && queue.length > 1) {
      let randIdx;
      do {
        randIdx = Math.floor(Math.random() * queue.length);
      } while (
        queue[randIdx]?.youtubeVideoId === currentSong.youtubeVideoId &&
        queue.length > 1
      );
      playSong(queue[randIdx]);
      return;
    }

    const currentIdx = queue.findIndex(s =>
      (s.youtubeVideoId && s.youtubeVideoId === currentSong.youtubeVideoId) ||
      (s.id && s.id === currentSong.id)
    );

    const nextIdx = (currentIdx + 1) % queue.length;
    playSong(queue[nextIdx]);
  }, [currentSong, queue, isShuffle, playSong]);

  // Track advancement: Previous Song
  const prevSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (currentTime > 3) {
      seek(0);
      return;
    }

    const currentIdx = queue.findIndex(s =>
      (s.youtubeVideoId && s.youtubeVideoId === currentSong.youtubeVideoId) ||
      (s.id && s.id === currentSong.id)
    );

    const prevIdx = (currentIdx - 1 + queue.length) % queue.length;
    playSong(queue[prevIdx]);
  }, [currentSong, queue, currentTime, seek, playSong]);

  // Bind onEnded callback ref
  useEffect(() => {
    onEndedCallbackRef.current = () => {
      if (isRepeat) {
        seek(0);
        play();
      } else {
        nextSong();
      }
    };
  }, [isRepeat, seek, play, nextSong]);

  // Scrubber lifecycle hooks
  const startScrub = useCallback((initialTime) => {
    setIsScrubbing(true);
    setScrubTime(initialTime);
  }, []);

  const updateScrub = useCallback((time) => {
    setScrubTime(time);
  }, []);

  const endScrub = useCallback((finalTime) => {
    setIsScrubbing(false);
    seek(finalTime);
  }, [seek]);

  // Volume & controls
  const setVolume = useCallback((val) => {
    const clamped = Math.max(0, Math.min(100, val));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => !prev);
  }, []);

  // Helper to test if a song is currently the active track
  const isCurrentSong = useCallback((song) => {
    if (!song || !currentSong) return false;
    if (song.youtubeVideoId && currentSong.youtubeVideoId) {
      return song.youtubeVideoId === currentSong.youtubeVideoId;
    }
    if (song.id && currentSong.id) {
      return song.id === currentSong.id;
    }
    return false;
  }, [currentSong]);

  // YouTube Engine Event Listener Hooks
  const bindYouTubePlayer = useCallback((player) => {
    ytPlayerRef.current = player;
    try {
      player.setVolume(isMuted ? 0 : volume);
      const dur = player.getDuration();
      if (dur && dur > 0) {
        setDuration(dur);
      }
    } catch (_) {}

    if (isPlaying) {
      try {
        player.playVideo();
      } catch (_) {}
    }
  }, [volume, isMuted, isPlaying]);

  const onYouTubeStateChange = useCallback((event) => {
    // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    const state = event.data;
    if (state === 1) { // Playing
      setIsPlaying(true);
      setIsBuffering(false);
      try {
        const dur = event.target.getDuration();
        if (dur && dur > 0) setDuration(dur);
      } catch (_) {}
    } else if (state === 2) { // Paused
      setIsPlaying(false);
    } else if (state === 3) { // Buffering
      setIsBuffering(true);
    } else if (state === 0) { // Ended
      setIsBuffering(false);
      if (onEndedCallbackRef.current) {
        onEndedCallbackRef.current();
      }
    }
  }, []);

  const onYouTubeReady = useCallback((event) => {
    bindYouTubePlayer(event.target);
  }, [bindYouTubePlayer]);

  const onYouTubeError = useCallback((event) => {
    console.warn("YouTube playback error code:", event.data, "Advancing...");
    setIsBuffering(false);
    nextSong();
  }, [nextSong]);

  // YouTube polling interval to dispatch clean onTimeUpdate
  useEffect(() => {
    clearInterval(ytTimerRef.current);

    if (isPlaying && ytPlayerRef.current && !isDirectAudio(currentSong)) {
      ytTimerRef.current = setInterval(() => {
        if (!isScrubbing && ytPlayerRef.current) {
          try {
            const ct = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            setCurrentTime(ct);
            if (dur > 0) {
              setDuration(dur);
            }
          } catch (_) {}
        }
      }, 250);
    }

    return () => clearInterval(ytTimerRef.current);
  }, [isPlaying, isScrubbing, currentSong, isDirectAudio]);

  // Synchronize playing state with YouTube player
  useEffect(() => {
    if (!ytPlayerRef.current || isDirectAudio(currentSong)) return;
    try {
      if (isPlaying) {
        ytPlayerRef.current.playVideo();
      } else {
        ytPlayerRef.current.pauseVideo();
      }
    } catch (_) {}
  }, [isPlaying, currentSong, isDirectAudio]);

  // Derived dynamic time values
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;
  const formattedCurrentTime = formatTime(displayTime);
  const formattedDuration = formatTime(duration);

  const value = {
    // State
    currentSong,
    isPlaying,
    isBuffering,
    currentTime: displayTime,
    rawCurrentTime: currentTime,
    duration,
    formattedCurrentTime,
    formattedDuration,
    progressPercent,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    queue,
    isScrubbing,
    scrubTime,

    // Methods
    setCurrentSong,
    playSong,
    togglePlay,
    play,
    pause,
    seek,
    startScrub,
    updateScrub,
    endScrub,
    nextSong,
    prevSong,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    setQueue,
    isCurrentSong,
    formatTime,

    // YouTube Event Hook Adapter
    onYouTubeReady,
    onYouTubeStateChange,
    onYouTubeError,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}


