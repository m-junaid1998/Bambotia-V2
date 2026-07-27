import { ArrowRight, Star } from "lucide-react";
import heroImage from "@/assets/hero-model.webp";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const handleScrollToNewArrivals = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetSection = document.getElementById("new-arrivals");
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center overflow-hidden pt-20 bg-background">
      <div
        className="absolute inset-0 z-10 hidden md:block pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, var(--background) 0%, rgba(0,0,0,0.6) 40%, transparent 100%)",
        }}
      />

      <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 h-full z-0">
        <img
          src={heroImage}
          alt="Luxury fashion model wearing Bambotia jewellery"
          className="w-full h-full object-cover object-center md:object-top"
          width={1024}
          height={1280}
          loading="eager"
          decoding="async"
        />

        <div
          className="absolute inset-0 z-1 md:hidden pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, var(--background) 0%, rgba(0,0,0,0.3) 90%, transparent 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-1 hidden md:block pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, var(--background) 10%, transparent 40%)",
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-0">
        <div className="max-w-[430px] md:pt-2">
          <AnimateOnScroll animation="fade-up" delay={100}>
            <p className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] text-accent mb-4 sm:mb-6 flex items-center gap-2">
              <span className="w-6 sm:w-8 h-px bg-accent inline-block font-extrabold" />
              GLOBAL LUXURY · PAKISTANI ELEGANCE
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={250}>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[0.98] mb-1">
              Elegance
            </h1>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-medium italic text-gradient-gold leading-[0.98] mb-7 sm:mb-8">
              Redefined
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={400}>
            <p className="text-sm sm:text-base text-muted-foreground mb-1.5">
              Curated luxury for the modern woman
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-10 sm:mb-11">
              Jewellery · Cosmetics · Designer Purses
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll animation="fade-up" delay={550}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/category/jewellery"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-accent text-accent-foreground font-medium text-sm tracking-wider rounded hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={handleScrollToNewArrivals}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 border border-foreground/20 text-foreground font-medium text-sm tracking-wider rounded hover:border-accent hover:text-accent transition-colors w-full sm:w-auto text-left"
              >
                New Arrivals <Star className="w-4 h-4" />
              </button>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
