import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, User, LogOut, LogIn, Bookmark, Home, Tv, Film, TrendingUp, Radio, Sparkles, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import AniXenLogo from './AniXenLogo';

export default function Layout() {
  const { user, isLoggedIn, logout, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'TV Series', path: '/tv-series', icon: Tv },
    { label: 'Movies', path: '/movies', icon: Film },
    { label: 'Most Popular', path: '/most-popular', icon: TrendingUp },
    { label: 'Top Airing', path: '/top-airing', icon: Radio },
    { label: 'Seasonal', path: '/seasonal', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[#111] border-white/10 w-72">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 mt-8">
                <AniXenLogo className="h-8 w-auto" />
                <nav className="flex flex-col gap-1">
                  {navLinks.map(link => (
                    <button
                      key={link.path}
                      onClick={() => navigate(link.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'bg-[#ff4444]/20 text-[#ff4444]'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </button>
                  ))}
                </nav>
                {isLoggedIn && (
                  <>
                    <div className="border-t border-white/10 pt-4">
                      <button
                        onClick={() => navigate('/bookmarks')}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Bookmark className="h-4 w-4" />
                        Bookmarks
                      </button>
                      <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Profile
                      </button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <button onClick={() => navigate('/home')} className="flex items-center gap-2 shrink-0">
            <AniXenLogo className="h-7 w-auto" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#ff4444] bg-[#ff4444]/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search anime..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#ff4444]/50 focus:ring-[#ff4444]/20"
              />
            </div>
          </form>

          {/* Auth */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden border border-white/10 hover:border-[#ff4444]/50">
                    {profile?.photo_url || user?.user_metadata?.avatar_url ? (
                      <img
                        src={profile?.photo_url || user?.user_metadata?.avatar_url || ''}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-white/10">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white truncate">{profile?.display_name || user?.user_metadata?.display_name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer">
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/bookmarks')} className="text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer">
                    <Bookmark className="mr-2 h-4 w-4" /> Bookmarks
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={logout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className="text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <LogIn className="h-4 w-4 mr-1" /> Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowRegister(true)}
                  className="bg-[#ff4444] hover:bg-[#ff3333] text-white"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <AniXenLogo className="h-8 w-auto mb-4" />
              <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                AniXen is your ultimate destination for anime streaming. Discover thousands of anime series and movies from Japan, China, and Korea with Sub and Dub options.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Navigation</h3>
              <div className="flex flex-col gap-2">
                {navLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="text-gray-500 hover:text-[#ff4444] text-sm text-left transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className="h-3 w-3" /> {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <div className="flex flex-col gap-2 text-sm text-gray-500">
                <span>AniXen does not host any video files.</span>
                <span>All content is sourced from third-party providers.</span>
                <span className="mt-4">&copy; {new Date().getFullYear()} AniXen. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
    </div>
  );
}
