import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Film, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMedia } from "@/hooks/useMedia";
import { MediaVideoCard } from "../components/MediaVideoCard";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface MediaItem {
  _id: string;
  mediaUrl: string;
  title: string;
}

const CARD_GAP = 16;
const SKELETON_COUNT = 4;

export default function AutomatedMediaStream() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardStep, setCardStep] = useState(296);

  const { mediaItems = [], isFetchingMedia } = useMedia({
    page: 1,
    limit: 10,
    type: "video",
  });

  const itemCount = mediaItems.length;
  const showNav = !isFetchingMedia && itemCount > 1;

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const firstCard = el.firstElementChild as HTMLElement | null;
    if (firstCard) {
      setCardStep(firstCard.getBoundingClientRect().width + CARD_GAP);
    }
  }, [isFetchingMedia, itemCount]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, itemCount - 1));
      sliderRef.current?.scrollTo({ left: clamped * cardStep, behavior: "smooth" });
      setActiveIndex(clamped);
    },
    [itemCount, cardStep]
  );

  const updateActiveIndex = useCallback(() => {
    const el = sliderRef.current;
    if (!el) return;
    setActiveIndex(Math.round(el.scrollLeft / cardStep));
  }, [cardStep]);

  const scroll = useCallback(
    (dir: -1 | 1) => scrollToIndex(activeIndex + dir),
    [activeIndex, scrollToIndex]
  );

  const skeletons = useMemo(() => Array.from({ length: SKELETON_COUNT }), []);

  if (!isFetchingMedia && itemCount === 0) return null;

  return (
    <section className="py-4 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <AnimateOnScroll animation="fade-up">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-accent animate-pulse" aria-hidden="true" />
              <h2 className="text-sm uppercase tracking-[0.2em] text-accent font-semibold">
                Bambotia Studio Feed
              </h2>
            </div>

            {showNav && (
              <div className="flex gap-2">
                {[
                  { icon: ChevronLeft, dir: -1 as const, disabled: activeIndex === 0, label: "Previous video" },
                  { icon: ChevronRight, dir: 1 as const, disabled: activeIndex === itemCount - 1, label: "Next video" },
                ].map(({ icon: Icon, dir, disabled, label }) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => scroll(dir)}
                    disabled={disabled}
                    aria-label={label}
                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-muted transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={100}>
            <div
              ref={sliderRef}
              onScroll={updateActiveIndex}
              role="region"
              aria-label="Video feed"
              className="flex gap-4 overflow-x-auto snap-x snap-proximity scrollbar-hide px-2 overscroll-x-contain"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {isFetchingMedia
                ? skeletons.map((_, i) => (
                    <div
                      key={i}
                      className="w-[250px] md:w-[280px] shrink-0 rounded-2xl border overflow-hidden"
                    >
                      <Skeleton className="aspect-[9/16]" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))
                : mediaItems.map((item: MediaItem) => (
                    <MediaVideoCard
                      key={item._id}
                      url={item.mediaUrl}
                      title={item.title}
                      className="w-[250px] md:w-[280px] shrink-0 snap-start [scroll-snap-stop:normal]"
                    />
                  ))}
            </div>
          </AnimateOnScroll>
        

        {showNav && (
          <AnimateOnScroll animation="fade-in" delay={200}>
            <div className="flex justify-center gap-2 mt-4" role="tablist" aria-label="Slide navigation">
              {mediaItems.map((_: MediaItem, i: number) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={activeIndex === i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => scrollToIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === i ? "w-6 bg-accent" : "w-2 bg-border hover:bg-accent/50"
                  }`}
                />
              ))}
            </div>
          </AnimateOnScroll>
        )}
      </div>
    </section>
  );
}