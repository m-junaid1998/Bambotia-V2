import { lazy } from "react";

const Index = lazy(() => import("../pages/Index.tsx"));
const CategoryPage = lazy(() => import("../pages/CategoryPage.tsx"));
const ProductDetail = lazy(() => import("../pages/ProductDetail.tsx"));
const WishlistPage = lazy(() => import("../pages/WishlistPage.tsx"));
const SearchPage = lazy(() => import("../pages/SearchPage.tsx"));
const OurStory = lazy(() => import("../pages/OurStory.tsx"));
const Contact = lazy(() => import("../pages/Contact.tsx"));
const ShippingReturns = lazy(() => import("../pages/ShippingReturns.tsx"));
const FAQs = lazy(() => import("../pages/FAQs.tsx"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("../pages/TermsOfService.tsx"));
const Checkout = lazy(() => import("../pages/Checkout.tsx"));
const MyOrders = lazy(() => import("../pages/MyOrders.tsx"));
const OrderConfirmation = lazy(() => import("../pages/OrderConfirmation.tsx"));
const SignIn = lazy(() => import("../pages/SignIn.tsx"));
const SignUp = lazy(() => import("../pages/SignUp.tsx"));
const MyProfile = lazy(() => import("../components/MyProfile.tsx"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard.tsx"));
const AdminProducts = lazy(() => import("../pages/admin/AdminProducts.tsx"));
const AdminOrders = lazy(() => import("../pages/admin/AdminOrders.tsx"));
const AdminCustomers = lazy(() => import("../pages/admin/AdminCustomers.tsx"));
const AdminCategories = lazy(() => import("../pages/admin/AdminCategories.tsx"));
const AdminContacts = lazy(() => import("../pages/admin/AdminContacts.tsx"));
const AdminSettings = lazy(() => import("../pages/admin/AdminSettings.tsx"));
const AdminMedia = lazy(() => import("../pages/admin/AdminMedia.tsx"));

export const publicRoutes = [
  { path: "/", element: <Index /> },
  { path: "myprofile", element: <MyProfile /> },
  { path: "category/:category/:subCategory?", element: <CategoryPage /> },
  { path: "product/:slug/:id", element: <ProductDetail /> },
  { path: "wishlist", element: <WishlistPage /> },
  { path: "search", element: <SearchPage /> },
  { path: "our-story", element: <OurStory /> },
  { path: "contact", element: <Contact /> },
  { path: "shipping-returns", element: <ShippingReturns /> },
  { path: "faqs", element: <FAQs /> },
  { path: "privacy-policy", element: <PrivacyPolicy /> },
  { path: "terms-of-service", element: <TermsOfService /> },
  { path: "checkout", element: <Checkout /> },
  { path: "order-confirmation", element: <OrderConfirmation /> },
  { path: "myorders", element: <MyOrders /> },
  { path: "signin", element: <SignIn /> },
  { path: "admin/login", element: <SignIn /> },
  { path: "signup", element: <SignUp /> },
];

export const adminRoutes = [
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "orders", element: <AdminOrders /> },
  { path: "customers", element: <AdminCustomers /> },
  { path: "products", element: <AdminProducts /> },
  { path: "categories", element: <AdminCategories /> },
  { path: "contacts", element: <AdminContacts /> },
  { path: "settings", element: <AdminSettings /> },
  { path: "media", element: <AdminMedia /> },
];
