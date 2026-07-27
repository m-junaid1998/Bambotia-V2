import { Link, useLocation } from "react-router-dom";
import { Home, LayoutGrid, Heart, User, PackageCheck } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

const items = [
  { to: "/", label: "Home", icon: Home },
  {
    to: "/search", 
    label: "Categories",
    icon: LayoutGrid,
  },

  {
    to: "/myorders", 
    label: "My Orders",
    icon: PackageCheck,
  },
    {
    to: "/wishlist",
    label: "Wishlist",
    icon: Heart,
    showBadge: true, 
  },
  {
    to: "/myprofile",
    label: "Account",
    icon: User,
  },
];

const BottomNav = () => {
  const { pathname } = useLocation();
  const { wishlistItems } = useWishlist();

  const wishlistCount = wishlistItems?.length || 0;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border"
      aria-label="Bottom navigation"
    >
      <ul className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, label, icon: Icon, showBadge }) => {
          const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
          const currentCount = showBadge ? wishlistCount : 0;
          return (
            <li key={label} className="flex-1">
              <Link
                to={to}
                className="flex flex-col items-center gap-0.5 py-1 group"
                aria-current={isActive ? "page" : undefined}
              >
                <span
                  className={`relative inline-flex items-center justify-center w-10 h-8 rounded-full transition-all ${
                    isActive ? "bg-accent/15" : "group-hover:bg-muted/50"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  
                  {currentCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center animate-in scale-in duration-200">
                      {currentCount}
                    </span>
                  )}
                </span>
                
                <span
                  className={`text-[10px] tracking-wider transition-colors ${
                    isActive ? "text-accent font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                
                <span
                  className={`h-0.5 w-6 rounded-full transition-all duration-300 ${
                    isActive ? "bg-accent scale-x-100" : "bg-transparent scale-x-0"
                  }`}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNav;