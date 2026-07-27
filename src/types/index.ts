/**
 * Shared domain types for entities returned by the backend.
 *
 * These replace the `any`/`(x: any)` annotations that were previously
 * duplicated (slightly differently) in every component that rendered a
 * list of products/orders/reviews/etc. Import from here instead of
 * re-declaring a local shape.
 */

export interface SubCategory {
  _id?: string;
  name?: string;
  categoryname?: string;
}

export interface Category {
  _id: string;
  categoryname: string;
  subCategories?: SubCategory[] | string[];
}

export interface Product {
  _id: string;
  name: string;
  categoryname?: string | Category;
  category?: string;
  subCategory?: string;
  stock?: number;
  regularPrice?: number;
  salePrice?: number;
  description?: string;
  images?: string[];
  isPublished?: boolean;
  isNewArrival?: boolean;
  /** Display-friendly subcategory label returned by the single-product endpoint. */
  subcategoryname?: string;
  /** Computed discount percentage, present on the single-product endpoint. */
  discount?: number;
}

/** Row shape for the admin dashboard's "best sellers" summary — not a full Product. */
export interface BestSellerProduct {
  name: string;
  rank: number;
  unitsSold?: number;
  totalEarnings?: number;
}

export interface CartItem {
  _id?: string;
  product:
    | string
    | {
        _id: string;
        name: string;
        salePrice: number;
        images: string[];
        category?: string;
        subcategory?: string;
        stock?: number;
      };
  qty: number;
}

export interface ReviewUser {
  _id?: string;
  id?: string;
  name?: string;
}

export interface Review {
  _id: string;
  name: string;
  rating: number;
  title?: string;
  comment?: string;
  photos?: string[];
  createdAt: string;
  user?: string | ReviewUser;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  address?: string;
  areaTown?: string;
  city: string;
  orderNotes?: string;
}

export interface OrderItem {
  product?: string;
  productId?: string;
  name: string;
  image: string;
  qty: number;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | string;

export interface Order {
  _id: string;
  orderNumber?: string;
  status: OrderStatus;
  customerInfo?: CustomerInfo;
  orderItems: OrderItem[];
  itemsPrice?: number;
  shippingPrice?: number;
  totalPrice: number;
  paymentMethod?: string;
  createdAt: string;
}

export interface Customer {
  fullName: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
}

export interface ContactQuery {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export interface MediaItem {
  _id: string;
  title: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  public_id?: string;
}
