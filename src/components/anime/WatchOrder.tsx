import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWatchOrderForAnime, formatWatchOrderMetadata, parseHtmlToTextChunks } from '@/lib/watch-order';
import { ListOrdered, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WatchOrderProps {
  animeId: number;
}

export default function WatchOrder({ animeId }: WatchOrderProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [seriesData, setSeriesData] = useState<any>(null);
  const [watchOrder, setWatchOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWatchOrder();
  }, [animeId]);

  const loadWatchOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getWatchOrderForAnime(animeId);
      if (result.seriesData && result.watchOrder) {
        setSeriesData(result.seriesData);
        setWatchOrder(result.watchOrder);
      } else {
        setError('No watch order available');
      }
    } catch (err) {
      setError('Failed to load watch order');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#111] rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <ListOrdered className="h-5 w-5 text-[#ff4444]" />
          <h3 className="text-white font-semibold">Watch Order</h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4444]" />
        </div>
      </div>
    );
  }

  if (error || !watchOrder) {
    return null;
  }

  const prologueChunks = parseHtmlToTextChunks(seriesData?.prologue_html);
  const descriptionChunks = parseHtmlToTextChunks(watchOrder?.description_html);

  return (
    <div className="bg-[#111] rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-4">
        <ListOrdered className="h-5 w-5 text-[#ff4444]" />
        <h3 className="text-white font-semibold">Watch Order</h3>
      </div>

      {/* Prologue */}
      {prologueChunks.length > 0 && (
        <div className="mb-4 text-sm text-gray-400">
          {prologueChunks.map((chunk, i) => (
            chunk.type === 'link' ? (
              <a key={i} href={chunk.href} target="_blank" rel="noopener noreferrer" className="text-[#ff4444] hover:underline">
                {chunk.content}
              </a>
            ) : (
              <span key={i}>{chunk.content} </span>
            )
          ))}
        </div>
      )}

      {/* Description */}
      {descriptionChunks.length > 0 && (
        <div className="mb-4 text-sm text-gray-400">
          {descriptionChunks.map((chunk, i) => (
            chunk.type === 'link' ? (
              <a key={i} href={chunk.href} target="_blank" rel="noopener noreferrer" className="text-[#ff4444] hover:underline">
                {chunk.content}
              </a>
            ) : (
              <span key={i}>{chunk.content} </span>
            )
          ))}
        </div>
      )}

      {/* Steps */}
      <div className="space-y-2">
        {watchOrder.steps.map((step: any, index: number) => {
          const isCurrentAnime = step.media?.id === animeId;
          const metadata = formatWatchOrderMetadata(step.media);

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCurrentAnime
                  ? 'bg-[#ff4444]/20 border border-[#ff4444]/30'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-gray-500 text-sm font-mono w-6">
                {index + 1}.
              </span>
              
              <img
                src={step.media?.coverImage?.large || ''}
                alt={step.media?.title?.userPreferred || ''}
                className="w-10 h-14 object-cover rounded"
              />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isCurrentAnime ? 'text-[#ff4444]' : 'text-white'}`}>
                  {step.media?.title?.userPreferred || step.step_title}
                </p>
                <p className="text-xs text-gray-500 truncate">{metadata}</p>
                {step.is_optional && (
                  <span className="text-xs text-yellow-500">Optional</span>
                )}
              </div>

              {!isCurrentAnime && step.media?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/anime/${step.media.id}`)}
                  className="text-gray-400 hover:text-white shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
