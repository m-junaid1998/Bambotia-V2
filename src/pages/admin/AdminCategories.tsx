import React, { useState } from "react";
import { Trash2, Plus, Search, Pencil, PlusCircle, X, AlertTriangle, Loader2} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCategories, CategoryFilters } from "@/hooks/useCategories";
import type { Category } from "@/types";

const AdminCategories = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CategoryFilters>({
    currentPage: 1,
    pageSize: 5,
    searchString: "",
    isAllRecord: true,
  });

  const {
    categories,
    pagination,
    isFetchingCategories,
    isMutating,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
    deleteConfirm,
    setDeleteConfirm,
  } = useCategories(filters);

  const [modalType, setModalType] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [oldSubName, setOldSubName] = useState("");

  const hasMore = categories.length < (pagination?.totalCount || 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      pageSize: 5,
      searchString: search.trim(),
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (!value.trim()) {
      setFilters((prev) => ({ ...prev, isAllRecord: true, searchString: "" }));
    }
  };

  const handleAction = async () => {
    if (!inputValue.trim()) {
      toast.error("Name field is required");
      return;
    }

    let result: { success?: boolean } = { success: false };
    const targetName = inputValue.trim();

    switch (modalType) {
      case "create-category":
        result = await createCategory({ categoryname: targetName });
        break;

      case "edit-category":
        if (selectedCategory) {
          result = await updateCategory(selectedCategory._id, targetName);
        }
        break;

      case "add-subcategory":
        if (selectedCategory) {
          result = await createSubCategory(selectedCategory._id, targetName);
        }
        break;

      case "edit-subcategory":
        if (selectedCategory && oldSubName) {
          result = await updateSubCategory(
            selectedCategory._id,
            oldSubName,
            targetName,
          );
        }
        break;

      default:
        break;
    }

    if (result?.success) {
      setModalType(null);
      setInputValue("");
      setSelectedCategory(null);
      setOldSubName("");
    }
  };

  const handleDeleteCategoryConfirm = async (
    id: string | number,
    categoryname: string,
  ) => {
    await deleteCategory(id, categoryname);
  };

  const handleDeleteSubCategoryClick = async (
    catId: string | number,
    subName: string,
  ) => {
    await deleteSubCategory(catId, subName);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-accent mb-2 uppercase">
            Management
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Smart category management for your storefront{" "}
            <span className="text-accent font-bold">
              {pagination?.totalCount || categories?.length || 0}
            </span>{" "}
            categories
          </p>
        </div>

        <Button
          onClick={() => {
            setInputValue("");
            setSelectedCategory(null);
            setModalType("create-category");
          }}
          className="h-11 tracking-[0.2em] text-xs"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          NEW CATEGORY
        </Button>
      </div>

      <form onSubmit={handleSearchSubmit} className="mx-auto mb-12 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            autoFocus={false}
            placeholder="Search categories or sub-categories"
            className="h-14 pl-12 text-base bg-card placeholder:text-xs sm:placeholder:text-sm"
            value={search}
            onChange={handleInputChange}
          />
        </div>
        <Button
          type="submit"
          className="h-14 px-6"
          disabled={!search.trim() || isFetchingCategories}
        >
          {isFetchingCategories && filters.searchString
            ? "SEARCHING..."
            : "SEARCH"}
        </Button>
      </form>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories && categories.length > 0 ? (
          categories.map((cat: Category) => (
            <div
              key={cat._id}
              className="bg-card border p-6 rounded-2xl space-y-4 hover:border-accent/40 transition-all hover:shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif text-xl text-accent uppercase truncate max-w-[150px]">
                    {cat.categoryname}
                  </h3>
                  <div className="flex gap-1 items-center bg-muted/50 p-1 rounded-lg">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 cursor-pointer hover:text-accent hover:bg-background"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setInputValue(cat.categoryname);
                        setModalType("edit-category");
                      }}
                    >
                      <Pencil size={14} />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 cursor-pointer hover:text-accent hover:bg-background"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setInputValue("");
                        setModalType("add-subcategory");
                      }}
                    >
                      <Plus size={14} />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 cursor-pointer hover:text-destructive hover:bg-background"
                      onClick={() => setDeleteConfirm(cat)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cat.subCategories && cat.subCategories.length > 0 ? (
                    (cat.subCategories as string[]).map((sub: string, i: number) => (
                      <div
                        key={i}
                        className="group/sub flex items-center gap-1.5 bg-muted/30 border border-border/50 px-3 py-1.5 rounded-full text-[10px] tracking-[0.15em] font-medium transition-all duration-300 hover:scale-105 hover:border-accent/30 hover:bg-accent/5"
                      >
                        <span className="uppercase">{sub}</span>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setInputValue(sub);
                            setOldSubName(sub);
                            setModalType("edit-subcategory");
                          }}
                          className="opacity-0 group-hover/sub:opacity-100 flex items-center justify-center w-5 h-5 rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          <Pencil size={10} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteSubCategoryClick(cat._id, sub)
                          }
                          className="opacity-0 group-hover/sub:opacity-100 flex items-center justify-center w-5 h-5 rounded-full text-destructive hover:bg-destructive hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          <X size={10} strokeWidth={2.5} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground italic">
                      No sub-categories
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : !isFetchingCategories ? (
          <p className="text-muted-foreground text-sm col-span-full text-center py-8">
            No categories found.
          </p>
        ) : null}

        {isFetchingCategories && categories.length === 0 && (
          <>
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            disabled={isFetchingCategories}
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                pageSize: (prev.pageSize || 2) + 2,
              }))
            }
            className="h-12 px-8 tracking-[0.2em] text-xs font-semibold rounded-xl border min-w-[160px]"
          >
            {isFetchingCategories ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                LOADING...
              </div>
            ) : (
              "LOAD MORE"
            )}
          </Button>
        </div>
      )}
      <Dialog open={!!modalType} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-[400px] rounded-3xl p-8">
          <DialogHeader className="pb-4 -mx-8 border-b border-border">
            <DialogTitle className="font-serif text-xl text-accent tracking-[0.15em] text-center uppercase">
              {modalType?.replace("-", " ")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-[10px] pl-1 font-bold tracking-[0.25em] uppercase text-muted-foreground">
                NAME *
              </Label>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-12"
                placeholder={
                  modalType === "add-subcategory" ||
                  modalType === "edit-subcategory"
                    ? "Enter sub-category name"
                    : "Enter category name"
                }
                disabled={isMutating}
              />
            </div>
            <Button
              onClick={handleAction}
              className="w-full h-12 rounded-xl tracking-[0.2em]"
              disabled={isMutating || !inputValue.trim()}
            >
              {isMutating ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-[350px] rounded-3xl text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-3 bg-destructive/10 rounded-full text-destructive">
              <AlertTriangle size={30} />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold">Are you sure?</h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. Category{" "}
                <span className="font-semibold text-accent">
                  {deleteConfirm?.categoryname}
                </span>{" "}
                will be permanently deleted.
              </p>
            </div>
            <div className="flex gap-2 w-full mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
                disabled={isMutating}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() =>
                  deleteConfirm &&
                  handleDeleteCategoryConfirm(deleteConfirm._id, deleteConfirm.categoryname)
                }
                disabled={isMutating}
              >
                {isMutating ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
