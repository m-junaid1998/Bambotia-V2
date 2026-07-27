import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { LogOut, Settings, ShoppingBag, User } from "lucide-react";

const MyProfile = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-[#0B1512] text-[#E2E8F0] px-4 pt-16 sm:px-6 flex items-center justify-center">
      <main className="w-full max-w-xl bg-[#0F1E19]/80 backdrop-blur-md border border-[#1F3A30]/40 rounded-2xl p-5 sm:p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
        {isAuthenticated ? (
          <div className=" space-y-3 mb:space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b border-[#1F3A30]/40">
              <div className="w-12 h-12 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] font-heading font-bold text-base uppercase shadow-inner flex-shrink-0">
                {`${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}` || (
                  <User className="w-5 h-5" />
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-heading font-bold text-base text-foreground tracking-wide truncate">
                  {user?.firstname} {user?.lastname}
                </h3>
                <p className="text-xs text-[#C5A880]/80 tracking-wider truncate mt-0.5 font-mono">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm font-medium">
              {user?.role === "admin" && (
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-sm bg-[#132620]/40 border border-[#1F3A30]/20 text-foreground hover:bg-[#1A352C] hover:text-[#C5A880] transition-all duration-300 group text-left"
                >
                  <Settings className="w-4 h-4 text-[#C5A880] transition-transform duration-500 group-hover:rotate-45" />
                  <span className="tracking-wide font-semibold text-sm">
                    Admin Panel
                  </span>
                </button>
              )}
              <button
                onClick={() => navigate("/myorders")}
                className="hidden md:flex w-full items-center gap-3.5 px-4 py-3.5 rounded-sm bg-[#132620]/40 border border-[#1F3A30]/20 text-foreground hover:bg-[#1A352C] hover:text-[#C5A880] transition-all duration-300 group text-left"
              >
                <ShoppingBag className="w-4 h-4 text-[#C5A880] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                <span className="tracking-wide text-sm font-semibold">
                  My Orders
                </span>
              </button>
            </div><div className="md:pt-5 border-t-0 md:border-t md:border-[#1F3A30]/40 flex justify-center w-full">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2.5 px-8 py-2.5 rounded-full bg-red-950/10 border border-red-900/20 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all duration-300 text-sm font-semibold tracking-wide min-w-[150px]"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-5">
            <div className="w-18 h-18 rounded-full bg-[#132620] border border-[#1F3A30]/60 flex items-center justify-center mx-auto text-[#C5A880]">
              <User className="w-12 h-12" />
            </div>
            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="font-heading font-bold text-lg text-foreground tracking-wide">
                Welcome Guest
              </h3>
              <p className="text-[0.9rem] text-muted-foreground leading-relaxed">
                Please sign in to manage your premium collections, curate your
                dynamic wishlist, and view profile settings.
              </p>
            </div>

            <div className="pt-2 max-w-xs mx-auto space-y-4">
              <Link
                to="/signin"
                className="flex w-full items-center justify-center px-4 py-3 rounded-2xl border border-[#C5A880] bg-[#C5A880] text-[#0B1512] text-[0.9rem] font-bold uppercase tracking-widest hover:bg-[#D4BC9C] transition-all shadow-md"
              >
                Sign In
              </Link>
              <div className="text-[0.9rem] text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-[#C5A880] hover:underline font-semibold ml-1"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyProfile;
