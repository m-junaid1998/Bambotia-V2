import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { X, ChevronDown, Home, Store, LayoutGrid, Mail, Plus, Minus } from "lucide-react";
import { slugify } from "@/utils/helper";
import logo from "@/assets/logo.webp";


interface BackendCategory {
  _id: string;
  categoryname: string;
  subCategories: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  categories: BackendCategory[];
}

interface CategoryTreeProps {
  categories: BackendCategory[];
  onNavigate: () => void;
  level?: number;
}

const CategoryTree = ({ categories, onNavigate, level = 0 }: CategoryTreeProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const toggleAndNavigate = (key: string, path: string) => {
    setOpenMap((m) => ({ ...m, [key]: !m[key] }));
    navigate(path);
  };

  return (
    <ul className={level === 0 ? "space-y-1" : "mt-1 ml-2 border-l border-white/10 pl-3 space-y-1"}>
      {categories.map((cat) => {
        const hasChildren = !!cat.subCategories?.length;
        const isOpen = !!openMap[cat._id];
        const categorySlug = slugify(cat.categoryname);
        const currentPath = `/category/${categorySlug}`;
        const isActive = decodeURIComponent(pathname) === currentPath;

        return (
          <li key={cat._id} className="overflow-hidden">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleAndNavigate(cat._id, currentPath)}
                aria-expanded={isOpen}
                className={`group w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium tracking-wide transition-all duration-200 border-l-2 cursor-pointer ${
                  isOpen || isActive
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-transparent text-foreground hover:bg-white/10 hover:text-accent hover:border-accent"
                }`}
              >
                <span className="capitalize">{cat.categoryname}</span>
                <span className="relative w-4 h-4 flex items-center justify-center text-accent">
                  <Plus
                    className={`absolute w-4 h-4 transition-all duration-300 ${
                      isOpen ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
                    }`}
                  />
                  <Minus
                    className={`absolute w-4 h-4 transition-all duration-300 ${
                      isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
                    }`}
                  />
                </span>
              </button>
            ) : (
              <Link
                to={currentPath}
                onClick={onNavigate}
                className={`block rounded-lg px-3 py-2.5 text-sm transition-all duration-200 border-l-2 transform capitalize ${
                  isActive
                    ? "border-accent bg-accent/15 text-accent font-semibold translate-x-1"
                    : "border-transparent text-muted-foreground hover:bg-white/10 hover:text-accent hover:border-accent hover:translate-x-1"
                }`}
              >
                {cat.categoryname}
              </Link>
            )}

            {hasChildren && isOpen && (
              <ul className="mt-1 ml-2 border-l border-white/10 pl-3 space-y-1">
                {cat.subCategories.map((subName, idx) => {
                  const subPath = `${currentPath}/${slugify(subName)}`;
                  const isSubActive = decodeURIComponent(pathname) === subPath;

                  return (
                    <li key={idx}>
                      <Link
                        to={subPath}
                        onClick={onNavigate}
                       
                        className={`block rounded-lg px-4 py-2 text-xs font-medium transition-all duration-200 border-l-2 transform capitalize select-none ${
                          isSubActive
                            ? "border-accent bg-accent/15 text-accent font-semibold translate-x-1"
                            : "border-transparent text-muted-foreground/80 hover:bg-white/10 hover:text-accent hover:border-accent hover:translate-x-1"
                        }`}
                      >
                        {subName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const MobileDrawer = ({ open, onClose, categories = [] }: Props) => {
  const [catOpen, setCatOpen] = useState(true);
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const linkCls = (to: string) =>
    `flex items-center gap-3 py-3 px-3 rounded-lg text-base tracking-wide transition-all duration-200 border-b border-border/10 ${
      pathname === to 
        ? "text-accent bg-accent/10 font-semibold" 
        : "text-foreground hover:bg-white/5 hover:text-accent"
    }`;

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-background/90  backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-[101] h-screen w-[85%] max-w-sm bg-[#060b07] border-r border-white/5 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Main menu"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 h-16 flex-shrink-0">
          <button onClick={onClose} aria-label="Close menu" className="text-foreground hover:text-accent p-1 transition-colors">
            <X className="w-6 h-6" />
          </button>
          <Link to="/" onClick={onClose} className="flex-shrink-0">
            <img
              src={logo}
              alt="Bambotia"
              className="h-[3.3em] sm:h-[2.8em] w-auto object-contain"
            />
          </Link>
          <div className="w-8" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link to="/" onClick={onClose} className={linkCls("/")}>
            <Home className="w-4 h-4 text-accent" /> Home
          </Link>
          <Link to="/category/jewellery" onClick={onClose} className={linkCls("/category/jewellery")}>
            <Store className="w-4 h-4 text-accent" /> Shop
          </Link>

          <div className="rounded-lg overflow-hidden">
            <button
              onClick={() => setCatOpen((v) => !v)}
              className="w-full flex items-center justify-between py-3 px-3 text-base text-foreground hover:bg-white/5 hover:text-accent transition-all duration-200"
              aria-expanded={catOpen}
            >
              <span className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4 text-accent" /> Categories
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 text-white/60 ${catOpen ? "rotate-180 text-accent" : ""}`} />
            </button>
            
            <div
              className={`transition-all duration-300 ease-in-out ${catOpen ? "max-h-[2000px] opacity-100 mt-1" : "max-h-0 opacity-0 overflow-hidden"}`}
            >
              <div className="pb-2 px-1">
                {categories.length > 0 ? (
                  <CategoryTree categories={categories} onNavigate={onClose} />
                ) : (
                  <p className="text-xs text-muted-foreground pl-9 py-2">No categories available</p>
                )}
              </div>
            </div>
          </div>

          <Link to="/contact" onClick={onClose} className={linkCls("/contact")}>
            <Mail className="w-4 h-4 text-accent" /> Contact Us
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default MobileDrawer;
