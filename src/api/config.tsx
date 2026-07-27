export const baseUrl = import.meta.env.VITE_PRODUCTION_BASE_URL || import.meta.env.VITE_BASE_URL ;
export const endpoints = {
  authRoutes: {
    register: "auth/register",
    login: "auth/login",
    google: "auth/google",
    deleteUser: "auth/delete-user",
  },
  categoryRoutes: {
    getAll: "categories/allcategories",
    create: "categories/createcategories",
    update: (id: string | number) => `categories/updatecategory/${id}`,
    delete: (id: string | number) => `categories/deletecategory/${id}`,
    addSubCategory: (id: string | number) => `categories/subcategory/add/${id}`,
    updateSubCategory: (id: string | number) => `categories/subcategory/update/${id}`,
    removeSubCategory: (id: string | number) => `categories/subcategory/remove/${id}`,
  },
  cartRoutes: {
    base: "cart",
    removeProduct: (productId: string | number) => `cart/${productId}`,
  },
  contactRoutes: {
    submit: "contacts/submit",
    dashboardQueries: "contacts/dashboard",
    updateStatus: (id: string | number) => `contacts/${id}/status`,
    delete: (id: string | number) => `contacts/${id}`,
  },
  customerRoutes: {
    dashboardCustomers: "customers/dashboard",
  },
  dashboardRoutes: {
    overview: "dashboard/overview",
  },

  mediaRoutes: {
    createupload: "media/upload",
    getupload: "media",
    deleteupload: (id: string | number) => `media/${id}`, 
  },

  orderRoutes: {
    create: "orders/create",
    myOrders: "orders/myorders",
    dashboardOrders: "orders/dashboard",
    getById: (id: string | number) => `orders/${id}`,
    updateStatus: (id: string | number) => `orders/${id}/status`,
    delete: "orders/delete",
  },
  productRoutes: {
    getAll: "products/allproducts",
    create: "products/createproduct",
    getById: (id: string | number) => `products/product/${id}`,
    update: (id: string | number) => `products/updateproduct/${id}`,
    delete: (id: string | number) => `products/deleteproduct/${id}`,
    patch: "products/toggle-publish",
  },
  reviewRoutes: {
    create: (productId: string | number) => `reviews/${productId}`,
    getByProduct: (productId: string | number) => `reviews/${productId}`,
    deleteByUser: (reviewId: string | number) => `/reviews/delete/${reviewId}`,
    deleteByAdmin: (reviewId: string | number) => `/reviews/admin/delete/${reviewId}`,
  },
  searchRoutes: {
    catalog: "search/catalog",
  },
  wishlistRoutes: {
    base: "wishlist",
  },
};
