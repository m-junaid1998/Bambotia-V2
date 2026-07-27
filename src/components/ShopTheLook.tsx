import look1 from "@/assets/shop-look-1.jpg";
import look2 from "@/assets/shop-look-2.jpg";
import look3 from "@/assets/shop-look-3.jpg";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface LookItem {
  id: string;
  image: string;
  tag: string;
}

const LOOKS_DATA: LookItem[] = [
  { id: "look-01", image: look1, tag: "Classic Silver Look" },
  { id: "look-02", image: look2, tag: "Elegant Evening Look" },
  { id: "look-03", image: look3, tag: "Modern Glam Look" },
];

const ShopTheLook = () => (
  <section className="py-16 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-12">
      <AnimateOnScroll animation="fade-up">
        <div className="text-center space-y-2 md:space-y-3">
          <p className="text-[10px] sm:text-xs tracking-[0.3em] text-accent uppercase font-medium">
            CURATED STYLE
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Shop the Look
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md md:max-w-none md:whitespace-nowrap mx-auto">
            Our stylists' top picks — Complete looks mixing Jewellery, Cosmetics & Purses.
          </p>
        </div>
      </AnimateOnScroll>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {LOOKS_DATA.map((look, index) => {
          const isThirdItem = index === 2;
          return (
            <AnimateOnScroll
              key={look.id}
              animation="scale-up"
              delay={index * 150}
              className={isThirdItem ? "col-span-2 md:col-span-1 w-full" : ""}
            >
              <div className="group relative overflow-hidden rounded-sm cursor-pointer aspect-[3/4] bg-card border border-border/40 w-full">
                <img
                  src={look.image}
                  alt={look.tag}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                  width={600}
                  height={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-6" />
              </div>
            </AnimateOnScroll>
          );
        })}
      </div>
    </div>
  </section>
);

export default ShopTheLook;