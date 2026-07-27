import { Star } from "lucide-react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const reviews = [
  {
    name: "Fatima Khan", avatar: "FK", rating: 5,
    text: "The emerald jhumka earrings are breathtaking! The craftsmanship is exceptional — every detail reflects true Pakistani artistry.",
    product: "Emerald Jhumka Earrings",
  },
  {
    name: "Sophia Ahmed", avatar: "SA", rating: 5,
    text: "BAMBOTIA's cosmetics collection is my absolute favorite. The foundation gives the most natural, dewy finish all day long.",
    product: "Silk Glow Foundation",
  },
  {
    name: "Hira Malik", avatar: "HM", rating: 5,
    text: "I purchased the tote and it's stunning — the leather quality is premium and the gold hardware is so elegant. Worth every rupee!",
    product: "Bordeaux Leather Tote",
  },
  {
    name: "Ayesha Riaz", avatar: "AR", rating: 5,
    text: "The velvet lipstick duo is incredible. Rich pigment, smooth application, and lasts all day without drying out my lips.",
    product: "Velvet Rose Lipstick Duo",
  },
  {
    name: "Laiba Noor", avatar: "LN", rating: 5,
    text: "Ordered the heritage bangles for my sister's wedding — they arrived beautifully packaged and look even better in person!",
    product: "Heritage Gold Bangles",
  },
  {
    name: "Mariam Shah", avatar: "MS", rating: 5,
    text: "BAMBOTIA truly combines global luxury with Pakistani soul. The emerald clutch I bought is my go-to for every formal event.",
    product: "Emerald Satin Clutch",
  },
];

const Testimonials = () => (
  <section className="py-16  bg-card/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <AnimateOnScroll animation="fade-up">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.3em] text-accent mb-3">TESTIMONIALS</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            What Our Customers Are Saying
          </h2>
        </div>
      </AnimateOnScroll>

        

      <div className="grid md:grid-cols-3 gap-5">
        {reviews.map((r, i) => (
          <AnimateOnScroll key={i} animation="fade-up" delay={i * 100}>
            <div className="bg-background border border-border rounded-sm p-6 flex flex-col gap-4 hover:border-accent/30 transition-colors h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center text-sm font-semibold">
                  {r.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{r.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="w-3 h-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{r.text}"</p>
              <p className="text-[10px] tracking-[0.15em] text-accent/70">{r.product}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
