import React, { useState, useEffect, useRef } from 'react';
import { LocationConfig, LocationId } from '../types';

interface FullPageAtmosphereVideoProps {
  location: LocationConfig;
  isDarkMode: boolean;
}

const PRIMARY_VIDEOS: Record<LocationId, string> = {
  puducherry: '/videos/puducherry-clouds.mp4',
  mumbai: '/videos/mumbai-leaves.mp4',
  kerala: '/videos/kerala-thunderstorm.mp4',
  chennai: '/videos/chennai-heat.mp4',
};

const FALLBACK_VIDEOS: Record<LocationId, string> = {
  puducherry: '/videos/17499303-uhd_2560_1440_30fps.mp4',
  mumbai: '/videos/mumbai-rain.mp4',
  kerala: '/videos/11025478-hd_1920_1080_24fps.mp4',
  chennai: '/videos/17311357-uhd_3840_2160_30fps.mp4',
};

const POSTER_IMAGES: Record<LocationId, string> = {
  puducherry: '/hero.jpg',
  mumbai: '/images/mumbai-leaves.jpg',
  kerala: '/hero.jpg',
  chennai: '/hero.jpg',
};

export const FullPageAtmosphereVideo: React.FC<FullPageAtmosphereVideoProps> = ({
  location,
  isDarkMode,
}) => {
  const locId = (location?.id as LocationId) || 'mumbai';
  const primarySrc = PRIMARY_VIDEOS[locId] || PRIMARY_VIDEOS.mumbai;
  const fallbackSrc = FALLBACK_VIDEOS[locId] || FALLBACK_VIDEOS.mumbai;
  const posterSrc = POSTER_IMAGES[locId] || POSTER_IMAGES.mumbai;

  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHasError(false);
    setIsPlaying(false);
  }, [locId]);

  const activeSrc = hasError ? fallbackSrc : primarySrc;

  // Force autoplay across all browsers with sound muted
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;

    const attemptPlay = () => {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Atmosphere video autoplay notice:', err);
      });
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener('loadeddata', attemptPlay, { once: true });
      video.addEventListener('canplay', attemptPlay, { once: true });
    }

    return () => {
      video.removeEventListener('loadeddata', attemptPlay);
      video.removeEventListener('canplay', attemptPlay);
    };
  }, [activeSrc]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none select-none"
    >
      {/* Background Poster placeholder visible while video loads */}
      <img
        src={posterSrc}
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Full-Page Background Video */}
      <video
        ref={videoRef}
        key={activeSrc}
        src={activeSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={posterSrc}
        onPlaying={() => setIsPlaying(true)}
        onError={() => {
          if (!hasError) {
            setHasError(true);
          }
        }}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      />

      {/* Crystal Clear Ambient Layer — delicate tint that preserves UI text contrast without washing out the video */}
      <div
        className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${
          isDarkMode
            ? 'bg-black/45 backdrop-contrast-[1.05]'
            : 'bg-white/10 backdrop-contrast-[1.02]'
        }`}
      />
    </div>
  );
};
