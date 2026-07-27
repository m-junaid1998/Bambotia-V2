import { FC, useMemo, useState, memo, ChangeEvent, FormEvent } from "react";
import { Star, X, Loader2, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReview } from "@/hooks/useReview";
import { toast } from "sonner";
import { createFormData } from "@/lib/utils";
import AuthBox from "./AuthBox";
import type { Review } from "@/types";
import type { AuthUser } from "@/store/authSlice";

interface ProductReviewsProps {
  productId: string;
}

const STAR_ARRAY = [1, 2, 3, 4, 5];

const Stars = memo(({ value, size = 14 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {STAR_ARRAY.map((n) => (
      <Star
        key={n}
        style={{ width: size, height: size }}
        className={
          n <= value ? "fill-accent text-accent" : "text-muted-foreground/40"
        }
      />
    ))}
  </div>
));
Stars.displayName = "Stars";

const RatingInput = memo(
  ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
    <div className="flex items-center gap-1">
      {STAR_ARRAY.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 focus:outline-none transition-transform active:scale-95"
        >
          <Star
            className={`w-6 h-6 transition-colors ${value >= n ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  ),
);
RatingInput.displayName = "RatingInput";

const getInitials = (name: string) => {
  if (!name) return "AN";
  const parts = name.split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

interface ReviewFormProps {
  currentUser: AuthUser | null;
  productId: string;
  isSubmitLoading: boolean;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; data?: unknown }>;
  onSuccess: () => void;
}

const ReviewForm: FC<ReviewFormProps> = ({
  currentUser,
  productId,
  isSubmitLoading,
  onSubmit,
  onSuccess,
}) => {
  const [review, setReview] = useState({
    name: currentUser?.name || "",
    rating: 5,
    title: "",
    comment: "",
    photos: [] as { file: File; preview: string }[],
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (review.photos.length + files.length > 4) {
      return toast.error("You can only upload up to 4 photos.");
    }

    const newPhotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setReview((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
  };

  const removePhoto = (indexToRemove: number) => {
    setReview((prev) => {
      URL.revokeObjectURL(prev.photos[indexToRemove].preview);
      return {
        ...prev,
        photos: prev.photos.filter((_, i) => i !== indexToRemove),
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const displayName = review.name.trim() || currentUser?.name || "";

    if (!displayName || !review.comment.trim()) {
      return toast.error("Please fill all the required fields.");
    }

    const formData = createFormData({
      product: productId,
      user: currentUser?._id || currentUser?.id,
      name: displayName,
      rating: review.rating,
      title: review.title.trim(),
      comment: review.comment.trim(),
      photos: review.photos.map((p) => p.file),
    });

    const res = await onSubmit(formData);
    if (res?.success) {
      review.photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setReview({
        name: currentUser?.name || "",
        rating: 5,
        title: "",
        comment: "",
        photos: [],
      });
      onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border/80 rounded-2xl p-6 mb-10 bg-card/40 backdrop-blur-md space-y-4 shadow-sm"
    >
      <h3 className="font-heading text-lg font-semibold text-foreground">
        Share your experience
      </h3>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          YOUR RATING *
        </label>
        <RatingInput
          value={review.rating}
          onChange={(n) => setReview((prev) => ({ ...prev, rating: n }))}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            NAME *
          </label>
          <Input
            name="name"
            value={review.name}
            onChange={handleInputChange}
            placeholder="Your name"
            required
            className="rounded-xl bg-background border-border focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            REVIEW TITLE (OPTIONAL)
          </label>
          <Input
            name="title"
            value={review.title}
            onChange={handleInputChange}
            placeholder="Sum it up in a few words"
            className="rounded-xl bg-background border-border focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          YOUR REVIEW *
        </label>
        <Textarea
          name="comment"
          value={review.comment}
          onChange={handleInputChange}
          placeholder="Tell us what you loved about the product..."
          rows={4}
          required
          className="rounded-xl bg-background border-border focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          ADD PHOTOS (UP TO 4)
        </label>
        <div className="flex flex-wrap gap-3 items-center">
          {review.photos.map((photo, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-xl border border-border overflow-hidden bg-muted"
            >
              <img
                src={photo.preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-white text-foreground p-0.5 rounded-full transition-colors shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {review.photos.length < 4 ? (
            <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-border rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 hover:border-accent transition-colors text-muted-foreground">
              <Camera className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium text-center">
                Upload
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Limit reached
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitLoading}
          className="rounded-full px-8 bg-accent text-accent-foreground hover:opacity-90 transition-all"
        >
          {isSubmitLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Submit review"
          )}
        </Button>
      </div>
    </form>
  );
};

const ReviewItem = memo(
  ({
    review: r,
    currentUser,
    onDelete,
    onOpenLightbox,
  }: {
    review: Review;
    currentUser: AuthUser | null;
    onDelete: (id: string) => void;
    onOpenLightbox: (src: string) => void;
  }) => {
    const currentUserIdStr =
      currentUser?.id || currentUser?._id
        ? String(currentUser?.id || currentUser?._id).trim()
        : "";

    let reviewUserIdStr = "";
    if (r.user) {
      reviewUserIdStr =
        typeof r.user === "object"
          ? String(r.user._id || r.user.id || "")
          : String(r.user);
    }

    const isAdmin = currentUser?.role === "admin";
    const isOwner =
      currentUserIdStr !== "" && currentUserIdStr === reviewUserIdStr.trim();
    const canDelete = isAdmin || isOwner;

    return (
      <div className="p-5 sm:p-6 bg-card/40 rounded-2xl border border-border/50 flex flex-col gap-3 shadow-2xs relative">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10 border border-border/40">
            <AvatarFallback className="bg-accent/10 text-accent text-sm font-medium">
              {getInitials(r.name || "Anonymous")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <p className="text-sm font-semibold text-foreground capitalize">
                {r.name}
              </p>
              <span className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <Stars value={r.rating} />
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(r._id)}
                  className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors block cursor-pointer"
                  title="Delete review"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {r.title && (
              <h4 className="text-sm font-bold text-foreground mt-2">
                {r.title}
              </h4>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed mt-1 whitespace-pre-line">
              {r.comment}
            </p>

            {r.photos && r.photos.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mt-4">
                {r.photos.map((src: string, i: number) => (
                  <div
                    key={i}
                    onClick={() => onOpenLightbox(src)}
                    className="w-20 h-20 rounded-xl overflow-hidden border border-border bg-muted/40 cursor-pointer hover:border-accent transition-colors"
                  >
                    <img
                      src={src}
                      alt="Review attachment"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ReviewItem.displayName = "ReviewItem";

const ProductReviews: FC<ProductReviewsProps> = ({ productId }) => {
  const {
    reviews,
    isFetching,
    isReviewSubmitLoading,
    createReview,
    deleteReviewAsync,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useReview(productId);

  const [uiState, setUiState] = useState({
    showForm: false,
    lightbox: null as string | null,
  });

  const totalReviews = reviews?.length || 0;

  const avg = useMemo(() => {
    if (!totalReviews) return 0;
    return (
      reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / totalReviews
    );
  }, [reviews, totalReviews]);

  const distribution = useMemo(() => {
    const matrix = [0, 0, 0, 0, 0];
    reviews?.forEach((r: Review) => {
      if (r.rating >= 1 && r.rating <= 5) matrix[5 - r.rating] += 1;
    });
    return matrix;
  }, [reviews]);

  const handleOpenLightbox = (src: string) =>
    setUiState((prev) => ({ ...prev, lightbox: src }));
  const handleFormSuccess = () =>
    setUiState((prev) => ({ ...prev, showForm: false }));

  return (
    <section className="mt-16 border-t border-border pt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-serif text-foreground mb-2 tracking-wide">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-3">
            <Stars value={Math.round(avg)} size={16} />
            <span className="text-sm text-foreground font-medium">
              {avg.toFixed(1)} out of 5
            </span>
            <span className="text-sm text-muted-foreground">
              ({totalReviews} reviews)
            </span>
          </div>
        </div>

        <Button
          onClick={() => {
            if (!currentUser) {
              setTimeout(() => setIsAuthModalOpen(true), 800);
              return toast.error("You must be logged in to write a review.");
            }
            setUiState((prev) => ({ ...prev, showForm: !prev.showForm }));
          }}
          variant={uiState.showForm ? "outline" : "default"}
          className="rounded-full px-6 bg-accent text-accent-foreground hover:opacity-90 transition-all"
        >
          {uiState.showForm ? "Cancel" : "Write a review"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-2 bg-card/20 backdrop-blur-md p-6 rounded-2xl border border-border/60">
          {distribution.map((count, i) => {
            const stars = 5 - i;
            const pct = totalReviews ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-muted-foreground">{stars} star</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {uiState.showForm && currentUser && (
        <ReviewForm
          currentUser={currentUser}
          productId={productId}
          isSubmitLoading={isReviewSubmitLoading}
          onSubmit={createReview}
          onSuccess={handleFormSuccess}
        />
      )}

      <div className="space-y-4 max-h-[650px] overflow-y-auto scrollbar-premium pr-2">
        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : totalReviews === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            No reviews yet for this product.
          </p>
        ) : (
          reviews.map((r: Review) => (
            <ReviewItem
              key={r._id}
              review={r}
              currentUser={currentUser}
              onDelete={deleteReviewAsync}
              onOpenLightbox={handleOpenLightbox}
            />
          ))
        )}
      </div>

      <Dialog
        open={!!uiState.lightbox}
        onOpenChange={(o) =>
          !o && setUiState((prev) => ({ ...prev, lightbox: null }))
        }
      >
        <DialogContent
          className="w-[85vw] max-w-fit p-0 bg-transparent border-none shadow-none 
        [&>button]:bg-red-600 [&>button]:text-white [&>button]:rounded-full [&>button]:h-5 [&>button]:w-5 sm:[&>button]:h-7 sm:[&>button]:w-7
          [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:right-[6px] [&>button]:top-[6px] 
          [&>button]:border-none [&>button]:outline-none [&>button]:ring-0 
          [&>button]:focus:outline-none [&>button]:focus:ring-0 
          [&>button]:focus-visible:outline-none [&>button]:focus-visible:ring-0 [&>button]:focus-visible:ring-offset-0"
        >
          {uiState.lightbox && (
            <div className="relative flex items-center justify-center max-h-[75vh] sm:max-h-[85vh] overflow-hidden rounded-xl border border-border/40 bg-background/95 backdrop-blur-md shadow-2xl">
              <img
                src={uiState.lightbox}
                alt="Enlarged review"
                className="w-full h-auto max-h-[75vh] sm:max-h-[85vh] object-contain select-none"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuthBox isOpen={isAuthModalOpen} setIsOpen={setIsAuthModalOpen} />
    </section>
  );
};

export default ProductReviews;
