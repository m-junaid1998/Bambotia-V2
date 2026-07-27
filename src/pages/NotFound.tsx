import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import logo from "@/assets/logo.webp";

const NotFound = () => {
  return (
    <section className="relative h-screen w-full bg-background flex items-center justify-center">
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        {/* LOGO */}
        <img src={logo} alt="Bambotia" className="h-16 w-auto  opacity-90" />

        {/* 404 */}
        <h1 className="text-[110px] md:text-[200px] font-black leading-none">
          <span className="bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
            404
          </span>
        </h1>

        <h2 className="mt-2 text-3xl md:text-5xl font-light tracking-wide text-foreground">
          Page Not Found
        </h2>

        <p className="mt-5 max-w-xl text-sm md:text-base text-muted-foreground leading-7">
          The page you are looking for doesn’t exist, has been moved, or is
          temporarily unavailable.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-3 text-sm font-medium text-background transition hover:scale-105"
          >
            <Home size={18} />
            Return Home
          </Link>
        </div>

        <div className="mt-5 text-[10px] tracking-[0.5em] uppercase text-accent">
          Bambotia Luxury Collection
        </div>
      </div>
    </section>
  );
};

export default NotFound;
