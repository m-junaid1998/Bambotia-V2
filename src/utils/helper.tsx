export const calculateDiscount = (regular?: number, sale?: number) => {
  if (!regular || !sale || regular <= sale) return 0;

  return Math.round(((regular - sale) / regular) * 100);
};

export const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export const ORDER_STATUS_META: Record<string, { label: string; uiClass: string }> = {
  "Pending": { 
    label: "Pending", 
    uiClass: "border-amber-500/30 text-amber-500 bg-amber-500/5" 
  },
  "Confirmed": { 
    label: "Confirmed", 
    uiClass: "border-blue-500/30 text-blue-500 bg-blue-500/5" 
  },
  "Processing": { 
    label: "Processing", 
    uiClass: "border-purple-500/30 text-purple-500 bg-purple-500/5" 
  },
  "Shipped": { 
    label: "Shipped", 
    uiClass: "border-indigo-500/30 text-indigo-500 bg-indigo-500/5" 
  },
  "Delivered": { 
    label: "Delivered", 
    uiClass: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" 
  },
  "Cancelled": { 
    label: "Cancelled", 
    uiClass: "border-rose-500/30 text-rose-500 bg-rose-500/5" 
  },
};


export const slugify = (text: string): string => {
  return text
    ? text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")           
        .replace(/[^\w\-]+/g, "")       
        .replace(/\-\-+/g, "-")         
        .replace(/^-+/, "")             
        .replace(/-+$/, "")            
    : "";
};


export const formatTitleCase = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/-+/g, " ")               
    .trim()
    .split(/\s+/)                       
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};