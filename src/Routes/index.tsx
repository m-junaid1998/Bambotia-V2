import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { publicRoutes, adminRoutes } from "./routelist";
import { FeedbackProvider } from "@/hooks/useFeedbackContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import DraggableWhatsApp from "@/components/DraggableWhatsApp";
import { Skeleton } from "@/components/ui/skeleton";

const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const NotFound = lazy(() => import("../pages/NotFound"));

const ProtectedRoutes = ({ children }: { children: React.ReactElement }) => {
  const { token, user } = useAppSelector((state) => state.auth);
  return token && user?.role === "admin"
    ? children
    : <Navigate replace to="/signin" />;
};

const PublicLayout = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <DraggableWhatsApp />
    <Footer />
    <BottomNav />
  </div>
);

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Skeleton className="h-12 w-12 rounded-full" />
  </div>
);

export default function MainRouter() {
  return (
    <FeedbackProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route element={<PublicLayout />}>
            {publicRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoutes>
                <AdminLayout />
              </ProtectedRoutes>
            }
          >
            {adminRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </FeedbackProvider>
  );
}
