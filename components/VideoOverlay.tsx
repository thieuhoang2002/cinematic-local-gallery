
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings, Eye, Shuffle } from 'lucide-react';
import { MediaItem } from '../types';
import { getVideoSrc } from '../utils/mediaUrl';
import VideoThumbnail from './VideoThumbnail';

interface VideoOverlayProps {
  video: MediaItem;
  onClose: () => void;
  allVideos?: MediaItem[];
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ video, onClose, allVideos = [] }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoplayRandom, setAutoplayRandom] = useState(false);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Get random suggested videos (excluding current video)
  const suggestedVideos = useMemo(() => {
    const filtered = allVideos.filter(v => v.id !== video.id);
    // Shuffle and take first 8
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  }, [allVideos, video.id]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Reset and autoplay when video changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setCurrentTime(0);
      videoRef.current.play().catch(err => console.log('Autoplay prevented:', err));
    }
  }, [video.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (autoplayRandom && allVideos.length > 1) {
        // Get random video (excluding current)
        const filtered = allVideos.filter(v => v.id !== video.id);
        const randomIndex = Math.floor(Math.random() * filtered.length);
        const randomVideo = filtered[randomIndex];
        
        // Dispatch custom event to open random video
        window.dispatchEvent(new CustomEvent('openVideo', { detail: randomVideo }));
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [autoplayRandom, allVideos, video.id]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0f0f0f] overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Top Bar - YouTube style */}
        <div className="h-14 bg-[#0f0f0f] flex items-center px-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Video Container - YouTube style */}
        <div className={`bg-black ${isTheaterMode ? 'w-full' : 'max-w-[1280px] mx-auto w-full'}`}>
          <div 
            ref={containerRef}
            className={`relative bg-black group ${isFullscreen ? 'w-screen h-screen' : ''}`}
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            {/* Video */}
            <video
              ref={videoRef}
              className={`w-full bg-black ${isFullscreen ? 'h-screen object-contain' : 'h-auto max-h-[calc(100vh-200px)]'}`}
              onClick={togglePlay}
              autoPlay
            >
              <source src={getVideoSrc(video.src)} type={video.src.toLowerCase().endsWith('.mov') ? 'video/quicktime' : video.src.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
              Your browser does not support the video tag.
            </video>

            {/* Center Play Button */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-90">
                  <Play className="w-8 h-8 text-white fill-current ml-1" />
                </div>
              </div>
            )}

            {/* Controls Overlay */}
            <div 
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Progress Bar */}
              <div className="px-3 pt-2">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none 
                    [&::-webkit-slider-thumb]:w-3 
                    [&::-webkit-slider-thumb]:h-3 
                    [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-red-600 
                    [&::-webkit-slider-thumb]:cursor-pointer
                    hover:[&::-webkit-slider-thumb]:scale-125 
                    [&::-webkit-slider-thumb]:transition-transform"
                  style={{
                    background: `linear-gradient(to right, #dc2626 0%, #dc2626 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-3 pb-2 pt-1">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isPlaying ? 
                      <Pause className="w-6 h-6 text-white fill-current" /> : 
                      <Play className="w-6 h-6 text-white fill-current" />
                    }
                  </button>

                  <button
                    onClick={() => skip(-5)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Backward 5s"
                  >
                    <SkipBack className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => skip(5)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Forward 5s"
                  >
                    <SkipForward className="w-5 h-5 text-white" />
                  </button>

                  {/* Volume */}
                  <div 
                    className="flex items-center gap-2 group/volume"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isMuted || volume === 0 ? 
                        <VolumeX className="w-6 h-6 text-white" /> : 
                        <Volume2 className="w-6 h-6 text-white" />
                      }
                    </button>
                    
                    <div className={`transition-all duration-200 overflow-hidden ${showVolumeSlider ? 'w-16 opacity-100' : 'w-0 opacity-0'}`}>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer 
                          [&::-webkit-slider-thumb]:appearance-none 
                          [&::-webkit-slider-thumb]:w-3 
                          [&::-webkit-slider-thumb]:h-3 
                          [&::-webkit-slider-thumb]:rounded-full 
                          [&::-webkit-slider-thumb]:bg-white"
                      />
                    </div>
                  </div>

                  <span className="text-white text-sm font-medium ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  {/* Autoplay Random */}
                  <button
                    onClick={() => setAutoplayRandom(!autoplayRandom)}
                    className={`p-2 rounded-full transition-colors ${
                      autoplayRandom ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-white/20'
                    }`}
                    title={autoplayRandom ? "Tắt phát ngẫu nhiên" : "Bật phát ngẫu nhiên"}
                  >
                    <Shuffle className="w-5 h-5 text-white" />
                  </button>

                  {/* Playback Speed */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className="px-3 py-1 hover:bg-white/20 rounded transition-colors text-white text-sm font-medium min-w-[50px] flex items-center gap-1"
                      title="Playback speed"
                    >
                      <Settings className="w-4 h-4" />
                      {playbackRate === 1 ? '' : `${playbackRate}x`}
                    </button>
                    
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-[#282828] rounded-lg shadow-xl overflow-hidden">
                        {speedOptions.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => changePlaybackRate(speed)}
                            className={`block w-full px-4 py-2 text-left text-sm hover:bg-white/20 transition-colors ${
                              playbackRate === speed ? 'bg-white/10 text-white font-semibold' : 'text-gray-300'
                            }`}
                          >
                            {speed === 1 ? 'Normal' : `${speed}x`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsTheaterMode(!isTheaterMode)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title={isTheaterMode ? "Default view" : "Theater mode"}
                  >
                    {isTheaterMode ? 
                      <Minimize className="w-5 h-5 text-white" /> :
                      <Maximize className="w-5 h-5 text-white" />
                    }
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title={isFullscreen ? "Exit fullscreen (Esc)" : "Fullscreen (F)"}
                  >
                    {isFullscreen ? 
                      <Minimize className="w-6 h-6 text-white" /> :
                      <Maximize className="w-6 h-6 text-white" />
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info - YouTube style */}
        <div className={`${isTheaterMode ? 'w-full px-8' : 'max-w-[1280px] mx-auto w-full px-4'} py-4 bg-[#0f0f0f]`}>
          <h1 className="text-xl font-semibold text-white mb-2">
            {video.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>{video.date}</span>
            <span>•</span>
            <span className="px-2 py-1 bg-white/10 rounded text-xs">{video.category}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{video.views || 0} lượt xem</span>
            </div>
          </div>
        </div>

        {/* Suggested Videos - Show only when not in fullscreen */}
        {!isFullscreen && suggestedVideos.length > 0 && (
          <div className={`${isTheaterMode ? 'w-full px-8' : 'max-w-[1280px] mx-auto w-full px-4'} py-6 bg-[#0f0f0f]`}>
            <h2 className="text-lg font-semibold text-white mb-4">Video gợi ý</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {suggestedVideos.map((suggestedVideo) => (
                <div
                  key={suggestedVideo.id}
                  onClick={() => {
                    // Close current video and open suggested one
                    onClose();
                    setTimeout(() => {
                      const videoClickEvent = new CustomEvent('openVideo', { detail: suggestedVideo });
                      window.dispatchEvent(videoClickEvent);
                    }, 100);
                  }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-video overflow-hidden rounded-lg bg-white/5 mb-2 transition-transform duration-300 group-hover:scale-[1.02]">
                    <VideoThumbnail
                      src={suggestedVideo.src}
                      thumbnailUrl={suggestedVideo.thumbnail}
                      alt={suggestedVideo.title}
                      className="w-full h-full object-cover"
                    />
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                        <Play className="text-white w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-medium text-white group-hover:text-red-500 transition-colors mb-1 line-clamp-2">
                    {suggestedVideo.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{suggestedVideo.date}</span>
                    <span>•</span>
                    <span>{suggestedVideo.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoOverlay;
