import React, { useState, useEffect, useRef } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Bell,
  Heart, Play, Pause, AlertCircle, X,
  Disc, Plus, Library, ListMusic,
  Trash2, ArrowLeft
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import SongCard from './components/SongCard';
import PlayerBar from './components/PlayerBar';
import AuthModal from './components/AuthModal';
import { api } from './services/api';
import { usePlayer } from './context/PlayerContext';

// Curated Made For You playlists with distinct authentic tracks
const MADE_FOR_YOU = [
  {
    title: 'Late Night Drive',
    desc: 'Chill songs for city nights',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
    query: 'Late night drive chill songs',
    youtubeVideoId: 'tt2k8PGm-TI',
    artist: 'ZAYN ft. Sia'
  },
  {
    title: 'Falling in Love',
    desc: 'Songs that hit different',
    img: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80',
    query: 'Romantic love songs acoustic',
    youtubeVideoId: '2Vv-BfVoq4g',
    artist: 'Ed Sheeran'
  },
  {
    title: 'Acoustic Mornings',
    desc: 'Soft, calm & beautiful',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80',
    query: 'Acoustic guitar morning songs',
    youtubeVideoId: 'PEM0Vs8jf1w',
    artist: 'JVKE'
  },
  {
    title: 'Midnight Memories',
    desc: 'Nostalgic tunes for the soul',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80',
    query: 'Nostalgic memories indie acoustic',
    youtubeVideoId: 'syFZfO_wfMQ',
    artist: 'One Direction'
  },
  {
    title: 'Good Vibes',
    desc: 'Feel good playlist',
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    query: 'Good vibes upbeat pop songs',
    youtubeVideoId: '4NRXx6U8ABQ',
    artist: 'The Weeknd'
  }
];


// Curated Albums catalog
const FEATURED_ALBUMS = [
  {
    id: 'leo',
    title: 'Leo (Original Motion Picture Soundtrack)',
    artist: 'Anirudh Ravichander',
    year: '2023',
    img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
    query: 'Leo Tamil movie songs Anirudh'
  },
  {
    id: 'divide',
    title: '÷ (Divide)',
    artist: 'Ed Sheeran',
    year: '2017',
    img: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80',
    query: 'Ed Sheeran divide songs'
  },
  {
    id: 'after-hours',
    title: 'After Hours',
    artist: 'The Weeknd',
    year: '2020',
    img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    query: 'The Weeknd After Hours songs'
  },
  {
    id: 'evolve',
    title: 'Evolve',
    artist: 'Imagine Dragons',
    year: '2017',
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    query: 'Imagine Dragons Evolve believer'
  },
  {
    id: 'folklore',
    title: 'Lover & Midnights',
    artist: 'Taylor Swift',
    year: '2022',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80',
    query: 'Taylor Swift cruel summer midnights'
  },
  {
    id: 'dusk',
    title: 'Icarus Falls',
    artist: 'ZAYN',
    year: '2018',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
    query: 'Zayn dusk till dawn songs'
  }
];

// Curated Artists catalog
const FEATURED_ARTISTS = [
  { name: 'Anirudh Ravichander', role: 'Composer & Singer', query: 'Anirudh Ravichander songs', img: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80' },
  { name: 'Ed Sheeran', role: 'Singer-Songwriter', query: 'Ed Sheeran songs', img: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&q=80' },
  { name: 'The Weeknd', role: 'R&B / Pop Artist', query: 'The Weeknd hits', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80' },
  { name: 'Taylor Swift', role: 'Global Pop Icon', query: 'Taylor Swift songs', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&q=80' },
  { name: 'Imagine Dragons', role: 'Alternative Rock', query: 'Imagine Dragons songs', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
  { name: 'Arijit Singh', role: 'Soulful Playback Singer', query: 'Arijit Singh songs', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'search' | 'library' | 'liked' | 'playlists' | 'albums' | 'artists'
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [likedSongs, setLikedSongs] = useState([]);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Unified Audio Player State Manager
  const {
    currentSong,
    setCurrentSong,
    isPlaying,
    duration,
    formattedCurrentTime,
    formattedDuration,
    playSong,
    togglePlay,
    isCurrentSong,
    setQueue,
  } = usePlayer();

  // Playlists State
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  const searchInputRef = useRef(null);

  // Restore user session, liked tracks, and custom playlists
  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('mf_user') || 'null');
      if (savedUser) setUser(savedUser);

      const savedLikes = JSON.parse(localStorage.getItem('mf_likes') || '[]');
      setLikedSongs(savedLikes);

      const savedPlaylists = JSON.parse(localStorage.getItem('mf_playlists') || '[]');
      if (savedPlaylists.length > 0) {
        setCustomPlaylists(savedPlaylists);
      } else {
        // Initialize with default custom playlists
        const defaults = [
          { id: 'p1', name: 'Late Night Drive', desc: 'Chill songs for night roads', songs: [] },
          { id: 'p2', name: 'Midnight Favorites', desc: 'Curated soulful melodies', songs: [] }
        ];
        setCustomPlaylists(defaults);
        localStorage.setItem('mf_playlists', JSON.stringify(defaults));
      }
    } catch (_) {}

    loadInitialMusic();
  }, []);

  const loadInitialMusic = async () => {
    setLoading(true);
    try {
      const data = await api.getTrendingSongs();
      if (Array.isArray(data) && data.length > 0) {
        setSongs(data);
        setQueue(data);
        if (!currentSong) {
          setCurrentSong(data[0]);
        }
      }
    } catch (e) {
      console.warn("Could not fetch trending:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (queryText) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!q) return;

    setLoading(true);
    setSearchError('');
    setActiveTab('discover');

    try {
      const data = await api.searchSongs(q);
      if (Array.isArray(data) && data.length > 0) {
        setSongs(data);
        setQueue(data);
      } else {
        setSearchError(`No songs found for "${q}". Try another song or artist.`);
      }
    } catch (err) {
      setSearchError('Search failed. Make sure Spring Boot backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Sync queue with active tab
  useEffect(() => {
    const activeQueue = activeTab === 'liked' ? likedSongs : songs;
    if (activeQueue.length > 0) {
      setQueue(activeQueue);
    }
  }, [activeTab, likedSongs, songs, setQueue]);

  const handlePlaySong = (song) => {
    if (!song) return;
    const activeQueue = activeTab === 'liked' ? likedSongs : songs;
    playSong(song, activeQueue);
  };


  const toggleLike = (song) => {
    if (!song) return;
    const exists = likedSongs.some(s => s.youtubeVideoId === song.youtubeVideoId);
    const updated = exists
      ? likedSongs.filter(s => s.youtubeVideoId !== song.youtubeVideoId)
      : [song, ...likedSongs];
    setLikedSongs(updated);
    localStorage.setItem('mf_likes', JSON.stringify(updated));
  };

  const isLiked = (song) => !!song && likedSongs.some(s => s.youtubeVideoId === song.youtubeVideoId);

  const handleLogout = () => {
    localStorage.removeItem('mf_user');
    setUser(null);
  };

  // Playlist creation
  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const newPl = {
      id: 'pl_' + Date.now(),
      name: newPlaylistName.trim(),
      desc: 'Custom playlist created by you',
      songs: []
    };
    const updated = [...customPlaylists, newPl];
    setCustomPlaylists(updated);
    localStorage.setItem('mf_playlists', JSON.stringify(updated));
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  const handleDeletePlaylist = (id) => {
    const updated = customPlaylists.filter(p => p.id !== id);
    setCustomPlaylists(updated);
    localStorage.setItem('mf_playlists', JSON.stringify(updated));
    if (selectedPlaylist?.id === id) setSelectedPlaylist(null);
  };

  // Add song to playlist
  const handleAddSongToPlaylist = (playlistId, song) => {
    const updated = customPlaylists.map(p => {
      if (p.id === playlistId) {
        const hasSong = p.songs.some(s => s.youtubeVideoId === song.youtubeVideoId);
        return hasSong ? p : { ...p, songs: [...p.songs, song] };
      }
      return p;
    });
    setCustomPlaylists(updated);
    localStorage.setItem('mf_playlists', JSON.stringify(updated));
  };

  const recentlyPlayed = songs.slice(0, 5);
  const popularTracks = songs.slice(0, 4);

  return (
    <div className="flex h-screen w-screen overflow-hidden relative bg-[#0b0908] text-[#e8ddd4] font-sans">
      {/* Ambient background glows */}
      <div className="glow-orb-peach glow-orb-1" />
      <div className="glow-orb-peach glow-orb-2" />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setTab={(tab) => {
          setActiveTab(tab);
          setSearchError('');
          setSelectedPlaylist(null);
          setSelectedAlbum(null);
          if (tab === 'search' && searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }}
        user={user}
        onOpenAuth={() => setAuthOpen(true)}
        onLogout={handleLogout}
        onPlaylistClick={(playlist) => {
          setSearchQuery(playlist.name);
          handleSearch(playlist.query);
        }}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar with Clean Search */}
        <header className="glass-topbar h-16 shrink-0 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('discover'); setSelectedPlaylist(null); setSelectedAlbum(null); }}
              className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-stone-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-stone-600 cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Clean, fast search input */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1 max-w-lg mx-6"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(searchQuery); } }}
              placeholder="Search songs, artists, soundtracks (Press Enter)..."
              className="water-input w-full pl-11 pr-20 py-2 rounded-full text-xs font-normal placeholder-stone-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); loadInitialMusic(); setSearchError(''); }}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full bg-[#f5a77f] text-[#170f0a] font-bold text-[10px] hover:scale-105 transition-all"
            >
              Go
            </button>
          </form>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-stone-400 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAuthOpen(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ab562c] to-[#f5a77f] p-0.5 flex items-center justify-center shadow-md hover:scale-105 transition-all"
              title={user ? user.username : 'Sign In'}
            >
              <div className="w-full h-full rounded-full bg-[#0b0908] flex items-center justify-center text-[11px] font-bold text-[#f5a77f]">
                {user ? user.username?.[0]?.toUpperCase() : '✦'}
              </div>
            </button>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 overflow-y-auto px-8 pt-6 pb-28 no-scrollbar">
          {/* ══════════════════════════════════════════════════════════════════════
              TAB 1: YOUR LIBRARY FEATURE & UI
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'library' && (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Library Hero Banner */}
              <div className="water-hero rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#f5a77f] uppercase tracking-widest font-bold mb-1">
                    <Library className="w-4 h-4" />
                    <span>Your Personal Sanctuary</span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-white">Your Music Library</h1>
                  <p className="text-xs text-stone-400 mt-1 max-w-lg">
                    Access your liked tracks, custom curated playlists, albums, and recent streaming history in one place.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-peach px-4 py-2.5 rounded-full text-xs flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Playlist</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('liked')}
                    className="btn-circle-glass px-4 py-2.5 rounded-full text-xs font-semibold text-stone-300 flex items-center gap-2"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                    <span>{likedSongs.length} Liked</span>
                  </button>
                </div>
              </div>

              {/* Quick Liked Songs Hub Card */}
              <div
                onClick={() => setActiveTab('liked')}
                className="water-card p-6 rounded-3xl cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <Heart className="w-8 h-8 text-white fill-current" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white group-hover:text-[#f5a77f] transition-colors">
                      Liked Songs Collection
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {likedSongs.length} tracks saved • Stream uninterrupted
                    </p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-[#f5a77f] text-[#170f0a] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>

              {/* Custom Playlists in Library */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">Your Custom Playlists ({customPlaylists.length})</h2>
                  <button
                    onClick={() => setActiveTab('playlists')}
                    className="text-xs text-[#f5a77f] font-semibold hover:underline"
                  >
                    Manage Playlists →
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {customPlaylists.map(pl => (
                    <div
                      key={pl.id}
                      onClick={() => { setSelectedPlaylist(pl); setActiveTab('playlists'); }}
                      className="water-card p-4 rounded-2xl cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#2b1f1a] to-[#120f0d] border border-white/10 flex items-center justify-center mb-3 shadow-inner">
                        <ListMusic className="w-10 h-10 text-[#f5a77f]" />
                      </div>
                      <p className="text-sm font-bold text-white group-hover:text-[#f5a77f] truncate">{pl.name}</p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{pl.songs.length} tracks</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Listening History */}
              <section>
                <h2 className="text-base font-bold text-white mb-4">Recent History</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                  {recentlyPlayed.map((song) => (
                    <SongCard
                      key={song.youtubeVideoId}
                      song={song}
                      isActive={currentSong?.youtubeVideoId === song.youtubeVideoId}
                      isPlaying={isPlaying}
                      onPlay={handlePlaySong}
                      variant="square"
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 2: PLAYLISTS FEATURE & UI
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'playlists' && (
            <div className="max-w-6xl mx-auto space-y-8">
              {/* If viewing a specific playlist */}
              {selectedPlaylist ? (
                <div>
                  <button
                    onClick={() => setSelectedPlaylist(null)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to all playlists</span>
                  </button>

                  <div className="water-hero rounded-3xl p-7 flex items-center gap-6 mb-8">
                    <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-[#f5a77f] to-[#ab562c] flex items-center justify-center shadow-2xl">
                      <ListMusic className="w-16 h-16 text-[#170f0a]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5a77f]">Playlist</span>
                      <h1 className="text-3xl font-extrabold text-white mt-1">{selectedPlaylist.name}</h1>
                      <p className="text-xs text-stone-400 mt-1">{selectedPlaylist.desc} • {selectedPlaylist.songs.length} songs</p>
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => selectedPlaylist.songs[0] && handlePlaySong(selectedPlaylist.songs[0])}
                          disabled={selectedPlaylist.songs.length === 0}
                          className="btn-peach px-6 py-2.5 rounded-full text-xs flex items-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                          <span>Play All</span>
                        </button>
                        <button
                          onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                          className="btn-circle-glass p-2.5 rounded-full text-stone-500 hover:text-rose-500 transition-colors"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {selectedPlaylist.songs.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl border border-white/[0.06] bg-white/[0.02]">
                      <ListMusic className="w-10 h-10 text-stone-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-stone-300">Playlist is empty</p>
                      <p className="text-xs text-stone-500 mt-1">Search any track and add it to this playlist.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPlaylist.songs.map((song, idx) => {
                        const active = isCurrentSong(song);
                        return (
                          <div
                            key={song.youtubeVideoId}
                            onClick={() => handlePlaySong(song)}
                            className="water-row flex items-center justify-between p-3 rounded-2xl cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-stone-500 w-5 text-center">
                                {active && isPlaying ? (
                                  <span className="flex items-end justify-center gap-0.5 h-3">
                                    <span className="soundwave-bar w-[2px] h-3" />
                                    <span className="soundwave-bar w-[2px] h-2" />
                                    <span className="soundwave-bar w-[2px] h-3.5" />
                                  </span>
                                ) : (
                                  `0${idx + 1}`
                                )}
                              </span>
                              <img src={song.thumbnailUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                              <div>
                                <p className={`text-xs font-semibold ${active ? 'text-[#f5a77f]' : 'text-white group-hover:text-[#f5a77f]'}`}>{song.title}</p>
                                <p className="text-[10px] text-stone-400">{song.artist}</p>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-stone-500 tabular-nums">
                              {active && duration > 0 ? formattedDuration : (song.duration || '3:30')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* All Playlists Overview */
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-white">Playlists & Curated Mixes</h1>
                      <p className="text-xs text-stone-400 mt-0.5">Explore curated mood sets or create your own custom playlists</p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="btn-peach px-4 py-2.5 rounded-full text-xs flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Playlist</span>
                    </button>
                  </div>

                  {/* Curated Vibe Playlists */}
                  <div className="mb-8">
                    <h2 className="text-sm font-bold text-stone-300 uppercase tracking-wider mb-4">Curated Vibes</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {MADE_FOR_YOU.map((item, idx) => (
                        <SongCard
                          key={idx}
                          song={{
                            youtubeVideoId: '2Vv-BfVoq4g',
                            title: item.title,
                            artist: 'Melo-Fine Studio',
                            thumbnailUrl: item.img
                          }}
                          subtitle={item.desc}
                          onPlay={() => handleSearch(item.query)}
                          variant="wide"
                        />
                      ))}
                    </div>
                  </div>

                  {/* User's Custom Playlists */}
                  <div>
                    <h2 className="text-sm font-bold text-stone-300 uppercase tracking-wider mb-4">Your Custom Sets</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {customPlaylists.map(pl => (
                        <div
                          key={pl.id}
                          onClick={() => setSelectedPlaylist(pl)}
                          className="water-card p-5 rounded-2xl cursor-pointer group flex flex-col justify-between"
                        >
                          <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-[#2b1f1a] to-[#140e0b] border border-white/10 flex items-center justify-center mb-3">
                            <ListMusic className="w-12 h-12 text-[#f5a77f] group-hover:scale-110 transition-transform" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[#f5a77f] truncate">{pl.name}</p>
                            <p className="text-xs text-stone-500 truncate mt-0.5">{pl.songs.length} songs</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 3: ALBUMS FEATURE & UI
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'albums' && (
            <div className="max-w-6xl mx-auto space-y-8">
              {selectedAlbum ? (
                <div>
                  <button
                    onClick={() => setSelectedAlbum(null)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white mb-4 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to all albums</span>
                  </button>

                  <div className="water-hero rounded-3xl p-7 flex items-center gap-6 mb-8">
                    <img
                      src={selectedAlbum.img}
                      alt={selectedAlbum.title}
                      className="w-40 h-40 rounded-2xl object-cover shadow-2xl border border-white/10"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#f5a77f]">Album</span>
                      <h1 className="text-3xl font-extrabold text-white mt-1">{selectedAlbum.title}</h1>
                      <p className="text-xs text-stone-400 mt-1">{selectedAlbum.artist} • {selectedAlbum.year}</p>
                      <button
                        onClick={() => handleSearch(selectedAlbum.query)}
                        className="btn-peach px-6 py-2.5 rounded-full text-xs flex items-center gap-2 mt-4"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Play Album Tracks</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Popular & Iconic Albums</h1>
                    <p className="text-xs text-stone-400 mt-0.5">Stream official album soundtracks, chart toppers, and master releases</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {FEATURED_ALBUMS.map(album => (
                      <div
                        key={album.id}
                        onClick={() => handleSearch(album.query)}
                        className="water-card p-3 rounded-2xl cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 shadow-md">
                          <img
                            src={album.img}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-[#f5a77f] text-[#170f0a] flex items-center justify-center shadow-lg">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-white group-hover:text-[#f5a77f] truncate">{album.title}</p>
                        <p className="text-[10px] text-stone-400 truncate mt-0.5">{album.artist} • {album.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 4: ARTISTS FEATURE & UI
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'artists' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Featured Artists & Creators</h1>
                <p className="text-xs text-stone-400 mt-0.5">Explore chart-topping composers, vocalists, and band discographies</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {FEATURED_ARTISTS.map((artist, i) => (
                  <div
                    key={i}
                    onClick={() => handleSearch(artist.query)}
                    className="flex flex-col items-center text-center cursor-pointer group"
                  >
                    <div className="relative w-32 h-32 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-[#f5a77f] shadow-xl transition-all">
                      <img
                        src={artist.img}
                        alt={artist.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-[#f5a77f] text-[#170f0a] flex items-center justify-center">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-[#f5a77f] truncate w-full">{artist.name}</p>
                    <p className="text-[10px] text-stone-400 truncate w-full mt-0.5">{artist.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 5: LIKED SONGS
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'liked' && (
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-stone-100">Liked Songs</h1>
                  <p className="text-xs text-stone-500 mt-0.5">{likedSongs.length} tracks saved</p>
                </div>
              </div>

              {likedSongs.length === 0 ? (
                <div className="p-12 text-center rounded-3xl border border-white/[0.06] bg-white/[0.02]">
                  <Heart className="w-10 h-10 text-stone-700 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-stone-300">Your collection is empty</p>
                  <p className="text-xs text-stone-500 mt-1">Tap the heart icon on any song to save it here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {likedSongs.map((song) => (
                    <SongCard
                      key={song.youtubeVideoId}
                      song={song}
                      isActive={isCurrentSong(song)}
                      isPlaying={isPlaying}
                      onPlay={handlePlaySong}
                      isLiked={isLiked(song)}
                      onLike={toggleLike}
                      variant="standard"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 6: HOME / DISCOVER / SEARCH RESULTS (Main Dashboard)
          ══════════════════════════════════════════════════════════════════════ */}
          {(activeTab === 'discover' || activeTab === 'search') && (
            <div className="max-w-6xl mx-auto space-y-8">
              {searchError && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* 1. HERO "NOW PLAYING" */}
              {currentSong && (
                <div className="water-hero rounded-3xl p-7 flex items-center justify-between relative overflow-hidden select-none">
                  <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#f5a77f]/10 blur-3xl pointer-events-none" />

                  <div className="flex items-center gap-6 z-10 min-w-0 flex-1">
                    <div className="relative w-44 h-44 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10 group">
                      <img
                        src={currentSong.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&q=80'}
                        alt={currentSong.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-stone-400 mb-1">
                        NOW PLAYING
                      </p>
                      <h1 className="font-editorial text-4xl lg:text-5xl font-normal text-stone-100 leading-tight truncate mb-1">
                        {currentSong.title}
                      </h1>
                      <p className="font-editorial italic text-stone-300 text-lg lg:text-xl truncate mb-2">
                        {currentSong.artist}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-stone-400 mb-3">
                        <Heart className="w-3.5 h-3.5 text-[#f5a77f] fill-current" />
                        <span>4.8M</span>
                        <span className="text-stone-600">•</span>
                        <span>Official Audio</span>
                        {duration > 0 && (
                          <>
                            <span className="text-stone-600">•</span>
                            <span className="font-mono text-[11px] text-stone-300 tabular-nums">
                              {formattedCurrentTime} / {formattedDuration}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="text-xs text-stone-400 line-clamp-1 max-w-md mb-5">
                        High-fidelity music stream with real-time waveform equalizer.
                      </p>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={togglePlay}
                          className="btn-peach px-6 py-2 rounded-full text-xs flex items-center gap-2 active:scale-95 transition-all"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              <span>Play</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => toggleLike(currentSong)}
                          className={`btn-circle-glass w-9 h-9 rounded-full flex items-center justify-center ${isLiked(currentSong) ? 'text-rose-500' : 'text-stone-300'}`}
                          title="Like"
                        >
                          <Heart className="w-4 h-4" style={{ fill: isLiked(currentSong) ? 'currentColor' : 'none' }} />
                        </button>

                        <button
                          onClick={() => {
                            if (customPlaylists.length > 0) {
                              handleAddSongToPlaylist(customPlaylists[0].id, currentSong);
                              setToastMsg(`Added "${currentSong.title}" to ${customPlaylists[0].name}`);
                              setTimeout(() => setToastMsg(''), 3000);
                            }
                          }}
                          className="btn-circle-glass w-9 h-9 rounded-full flex items-center justify-center text-stone-300"
                          title="Add to Playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col items-end justify-between self-stretch z-10 pl-6 shrink-0">
                    <div className="relative">
                      <div className={`vinyl-disc ${isPlaying ? 'spin-slow' : ''}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Disc className="w-7 h-7 text-[#170f0a]/60" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end gap-1 h-6 mt-6">
                      {[6, 12, 18, 14, 8, 16, 22, 10, 14, 8, 19, 12, 7, 15, 20, 10].map((h, i) => (
                        <span
                          key={i}
                          className="soundwave-bar"
                          style={{
                            height: isPlaying ? `${h}px` : '4px',
                            animationDelay: `${i * 70}ms`,
                            animationDuration: `${0.8 + (i % 4) * 0.2}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. "Made for you" SECTION */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-stone-100">Made for you</h2>
                  <button
                    onClick={() => handleSearch('top trending songs')}
                    className="text-xs font-semibold text-stone-500 hover:text-[#f5a77f] transition-colors"
                  >
                    See all
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {MADE_FOR_YOU.map((item, idx) => {
                    const cardSong = {
                      youtubeVideoId: item.youtubeVideoId,
                      title: item.title,
                      artist: item.artist,
                      thumbnailUrl: item.img,
                      duration: '3:45'
                    };
                    return (
                      <SongCard
                        key={idx}
                        song={cardSong}
                        subtitle={item.desc}
                        isActive={isCurrentSong(cardSong)}
                        isPlaying={isPlaying}
                        onPlay={() => handlePlaySong(cardSong)}
                        variant="wide"
                      />
                    );
                  })}
                </div>
              </section>

              {/* 3. TWO-COLUMN: Recently Played (Left) + Popular Tracks (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-stone-100">Recently played</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
                    {recentlyPlayed.map((song) => (
                      <SongCard
                        key={song.youtubeVideoId}
                        song={song}
                        isActive={isCurrentSong(song)}
                        isPlaying={isPlaying}
                        onPlay={handlePlaySong}
                        variant="square"
                      />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-stone-100">Popular tracks</h2>
                    <button
                      onClick={() => handleSearch('top hits')}
                      className="text-xs font-semibold text-stone-500 hover:text-[#f5a77f] transition-colors"
                    >
                      See all
                    </button>
                  </div>

                  <div className="space-y-2">
                    {popularTracks.map((song, i) => {
                      const active = isCurrentSong(song);
                      return (
                        <div
                          key={song.youtubeVideoId}
                          onClick={() => handlePlaySong(song)}
                          className={`water-row flex items-center justify-between p-2.5 rounded-2xl cursor-pointer group ${active ? 'bg-white/[0.06] border-[#f5a77f]/30' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-xs font-mono font-medium text-stone-500 w-5 text-center shrink-0">
                              {active && isPlaying ? (
                                <span className="flex items-end justify-center gap-0.5 h-3">
                                  <span className="soundwave-bar w-[2px] h-3" />
                                  <span className="soundwave-bar w-[2px] h-2" />
                                  <span className="soundwave-bar w-[2px] h-3.5" />
                                </span>
                              ) : (
                                `0${i + 1}`
                              )}
                            </span>
                            <img
                              src={song.thumbnailUrl || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=100&q=80'}
                              alt={song.title}
                              className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm"
                            />
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-semibold truncate ${active ? 'text-[#f5a77f]' : 'text-stone-200 group-hover:text-[#f5a77f]'}`}>
                                {song.title}
                              </p>
                              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                                {song.artist}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 pl-3">
                            <span className="text-[11px] font-mono text-stone-500 tabular-nums">
                              {active && duration > 0 ? formattedDuration : (song.duration || '3:45')}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                              className={`p-1 transition-colors ${isLiked(song) ? 'text-rose-500' : 'text-stone-600 hover:text-stone-300'}`}
                            >
                              <Heart className="w-3.5 h-3.5" style={{ fill: isLiked(song) ? 'currentColor' : 'none' }} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Complete Search Results / Catalog */}
              <section className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-stone-100">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Discover More Music'}
                  </h2>
                  <span className="text-xs text-stone-500">
                    {songs.length} tracks
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {songs.map((song) => (
                    <SongCard
                      key={song.youtubeVideoId}
                      song={song}
                      isActive={isCurrentSong(song)}
                      isPlaying={isPlaying}
                      onPlay={handlePlaySong}
                      isLiked={isLiked(song)}
                      onLike={toggleLike}
                      variant="standard"
                    />
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {/* In-app Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed', bottom: '110px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(30,22,18,0.95)', border: '1px solid rgba(201,169,110,0.35)',
            backdropFilter: 'blur(16px)', color: '#e8ddd4', padding: '10px 20px',
            borderRadius: '999px', fontSize: '13px', fontWeight: '600',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'fadeInUp 0.25s ease',
          }}
        >
          <span style={{ color: '#c9a96e' }}>✓</span> {toastMsg}
        </div>
      )}

      {/* Floating Bottom Music Player */}
      <PlayerBar
        isLiked={isLiked(currentSong)}
        onLike={toggleLike}
      />

      {/* Playlist Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="water-card p-6 rounded-3xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create New Playlist</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Playlist Name
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="e.g. Tamil Vibes, Night Drive"
                  className="water-input w-full px-4 py-2.5 rounded-xl text-xs"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-peach w-full py-2.5 rounded-xl text-xs font-bold">
                Create Playlist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Auth Modal for OTP Signup & Login */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />
    </div>
  );
}




// search
