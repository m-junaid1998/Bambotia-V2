import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  User,
  Heart,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCategories } from "@/hooks/useCategories";
import CartDrawer from "@/components/CartDrawer";
import MobileDrawer from "@/components/MobileDrawer";
import logo from "@/assets/logo.webp";
import { slugify } from "@/utils/helper";
import { useWishlist } from "@/hooks/useWishlist";
import FeedbackSettings from "./FeedbackSettings";

interface CategoryItem {
  _id: string;
  categoryname: string;
  subCategories: string[];
}

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const { categories = [] } = useCategories() as { categories: CategoryItem[] };
  const { cartItems = [] } = useCart();
  const { wishlistItems } = useWishlist();
  const cartCount = cartItems.length;
  const wishlistCount = wishlistItems.length;

  const toggleMobileMenu = () => setMobileOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-xl transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16 md:h-20">
          <div className="flex items-center justify-start">
            <div className="flex md:hidden items-center">
              <button
                className="text-white hover:text-accent focus:outline-none p-1.5"
                onClick={toggleMobileMenu}
                aria-label="Toggle Menu"
              >
                {mobileOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="hidden md:block">
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="Bambotia"
                  loading="eager"
                  decoding="async"
                  width={140}
                  height={56}
                  className="h-[3em] sm:h-[3.5em] w-auto transition-all duration-300 hover:scale-102 object-contain"
                />
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="block md:hidden">
              <Link to="/" onClick={closeMobileMenu}>
                <img
                  src={logo}
                  alt="Bambotia"
                  loading="eager"
                  decoding="async"
                  width={112}
                  height={45}
                  className="h-[3.5em] sm:h-[2.8em] w-auto object-contain"
                />
              </Link>
            </div>

            <div className="hidden md:flex items-center justify-center gap-4 lg:gap-8 xl:gap-12 max-w-full">
              {categories && categories.length > 0 ? (
                categories.map((cat) => {
                  const hasSubs = cat.subCategories?.length > 0;
                  const categorySlug = slugify(cat.categoryname);
                  return (
                    <div key={cat._id} className="relative group py-2">
                      <div className="flex items-center gap-1 xl:gap-1.5 cursor-pointer">
                        <Link
                          to={`/category/${categorySlug}`}
                          className="text-[11px] lg:text-xs xl:text-sm font-semibold tracking-[0.15em] lg:tracking-[0.2em] xl:tracking-[0.25em] text-white hover:text-accent transition-colors duration-300 uppercase whitespace-nowrap"
                        >
                          {cat.categoryname}
                        </Link>
                        {hasSubs && (
                          <ChevronDown className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-white/60 transition-transform duration-300 group-hover:rotate-180 group-hover:text-accent" />
                        )}
                      </div>

                      {hasSubs && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 w-52 bg-[#060b07] border border-white/10 shadow-2xl rounded-md overflow-hidden z-50 transition-all duration-300 ease-in-out transform translate-y-2 group-hover:translate-y-0">
                          <div className="py-1">
                            {cat.subCategories.map(
                              (sub: string, idx: number) => (
                                <Link
                                  key={idx}
                                  to={`/category/${categorySlug}/${slugify(sub)}`}
                                  className="block px-4 py-2.5 text-[11px] font-medium tracking-[0.12em] text-white/80 hover:bg-white/5 hover:text-accent transition-colors duration-200 uppercase"
                                >
                                  {sub}
                                </Link>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <span className="text-xs text-white/40 tracking-[0.1em]">
                  Loading...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-1 sm:gap-1.5  text-white">
            <button
              className="hover:text-accent transition-colors duration-200 p-1"
              onClick={() => navigate("/search")}
              aria-label="Search products"
            >
              <Search className="w-7 h-7 sm:w-6 sm:h-6" />
            </button>

            <FeedbackSettings />

            <button
              className="hidden md:block relative hover:text-accent transition-colors p-1"
              onClick={() => navigate("/wishlist")}
              aria-label={`View wishlist with ${wishlistCount} items`}
            >
              <Heart className="w-7 h-7 sm:w-6 sm:h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              className="relative hover:text-accent transition-colors p-1"
              onClick={() => setCartOpen(true)}
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <ShoppingBag className="w-7 h-7 sm:w-6 sm:h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5  w-5 h-5  sm:w-4 sm:h-4 rounded-full bg-accent text-accent-foreground text-[13px] sm:text-[10px]  font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              className="hidden lg:block relative hover:text-accent transition-colors p-1"
              onClick={() => navigate("/myprofile")}
              aria-label="Go to my profile"
            >
              <User className="w-7 h-7 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <MobileDrawer
        open={mobileOpen}
        onClose={closeMobileMenu}
        categories={categories}
      />
    </nav>
  );
};

export default Navbar;
