import React, { useState, useMemo } from "react";
import { Plus, Trash2, Package, Upload, Pencil, X, RefreshCw, Search, ArrowRight, EyeOff, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateDiscount } from "@/utils/helper";
import { toast } from "sonner";

import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { createFormData } from "@/lib/utils";

interface SubCategory {
  _id?: string;
  name?: string;
  categoryname?: string;
}

interface Category {
  _id: string;
  categoryname: string;
  subCategories?: SubCategory[] | string[];
}

interface Product {
  _id: string;
  name: string;
  categoryname: string | Category;
  subCategory?: string;
  stock: number;
  regularPrice: number | string;
  salePrice: number | string;
  description?: string;
  images: string | string[];
  isPublished: boolean;
}

interface ProductForm {
  name: string;
  images: (File | string)[];
  categoryname: string;
  subCategory: string;
  stock: string | number;
  regularPrice: string | number;
  salePrice: string | number;
  description: string;
}

const INITIAL_FORM_STATE = (product?: Product | null): ProductForm => ({
  name: product?.name ?? "",
  categoryname:
    typeof product?.categoryname === "object"
      ? product.categoryname._id
      : product?.categoryname ?? "",
  subCategory: product?.subCategory && product.subCategory !== "" ? product.subCategory : "None",
  stock: product?.stock ?? 0,
  regularPrice: product?.regularPrice ?? "",
  salePrice: product?.salePrice ?? "",
  description: product?.description ?? "",
  images: Array.isArray(product?.images)
    ? product.images
    : product?.images
      ? [product.images]
      : [],
});

const AdminProducts: React.FC = () => {
  const [searchString, setSearchString] = useState<string>("");
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM_STATE());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [uiState, setUiState] = useState({
    isOpen: false,
    editingId: null as string | null,
    isPublished: true,
    isDeleteDialogOpen: false,
    productToDelete: null as { id: string; name: string } | null,
  });

  const {
    products = [],
    isFetchingProducts,
    isMutating: isProductMutating,
    createProduct,
    updateProduct,
    removeProduct,
    togglePublished,
  } = useProducts({ currentPage: 1, pageSize: 20, searchString });

  const { categories = [], isFetchingCategories } = useCategories({ isAllRecord: true });
const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;

  if (value.trim() === "") {
    setTimeout(() => {
      setSearchString("");
    }, 1000);
  }
};

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("searchQuery") as string;
    setSearchString(query.trim());
  };

  const selectedCategoryObj = useMemo<Category | undefined>(() => {
    return categories.find((cat: Category) => String(cat._id) === String(form.categoryname));
  }, [categories, form.categoryname]);

  const allSelected = useMemo<boolean>(() => {
    return products.length > 0 && selectedIds.size === products.length;
  }, [products, selectedIds]);

  const openAdd = () => {
    setForm(INITIAL_FORM_STATE());
    setUiState({
      isOpen: true,
      editingId: null,
      isPublished: true,
      isDeleteDialogOpen: false,
      productToDelete: null,
    });
  };

  const openEdit = (product: Product) => {
    setForm(INITIAL_FORM_STATE(product));
    setUiState({
      isOpen: true,
      editingId: product._id,
      isPublished: product.isPublished ?? true,
      isDeleteDialogOpen: false,
      productToDelete: null,
    });
  };

  const handleCategoryChange = (value: string) => {
    setForm((prev) => ({ ...prev, categoryname: value, subCategory: "None" }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (form.images.length + files.length > 5) {
      toast.error("You can only upload up to 5 images.");
      return;
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.images.length === 0) return toast.error("Please upload at least one image.");
    if (!form.categoryname || form.categoryname.length !== 24) return toast.error("Invalid category selection token.");

    const payload = createFormData({
      ...form,
      name: form.name.trim(),
      subCategory: form.subCategory === "None" ? "" : form.subCategory,
      description: form.description.trim(),
      isPublished: uiState.isPublished,
    });

    const result = uiState.editingId 
      ? await updateProduct(uiState.editingId, payload) 
      : await createProduct(payload);

    if (result?.success) {
      setUiState((prev) => ({ ...prev, isOpen: false }));
      setSelectedIds(new Set());
    }
  };

  const handleSingleTogglePublished = async (id: string, currentStatus: boolean) => {
    await togglePublished([id], currentStatus);
  };

  const handleDeleteTrigger = (id: string, name: string) => {
    setUiState((prev) => ({
      ...prev,
      isDeleteDialogOpen: true,
      productToDelete: { id, name },
    }));
  };

  const handleConfirmDelete = async () => {
    if (uiState.productToDelete) {
      await removeProduct(uiState.productToDelete.id, uiState.productToDelete.name);
      setUiState((prev) => ({ ...prev, isDeleteDialogOpen: false, productToDelete: null }));
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(products.map((p: Product) => p._id)));
  };

  const handleBulkStatusChange = async (status: boolean) => {
    const result = await togglePublished(Array.from(selectedIds), !status);
    if (result?.success) setSelectedIds(new Set());
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-accent mb-2">CATALOG</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your product catalog. <span className="text-accent font-bold"> {products.length} </span> custom product{products.length === 1 ? "" : "s"}.
          </p>
        </div>

        <Dialog open={uiState.isOpen} onOpenChange={(open) => setUiState((prev) => ({ ...prev, isOpen: open }))}>
          <Button onClick={openAdd} disabled={isProductMutating} className="tracking-[0.2em] text-xs h-11">
            {isProductMutating && !uiState.editingId ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-1.5" /> ADDING PRODUCT...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" /> ADD PRODUCT
              </>
            )}
          </Button>

          <DialogContent className="max-w-lg max-h-[90vh] scrollbar-premium overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {uiState.editingId ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-xs tracking-[0.2em]">PRODUCT IMAGES (MAX 5) *</Label>
                
                {form.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {form.images.map((img, index) => {
                      const previewUrl = img instanceof File ? URL.createObjectURL(img) : img;
                      return (
                        <div key={index} className="relative aspect-square rounded-md border bg-muted/30 overflow-hidden group">
                          <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {form.images.length < 5 ? (
                  <label className="cursor-pointer block">
                    <div className="flex flex-col items-center justify-center gap-2 py-6 w-full border border-dashed border-border rounded-md text-xs tracking-[0.2em] text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-colors">
                      <Upload className="w-5 h-5" />
                      <span>UPLOAD IMAGES ({form.images.length}/5)</span>
                    </div>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                ) : (
                  <p className="text-[10px] text-center tracking-[0.1em] text-muted-foreground italic">
                    Maximum limit reached (5 images uploaded)
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs tracking-[0.2em]">PRODUCT NAME *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Luxury Handbag"
                  className="h-11"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.2em]">CATEGORY *</Label>
                  <Select value={form.categoryname} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={isFetchingCategories ? "Loading..." : "Select Category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: Category) => (
                        <SelectItem key={cat._id} value={String(cat._id)}>
                          {cat.categoryname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs tracking-[0.2em]">SUB-CATEGORY</Label>
                  <Select
                    value={form.subCategory || "None"}
                    onValueChange={(value) => setForm({ ...form, subCategory: value })}
                    disabled={!form.categoryname || !selectedCategoryObj?.subCategories?.length}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue
                        placeholder={
                          !form.categoryname
                            ? "Select Category First"
                            : !selectedCategoryObj?.subCategories?.length
                              ? "No Sub Categories"
                              : "Select Sub Category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      {selectedCategoryObj?.subCategories?.map((sub: SubCategory | string, index: number) => {
                        const subName = typeof sub === "object" ? sub.categoryname || sub.name : sub;
                        return (
                          <SelectItem key={index} value={String(subName)}>
                            {subName}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs tracking-[0.2em]">STOCK</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="0"
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs tracking-[0.2em]">REGULAR PRICE</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.regularPrice}
                    onChange={(e) => setForm({ ...form, regularPrice: e.target.value })}
                    placeholder="15000"
                    className="h-10"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs tracking-[0.2em]">SALE PRICE *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.salePrice}
                    onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                    placeholder="12500"
                    className="h-10"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs tracking-[0.2em]">DISCOUNT</Label>
                  <div className="h-10 flex items-center text-red-500 font-semibold border rounded-md px-3 text-xs bg-muted/10">
                    {calculateDiscount(Number(form.regularPrice), Number(form.salePrice))}%
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs tracking-[0.2em]">DESCRIPTION</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short product description..."
                  className="resize-none h-24 scrollbar-premium overflow-y-auto"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                <div className="space-y-0.5">
                  <Label className="text-xs tracking-[0.2em] flex items-center gap-2">
                    {uiState.isPublished ? "PUBLISHED" : "DRAFT"}
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    {uiState.isPublished ? "Visible on the storefront" : "Hidden from customers"}
                  </p>
                </div>
                <Switch 
                  checked={uiState.isPublished} 
                  onCheckedChange={(val) => setUiState((prev) => ({ ...prev, isPublished: val }))} 
                />
              </div>

              <Button type="submit" disabled={isProductMutating} className="w-full h-11 tracking-[0.2em] text-xs">
                {isProductMutating ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>SAVING CHANGES...</span>
                  </div>
                ) : uiState.editingId ? (
                  "SAVE CHANGES"
                ) : (
                  "ADD PRODUCT"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <form onSubmit={handleSearchSubmit} className="mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            name="searchQuery"
            placeholder="Search for inventory products..."
            className="h-14 pl-12 text-base bg-card placeholder:text-xs sm:placeholder:text-sm"
            defaultValue={searchString}
            onChange={handleSearchChange}
          />
        </div>
        <Button type="submit" className="h-14 px-6" disabled={isFetchingProducts}>
          {isFetchingProducts ? "SEARCHING..." : "SEARCH"}
        </Button>
      </form>

      {products.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-lg overflow-hidden">
          <div className="px-6 sm:px-12 py-14 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Package className="w-7 h-7 text-accent" />
            </div>
            <p className="text-[10px] tracking-[0.4em] text-accent mb-3">GET STARTED</p>
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-3">Your catalog is empty</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              Add your first product to start building the storefront.
            </p>
            <Button onClick={openAdd} disabled={isProductMutating} className="tracking-[0.2em] text-xs h-11 px-6">
              <Plus className="w-4 h-4 mr-1.5" /> ADD YOUR FIRST PRODUCT
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
              <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
                {selectedIds.size > 0 ? `${selectedIds.size} selected` : `Select all (${products.length})`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.size === 0}
                onClick={() => handleBulkStatusChange(true)}
                className="tracking-[0.2em] text-[10px] h-9"
              >
                PUBLISH
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedIds.size === 0}
                onClick={() => handleBulkStatusChange(false)}
                className="tracking-[0.2em] text-[10px] h-9"
              >
                DRAFT
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.map((p: Product) => {
              const displayCategory = typeof p.categoryname === "object" ? p.categoryname?.categoryname : p.categoryname;
              const productImg = Array.isArray(p.images) ? p.images[0] : p.images;

              return (
                <div
                  key={p._id}
                  className={`bg-card border rounded-lg overflow-hidden group relative transition-colors ${
                    selectedIds.has(p._id) ? "border-accent ring-1 ring-accent/40" : "border-border"
                  } ${!p.isPublished ? "opacity-75 bg-muted/10" : ""}`}
                >
                  <div className="aspect-square bg-muted/30 overflow-hidden relative">
                    <img
                      src={productImg}
                      alt={p.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!p.isPublished ? "grayscale" : ""}`}
                    />
                    <div className="absolute top-1 right-1 w-6 h-6 rounded-md bg-background/90 backdrop-blur border border-border flex items-center justify-center">
                      <Checkbox checked={selectedIds.has(p._id)} onCheckedChange={() => toggleSelected(p._id)} />
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                      {displayCategory || "Uncategorized"} {p.subCategory && p.subCategory !== "None" && `• ${p.subCategory}`}
                    </p>
                    <h3 className="text-xs sm:text-sm md:text-base font-serif text-accent truncate">{p.name}</h3>

                    <div className="flex items-baseline gap-2 text-[13px]">
                      <span className="text-[12px] sm:text-[15px] text-foreground">PKR. {p.salePrice}</span>
                      {p.regularPrice && Number(p.regularPrice) > Number(p.salePrice) && (
                        <span className="text-muted-foreground line-through text-[10px] sm:text-[13px]">
                          PKR. {p.regularPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] sm:text-[13px] pt-2 border-t border-border">
                      <span className={p.stock > 0 ? "text-emerald-600" : "text-destructive"}>
                        {p.stock > 0 ? `${p.stock} In Stock` : "Out of Stock"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-5 h-5 sm:w-7 sm:h-7 text-muted-foreground hover:text-neutral-950"
                          onClick={() => handleSingleTogglePublished(p._id, p.isPublished)}
                        >
                          {p.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-5 h-5 sm:w-7 sm:h-7 text-muted-foreground hover:text-cyan-50"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-5 h-5 sm:w-7 sm:h-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteTrigger(p._id, p.name)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <Dialog 
        open={uiState.isDeleteDialogOpen} 
        onOpenChange={(open) => setUiState((prev) => ({ ...prev, isDeleteDialogOpen: open }))}
      >
        <DialogContent className="max-w-[320px] rounded-3xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-3 bg-destructive/10 rounded-full text-destructive">
              <AlertTriangle size={30} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-foreground">Delete Product?</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete <span className="font-medium text-foreground">{uiState.productToDelete?.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 w-full mt-4">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setUiState((prev) => ({ ...prev, isDeleteDialogOpen: false, productToDelete: null }))}
                disabled={isProductMutating}
              >
                Cancel
              </Button>

              <Button variant="destructive" className="flex-1 rounded-xl" onClick={handleConfirmDelete} disabled={isProductMutating}>
                {isProductMutating ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;