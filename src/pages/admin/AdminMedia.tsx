import React, { useState, useRef } from "react";
import { Image, Video, Plus, Trash2, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationPremium } from "@/components/ui/pagination-premium"; 
import { useMedia } from "@/hooks/useMedia"; 
import { createFormData } from "@/lib/utils";
import { toast } from "sonner";
import type { MediaItem } from "@/types";

interface MediaFormState {
  title: string;
  media: File[]; 
  isPublished: boolean;
}

const INITIAL_FORM_STATE: MediaFormState = {
  title: "",
  media: [],
  isPublished: true,
};

const AdminMedia = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 10, type: undefined as "image" | "video" | undefined });
  const [form, setForm] = useState<MediaFormState>(INITIAL_FORM_STATE);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    mediaItems, 
    pagination, 
    isFetchingMedia, 
    isUploading, 
    isDeleting, 
    uploadMedia, 
    removeMedia 
  } = useMedia(filters);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const filesArray = Array.from(e.target.files);
    if (filesArray.length > 5) {
      return toast.error("You can select a maximum of 5 files only");
    }
    
    setForm((prev) => ({ ...prev, media: filesArray }));
  };

  const handleUploadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Please enter a media title");
    if (form.media.length === 0) return toast.error("Please select at least one media asset file");

    const formData = createFormData({
      ...form,
      title: form.title.trim(),
    });

    const res = await uploadMedia(formData);
    if (res?.success) {
      setForm(INITIAL_FORM_STATE);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-accent mb-2">SHOWCASE</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">Media Assets</h1>
          
          {isFetchingMedia ? (
            <div className="flex gap-2 mt-2 items-center">
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Manage global imagery streams • <span className="text-accent font-bold">{pagination?.totalRecords || 0}</span> items cataloged
            </p>
          )}
        </div>

        <div className="flex gap-1.5 bg-muted/20 p-1 rounded-xl border border-border/60 w-fit h-11 items-center px-2">
          {( [
            { label: "All Items", value: undefined },
            { label: "Images", value: "image" },
            { label: "Videos", value: "video" }
          ] as const).map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, page: 1, type: tab.value }))}
              className={`px-4 py-1.5 text-xs font-medium tracking-wide rounded-lg transition-all ${
                filters.type === tab.value
                  ? "bg-background text-foreground shadow-sm border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] tracking-[0.2em] text-accent uppercase mb-1 font-semibold">Upload Hub</p>
          <h2 className="text-xl text-foreground font-serif mb-5">Add Studio Files</h2>
          
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] tracking-[0.15em] font-medium uppercase text-muted-foreground mb-1.5">Media Title *</label>
              <Input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="e.g., Summer Lookbook Banner"
                className="h-11 placeholder:text-xs text-sm"
                disabled={isUploading}
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.15em] font-medium uppercase text-muted-foreground mb-1.5">Select Files (Max 5)</label>
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="border border-dashed border-border hover:border-accent bg-muted/10 rounded-xl p-5 text-center cursor-pointer transition-colors group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={isUploading}
                />
                <Plus className="w-5 h-5 mx-auto mb-2 text-muted-foreground group-hover:text-accent transition-colors" />
                <div className="text-muted-foreground group-hover:text-foreground text-xs font-medium transition-colors">
                  {form.media.length > 0 ? (
                    <span className="text-accent font-semibold">{form.media.length} assets ready</span>
                  ) : (
                    "Click to browse folder files"
                  )}
                </div>
              </div>

              {form.media.length > 0 && (
                <div className="mt-3 bg-muted/20 border border-border/50 rounded-lg p-2 space-y-1">
                  {form.media.map((file, i) => (
                    <div key={i} className="text-[11px] text-muted-foreground flex justify-between items-center px-1 font-mono">
                      <span className="truncate max-w-[180px]">{file.name}</span>
                      <span className="opacity-60">{(file.size / (1024 * 1024)).toFixed(2)}MB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-foreground hover:bg-foreground/90 text-background font-medium h-11 rounded-xl text-xs uppercase tracking-[0.2em] transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-background/40 border-t-background rounded-full animate-spin" />
              ) : (
                "Publish Media"
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-background/90 backdrop-blur-md border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-[10px] tracking-[0.2em] text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">ASSET DETAILS</th>
                  <th className="px-4 py-3 text-left font-medium">TYPE</th>
                  <th className="px-4 py-3 text-left font-medium">CLOUD ID</th>
                  <th className="px-4 py-3 text-right font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {isFetchingMedia ? (
                  [...Array(4)].map((_, idx) => (
                    <tr key={idx} className="border-t border-border/60">
                      <td className="px-4 py-4 flex items-center gap-2">
                        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-4 py-4 flex justify-end"><Skeleton className="h-8 w-8 rounded-full" /></td>
                    </tr>
                  ))
                ) : mediaItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-sm text-muted-foreground">
                      No system media records cataloged for this filter.
                    </td>
                  </tr>
                ) : (
                  mediaItems.map((item: MediaItem, index: number) => (
                    <tr key={item._id || index} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-muted border border-border/60 overflow-hidden shrink-0 aspect-square flex items-center justify-center relative">
                            {item.mediaType === "video" ? (
                              <video src={item.mediaUrl} className="w-full h-full object-cover" preload="metadata" muted />
                            ) : (
                              <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            )}
                          </div>
                          <div className="max-w-[200px] md:max-w-xs">
                            <p className="text-foreground font-medium truncate">{item.title}</p>
                           
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className="text-[10px] tracking-wider font-semibold inline-flex items-center gap-1 uppercase text-muted-foreground">
                          {item.mediaType === "video" ? <Video className="w-3 h-3 text-accent" /> : <Image className="w-3 h-3 text-accent" />}
                          {item.mediaType}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground font-mono text-[11px] truncate max-w-[150px]">
                        {item.public_id || "N/A"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={item.mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                            title="View Asset link"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => removeMedia(item._id, item.title)}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-40"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!isFetchingMedia && mediaItems.length > 0 && (
            <PaginationPremium
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
              disabled={isFetchingMedia}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminMedia;