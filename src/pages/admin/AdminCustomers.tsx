import { useEffect, useState } from "react";
import { Search, Phone, MessageCircle, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { endpoints } from "@/api/config";
import { useCrudMutation } from "@/api/apiSlice";
import { toast } from "sonner";
import { PaginationPremium } from "@/components/ui/pagination-premium"; 

interface BackendCustomer {
  fullName: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
}

interface ApiResponse {
  success: boolean;
  stats: { totalCustomers: number; repeatBuyers: number };
  pagination: { totalCount: number; totalPages: number; currentPage: number; pageSize: number };
  data: BackendCustomer[];
}

const waLink = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 
  const [customerPayload, setCustomerPayload] = useState<ApiResponse | null>(null);
  
  const [getDashboardCustomers, { isLoading }] = useCrudMutation();

  const fetchCustomers = async (searchStr?: string, pageNum: number = 1) => {
    try {
      const res = await getDashboardCustomers({
        endpoint: endpoints.customerRoutes.dashboardCustomers,
        method: "POST",
        data: {
          currentPage: pageNum,
          pageSize: 5, 
          searchString: searchStr?.trim() || undefined,
        },
      }).unwrap();
      
      setCustomerPayload(res);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customer system directory");
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery, currentPage);
  }, [currentPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim() === "") {
      setCurrentPage(1);
      fetchCustomers("", 1);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); 
    fetchCustomers(searchQuery, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const customers = customerPayload?.data || [];
  const totalCustomers = customerPayload?.stats?.totalCustomers || 0;
  const repeatBuyers = customerPayload?.stats?.repeatBuyers || 0;
  const totalPages = customerPayload?.pagination?.totalPages || 1;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.4em] text-accent mb-2">PEOPLE</p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">Customers</h1>

          {isLoading ? (
            <div className="flex gap-2 mt-2 items-center">
              <Skeleton className="h-4 w-24" />
              <span className="text-muted-foreground text-xs">•</span>
              <Skeleton className="h-4 w-28" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="text-accent font-bold">{totalCustomers} </span> custom
              {totalCustomers === 1 ? "er" : "ers"} •{" "}
              <span className="text-accent font-bold">{repeatBuyers}</span> repeat buyer
              {repeatBuyers === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, phone, city..."
            className="pl-9 h-11 placeholder:text-xs sm:placeholder:text-sm"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </form>
      </div>

      <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-[10px] tracking-[0.2em] text-muted-foreground">
                <th className="px-4 py-3 text-left font-medium">CUSTOMER</th>
                <th className="px-4 py-3 text-left font-medium">PHONE</th>
                <th className="px-4 py-3 text-left font-medium">CITY</th>
                <th className="px-4 py-3 text-left font-medium">ORDERS</th>
                <th className="px-4 py-3 text-left font-medium">TOTAL SPENT</th>
                <th className="px-4 py-3 text-right font-medium">CONTACT</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, idx) => (
                  <tr key={idx} className="border-t border-border/60">
                    <td className="px-4 py-4 flex items-center gap-2">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4 flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-sm text-muted-foreground">
                    No customers found matching system records.
                  </td>
                </tr>
              ) : (
                customers.map((c, index) => (
                  <tr key={c.phone + index} className="border-t border-border hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-[11px] font-medium text-accent uppercase shrink-0">
                          {c.fullName?.trim().slice(0, 2) || "CU"}
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{c.fullName}</p>
                          {c.orders > 1 && (
                            <p className="text-[10px] text-accent inline-flex items-center gap-1 mt-0.5">
                              <Star className="w-3 h-3 fill-current" /> Repeat customer
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.city}</td>
                    <td className="px-4 py-3 text-foreground text-center">{c.orders}</td>
                    <td className="px-4 py-3 text-foreground font-medium">
                      PKR {(c.totalSpent || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`tel:${c.phone?.replace(/\s+/g, "")}`}
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                          aria-label="Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={waLink(c.phone || "")}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                          aria-label="WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && customers.length > 0 && (
          <PaginationPremium
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;