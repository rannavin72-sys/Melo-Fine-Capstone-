import React from 'react';
import {
  Home, Search, Library, Heart, ListMusic, Disc, Users, Plus,
  ChevronDown, LogOut, Sparkles, User as UserIcon
} from 'lucide-react';

const PLAYLISTS = [
  {
    name: 'Late Night Drive',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80',
    desc: 'Chill songs for city nights',
    query: 'Late Night Drive chill songs'
  },
  {
    name: 'Acoustic Mornings',
    img: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=100&q=80',
    desc: 'Soft, calm & beautiful',
    query: 'Acoustic guitar indie soulful'
  },
  {
    name: 'Heartbreak Diaries',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=100&q=80',
    desc: 'Sad emotional ballads',
    query: 'Emotional ballads someone like you'
  },
  {
    name: 'Good Vibes',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&q=80',
    desc: 'Feel good upbeat playlist',
    query: 'Feel good happy indie pop'
  },
];

export default function Sidebar({ activeTab, setTab, user, onOpenAuth, onLogout, onPlaylistClick }) {
  const nav = [
    { id: 'discover', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'artists', label: 'Artists', icon: Users },
  ];

  return (
    <aside className="glass-sidebar w-60 shrink-0 flex flex-col h-full z-30 select-none">
      {/* Brand Header: ✦ MELO-FINE */}
      <div className="px-6 pt-7 pb-6 flex items-center gap-2.5">
        <span className="text-[#f5a77f] text-lg leading-none">✦</span>
        <span className="text-xs uppercase font-light tracking-[0.28em] text-stone-200">
          MELO-FINE
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="px-4 space-y-1">
        {nav.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 my-5 h-px bg-white/[0.04]" />

      {/* Your Playlists */}
      <div className="px-6 flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-stone-500">
          YOUR PLAYLISTS
        </span>
        <button
          onClick={() => setTab('playlists')}
          className="text-stone-500 hover:text-stone-300 transition-colors"
          title="Create or View Playlists"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Playlists List */}
      <div className="px-4 space-y-1 overflow-y-auto flex-1 no-scrollbar">
        {PLAYLISTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onPlaylistClick ? onPlaylistClick(p) : setTab('discover')}
            className="w-full flex items-center gap-3 p-2 rounded-xl text-left hover:bg-white/[0.04] transition-colors group"
          >
            <img
              src={p.img}
              alt={p.name}
              className="w-8 h-8 rounded-lg object-cover shrink-0 brightness-90 group-hover:brightness-100 transition-all"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-stone-300 group-hover:text-stone-100 truncate">
                {p.name}
              </p>
              <p className="text-[10px] text-stone-500 truncate">
                {p.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-white/[0.04]">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e68d5f] to-[#f5a77f] text-[#170f0a] font-bold text-xs flex items-center justify-center shrink-0">
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-stone-200 truncate">{user.username}</p>
                <p className="text-[10px] text-stone-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-peach w-full py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In / Join</span>
          </button>
        )}
      </div>
    </aside>
  );
}
