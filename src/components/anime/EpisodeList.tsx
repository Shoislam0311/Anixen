import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { JikanEpisode } from '@/types';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EpisodeListProps {
  episodes: JikanEpisode[];
  animeId: number;
  animeTitle: string;
  currentEpisode?: number;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
}

export default function EpisodeList({ episodes, animeId, animeTitle, currentEpisode, hasNextPage, onLoadMore }: EpisodeListProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [filter, setFilter] = useState('');

  const filteredEpisodes = filter
    ? episodes.filter(ep =>
        ep.title?.toLowerCase().includes(filter.toLowerCase()) ||
        ep.episode.toString().includes(filter)
      )
    : episodes;

  if (episodes.length === 0) {
    return (
      <div className="bg-[#111] rounded-xl p-6 text-center">
        <p className="text-gray-500">No episodes available</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-white font-semibold hover:text-[#ff4444] transition-colors"
        >
          Episodes ({episodes.length})
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter episodes..."
          className="bg-white/5 border border-white/10 rounded-md px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff4444]/50"
        />
      </div>

      {/* Episode Grid */}
      {isExpanded && (
        <>
          <div className="max-h-[500px] overflow-y-auto p-2">
            <div className="grid grid-cols-1 gap-1">
              {filteredEpisodes.map((ep, idx) => {
                const epNum = ep.episode || idx + 1;
                const isActive = epNum === currentEpisode;
                return (
                  <button
                    key={ep.mal_id}
                    onClick={() => navigate(`/watch/${animeId}?ep=${epNum}&title=${encodeURIComponent(animeTitle)}`)}
                    className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-[#ff4444]/20 border border-[#ff4444]/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-[#ff4444]' : 'bg-white/5'
                    }`}>
                      {isActive ? (
                        <Play className="h-4 w-4 text-white fill-white" />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">{epNum}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-[#ff4444]' : 'text-white'}`}>
                        {ep.title || `Episode ${epNum}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ep.aired ? new Date(ep.aired).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    {ep.filler && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">FILLER</span>
                    )}
                    {ep.recap && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">RECAP</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {hasNextPage && onLoadMore && (
            <div className="p-3 border-t border-white/5">
              <Button
                variant="outline"
                onClick={onLoadMore}
                className="w-full border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
              >
                Load More Episodes
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
