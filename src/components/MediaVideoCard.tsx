// MediaVideoCard.tsx
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  url: string;
  title: string;
  className?: string;
}

const INTERSECTION_THRESHOLD = 0.25;

export const MediaVideoCard = memo(function MediaVideoCard({
  url,
  title,
  className = "",
}: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        entry.isIntersecting
          ? video
              .play()
              .catch((err) => console.info("Autoplay deferred:", err.message))
          : video.pause();
      },
      { threshold: INTERSECTION_THRESHOLD },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [url]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleLoaded = useCallback(() => setIsLoading(false), []);

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-label={`${title}. Tap to ${isMuted ? "unmute" : "mute"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ")
          handleCardClick(e as unknown as React.MouseEvent);
      }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 cursor-pointer select-none",
        className,
      )}
    >
      <div className="relative w-full aspect-[9/16] bg-neutral-950 overflow-hidden flex items-center justify-center">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-card">
            <Skeleton className="w-full h-full rounded-none" />
          </div>
        )}

        <video
          ref={videoRef}
          src={url}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          onLoadedData={handleLoaded}
          onCanPlay={handleLoaded}
          className={cn(
            "w-full h-full object-cover pointer-events-none select-none transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
          )}
        >
          <track
            kind="captions"
            src=""
            srcLang="en"
            label="No audio captions"
            default
          />
        </video>

        {!isLoading && (
          <div className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-white transition-transform duration-150 active:scale-90 animate-in fade-in zoom-in-75 duration-200">
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-3.5 space-y-1 pointer-events-none select-none">
        <h3
          className="font-sans text-xs sm:text-sm font-medium text-foreground tracking-wide truncate"
          title={title}
        >
          {title}
        </h3>
      </div>
    </div>
  );
});

export default MediaVideoCard;
