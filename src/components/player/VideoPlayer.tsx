import { useState, useRef, useEffect } from 'react';
import { useStreaming } from '@/hooks/useStreaming';
import { getProxiedUrl } from '@/lib/providers';
import Hls from 'hls.js';
import { Loader2, Play, Pause, Volume2, VolumeX, Maximize, SkipForward, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  animeTitle: string;
  episodeNumber: number;
  animeId: number;
  malId?: number;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
}

export default function VideoPlayer({
  animeTitle,
  episodeNumber,
  malId,
  onNextEpisode,
  hasNextEpisode,
}: VideoPlayerProps) {
  const { sources, loading, mode, selectedSource, toggleMode } =
    useStreaming(animeTitle, episodeNumber, malId);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load source with HLS.js support
  useEffect(() => {
    if (!selectedSource || !videoRef.current) return;

    const video = videoRef.current;
    const url = selectedSource.sourceUrl;

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (url.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({
        // Route all requests through our proxy
        xhrSetup: (_xhr: XMLHttpRequest, _url: string) => {
          // The main URL is already proxied
        },
        // Enable URL rewriting for segments
        manifestLoadingTimeOut: 15000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 15000,
        levelLoadingMaxRetry: 3,
        fragLoadingTimeOut: 20000,
        fragLoadingMaxRetry: 6,
      });

      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
        setIsPlaying(true);
      });

      hls.on(Hls.Events.ERROR, (_: any, data: any) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try to recover on network errors
              console.error('HLS network error, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              // Try to recover on media errors
              console.error('HLS media error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              console.error('HLS fatal error:', data);
              hls.destroy();
              break;
          }
        }
      });
    } else if (url.includes('.m3u8') && Hls.isSupported() === false && video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS - still need to proxy
      video.src = getProxiedUrl(url);
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      // Direct MP4 or other format
      video.src = url;
      video.play().catch(() => {});
      setIsPlaying(true);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedSource]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(current);
    setDuration(dur);
    setProgress(dur ? (current / dur) * 100 : 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = newTime;
    setProgress(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    if (!videoRef.current) return;
    videoRef.current.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const enterFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="relative w-full aspect-video bg-[#111] rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#ff4444] mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading {mode.toUpperCase()} sources...</p>
        </div>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="relative w-full aspect-video bg-[#111] rounded-xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-2">No streaming sources found</p>
          <button
            onClick={toggleMode}
            className="text-[#ff4444] hover:text-[#ff5555] text-sm font-medium"
          >
            Try {mode === 'sub' ? 'DUB' : 'SUB'} instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sub/Dub Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#1a1a1a] rounded-lg p-1">
          <button
            onClick={() => mode === 'dub' && toggleMode()}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'sub' ? 'bg-[#ff4444] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            SUB
          </button>
          <button
            onClick={() => mode === 'sub' && toggleMode()}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              mode === 'dub' ? 'bg-[#ff4444] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            DUB
          </button>
        </div>
        <span className="text-xs text-gray-500">
          Episode {episodeNumber} &bull; {mode.toUpperCase()}
        </span>
      </div>

      {/* Video Container */}
      <div
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
          crossOrigin="anonymous"
          preload="metadata"
        />

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-[#ff4444] flex items-center justify-center shadow-2xl shadow-[#ff4444]/30 hover:scale-110 transition-transform"
            >
              <Play className="h-8 w-8 text-white fill-white ml-1" />
            </button>
          </div>
        )}

        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-16 pb-4 px-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#ff4444] hover:h-1.5 transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="text-white hover:text-[#ff4444] transition-colors">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
              </button>
              <span className="text-xs text-gray-300 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex items-center gap-1 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-[#ff4444] transition-colors">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/vol:w-16 transition-all duration-200 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#ff4444]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasNextEpisode && onNextEpisode && (
                <button onClick={onNextEpisode} className="text-white hover:text-[#ff4444] transition-colors" title="Next Episode">
                  <SkipForward className="h-5 w-5" />
                </button>
              )}
              <button onClick={enterFullscreen} className="text-white hover:text-[#ff4444] transition-colors">
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedSource && (
        <div className="text-xs text-gray-500">
          Source: {selectedSource.sourceName}
        </div>
      )}
    </div>
  );
}
