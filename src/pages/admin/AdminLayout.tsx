import { useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import logo from "@/assets/logo.webp";
import { logout } from "@/store/authSlice";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Home,
  ShoppingBag,
  Users,
  FolderTree,
  Settings,
  ChevronLeft,
  ChevronRight,
  Inbox,
  FileImage,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrder } from "@/hooks/useOrder";
import { useContact } from "@/hooks/useContact";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, end: false },
  { to: "/admin/customers", label: "Customers", icon: Users, end: false },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, end: false },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/contacts", label: "Contact", icon: Inbox, end: false },
  { to: "/admin/media", label: "Media", icon: FileImage , end: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
  { to: "/", label: "View Front Store", icon: Home, end: false },
];

const AdminLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!token && user?.role === "admin";

  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  const { stats: orderStats, refetchDashboard } = useOrder({
    isAllRecord: true,
  });

  const { stats: contactStats, refetch } = useContact({
    isAllRecord: true,
  });

  const pendingOrdersCount = orderStats?.pending ;
  const pendingContactsCount = contactStats?.pending;

  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/signin", { replace: true });
  };

  return (
    <div className="h-screen bg-background flex w-full overflow-hidden">
      <aside
        className={`${collapsed ? "w-20" : "w-64"} border-r border-border bg-card hidden md:flex flex-col transition-[width] duration-300`}
      >
        <div className="p-4 border-b border-border h-[81px] flex items-center justify-between overflow-hidden">
          <div className="flex items-center justify-between w-full gap-2">
            <div
              className={`transition-all duration-200 overflow-hidden shrink-0 ${collapsed ? "w-0 opacity-0" : "w-36 opacity-100"}`}
            >
              <img
                src={logo}
                alt="Bambotia"
                className="h-12 w-auto object-contain"
              />
            </div>
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="w-8 h-8 shrink-0 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-accent transition-colors cursor-pointer ml-auto"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-premium">
          {navItems.map((item) => {
            const isOrdersRoute = item.to === "/admin/orders";
            const isContactsRoute = item.to === "/admin/contacts";
            
            const dynamicBadgeCount = isOrdersRoute 
              ? pendingOrdersCount 
              : isContactsRoute 
              ? pendingContactsCount 
              : 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center relative ${collapsed ? "justify-center px-0" : "gap-3 px-3"} py-2.5 rounded-md text-sm transition-colors ${isActive ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground hover:bg-muted/50"}`
                }
              >
                <div className="relative flex items-center justify-center">
                  <item.icon className="w-4 h-4 shrink-0" />
                  
                  {collapsed && dynamicBadgeCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-accent text-accent-foreground text-[8px] font-bold rounded-full flex items-center justify-center border border-card animate-pulse">
                      {dynamicBadgeCount > 9 ? "9+" : dynamicBadgeCount}
                    </span>
                  )}
                </div>

                {!collapsed && <span className="flex-1 truncate">{item.label}</span>}

                {!collapsed && dynamicBadgeCount > 0 && (
                  <span className="text-[10px] font-semibold rounded-full bg-accent text-accent-foreground px-2 py-0.5 font-mono shrink-0">
                    {dynamicBadgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
          <img src={logo} alt="Bambotia" className="h-10 w-auto object-contain" />
          <div className="bg-accent/10 px-3 py-1 rounded-full text-xs font-semibold text-accent border border-accent/20">
            {user?.firstname} {user?.lastname}
          </div>
        </header>

        <header className="hidden md:flex sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md px-8 py-3 items-center justify-between shrink-0 h-[81px]">
          <div className="text-xs text-muted-foreground tracking-[0.2em] font-medium">
            BAMBOTIA · ADMIN
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-1.5 py-1.5 rounded-full border border-border hover:border-accent transition-colors cursor-pointer bg-card">
                <span className="px-3 h-8 rounded-full bg-accent/15 text-accent flex items-center text-sm font-semibold">
                  {user?.firstname} {user?.lastname}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-1 rounded-xl">
              <DropdownMenuItem onClick={() => navigate("/")} className="cursor-pointer rounded-lg">
                <Home className="w-4 h-4 mr-2" /> View Storefront
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-lg font-medium">
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <nav className="md:hidden border-b border-border bg-card flex overflow-x-auto scrollbar-hide shrink-0">
          {navItems.map((item) => {
            const isOrdersRoute = item.to === "/admin/orders";
            const isContactsRoute = item.to === "/admin/contacts";
            const dynamicBadgeCount = isOrdersRoute ? pendingOrdersCount : isContactsRoute ? pendingContactsCount : 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-xs tracking-wider font-medium whitespace-nowrap ${isActive ? "text-accent border-b-2 border-accent bg-accent/5" : "text-muted-foreground"}`
                }
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {dynamicBadgeCount > 0 && (
                  <span className="text-[9px] font-bold rounded-full bg-accent text-accent-foreground px-1.5 py-0.2">
                    {dynamicBadgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-premium p-6 md:p-10 bg-muted/10">
          <Outlet context={{ refetchDashboard, refetch }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;