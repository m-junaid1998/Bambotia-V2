import { Gem, Heart, Award, ShieldCheck } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const stats = [
  { value: "500+", label: "LUXURY PRODUCTS", icon: Gem },
  { value: "10K+", label: "HAPPY CUSTOMERS", icon: Heart },
  { value: "3", label: "PREMIUM CATEGORIES", icon: Award },
  { value: "100%", label: "AUTHENTIC QUALITY", icon: ShieldCheck },
];

const StatsBar = () => (
  <section className="border-y border-border bg-card">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4">
      {stats.map((stat, i) => (
        <AnimateOnScroll key={i} animation="fade-up" delay={i * 100}>
          <div className="py-6 md:py-8 flex items-center justify-center gap-3 border-r border-border last:border-r-0">
            <stat.icon className="w-5 h-5 text-accent hidden sm:block" />
            <div className="text-center sm:text-left">
              <p className="font-heading text-xl md:text-2xl font-bold text-gradient-gold">{stat.value}</p>
              <p className="text-[10px] tracking-[0.15em] text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        </AnimateOnScroll>
      ))}
    </div>
  </section>
);

export default StatsBar;
