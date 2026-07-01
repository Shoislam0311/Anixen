import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from '@/components/layout/Layout';

const EntryPage = lazy(() => import('@/pages/EntryPage'));
const HomePage = lazy(() => import('@/pages/HomePage'));
const AnimeDetailPage = lazy(() => import('@/pages/AnimeDetailPage'));
const WatchPage = lazy(() => import('@/pages/WatchPage'));
const SearchPage = lazy(() => import('@/pages/SearchPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const BookmarksPage = lazy(() => import('@/pages/BookmarksPage'));
const MoviesPage = lazy(() => import('@/pages/MoviesPage'));
const SeriesPage = lazy(() => import('@/pages/SeriesPage'));
const PopularPage = lazy(() => import('@/pages/PopularPage'));
const AiringPage = lazy(() => import('@/pages/AiringPage'));
const SeasonalPage = lazy(() => import('@/pages/SeasonalPage'));
const GenrePage = lazy(() => import('@/pages/GenrePage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#ff4444] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
          success: { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><EntryPage /></Suspense>} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
          <Route path="/anime/:id" element={<Suspense fallback={<PageLoader />}><AnimeDetailPage /></Suspense>} />
          <Route path="/watch/:id" element={<Suspense fallback={<PageLoader />}><WatchPage /></Suspense>} />
          <Route path="/search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
          <Route path="/profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
          <Route path="/bookmarks" element={<Suspense fallback={<PageLoader />}><BookmarksPage /></Suspense>} />
          <Route path="/movies" element={<Suspense fallback={<PageLoader />}><MoviesPage /></Suspense>} />
          <Route path="/tv-series" element={<Suspense fallback={<PageLoader />}><SeriesPage /></Suspense>} />
          <Route path="/most-popular" element={<Suspense fallback={<PageLoader />}><PopularPage /></Suspense>} />
          <Route path="/top-airing" element={<Suspense fallback={<PageLoader />}><AiringPage /></Suspense>} />
          <Route path="/seasonal" element={<Suspense fallback={<PageLoader />}><SeasonalPage /></Suspense>} />
          <Route path="/genre/:genreName?" element={<Suspense fallback={<PageLoader />}><GenrePage /></Suspense>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
