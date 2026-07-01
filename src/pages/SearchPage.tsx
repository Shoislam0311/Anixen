import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearchAnime } from '@/hooks/useAnime';
import AnimeGrid from '@/components/anime/AnimeGrid';
import { Search, ArrowLeft } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { results, loading } = useSearchAnime(query);

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Search className="h-6 w-6 text-[#ff4444]" />
        <h1 className="text-2xl font-bold text-white">
          Search Results for "<span className="text-[#ff4444]">{query}</span>"
        </h1>
      </div>

      <p className="text-gray-500 mb-6">
        Found {results.length} results
      </p>

      <AnimeGrid
        anime={results}
        loading={loading}
        emptyMessage={query.length < 2 ? 'Type at least 2 characters to search' : `No results found for "${query}"`}
      />
    </div>
  );
}
