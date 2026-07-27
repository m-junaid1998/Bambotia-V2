import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContactQuery } from "@/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useContact, QueryFilters } from "@/hooks/useContact";
import { useOutletContext } from "react-router-dom";

const NUMERIC_STATUSES = [
  { label: "Pending", value: "1" },
  { label: "In Progress", value: "2" },
  { label: "Resolved", value: "3" },
];

export const CONTACT_STATUS_META: Record<
  string,
  { label: string; className: string; icon: LucideIcon }
> = {
  Pending: {
    label: "Pending",
    className: "border-amber-500/30 text-amber-500 bg-amber-500/5",
    icon: AlertCircle,
  },
  "In Progress": {
    label: "In Progress",
    className: "border-blue-500/30 text-blue-500 bg-blue-500/5",
    icon: Clock,
  },
  Resolved: {
    label: "Resolved",
    className: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
    icon: CheckCircle2,
  },
};

const BACKEND_TO_NUMERIC: Record<string, string> = {
  Pending: "1",
  "In Progress": "2",
  Resolved: "3",
};

const NUMERIC_TO_BACKEND: Record<string, string> = {
  "1": "Pending",
  "2": "In Progress",
  "3": "Resolved",
};

const fmtDate = (dateStr?: string) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

const StatCard = ({
  icon: Icon,
  label,
  value,
  isLoading,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  isLoading?: boolean;
}) => (
  <div className="bg-background/90 border border-border rounded-2xl p-5 shadow-sm">
    <div className="w-9 h-9 rounded-md bg-accent/15 flex items-center justify-center mb-3">
      <Icon className="w-4 h-4 text-accent" />
    </div>
    <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-1">
      {label}
    </p>
    {isLoading ? (
      <Skeleton className="h-8 w-16 mt-1" />
    ) : (
      <p className="font-serif text-2xl text-foreground">{value}</p>
    )}
  </div>
);

const AdminContacts = () => {
  const [filters, setFilters] = useState<QueryFilters>({
    page: 1,
    limit: 50,
    search: "",
    status: "all",
    dateRange: "all",
  });

  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState<ContactQuery | null>(null);
  
  const {
    queries,
    stats,
    isFetching,
    isUpdatingStatus,
    isDeleting,
    updateQueryStatus,
    deleteContactQuery,
  } = useContact(filters);

  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput.trim(), page: 1 }));
    }, 450);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { refetch } = useOutletContext() as {
    refetch: () => void;
  };

  const handleUpdatePipeline = async () => {
    if (!activeQuery?._id) return;
    
    const statusToSend = NUMERIC_TO_BACKEND[activeQuery.status] || activeQuery.status;
    
    const res = await updateQueryStatus(
      activeQuery._id,
      statusToSend,
      activeWorkspaceAdminNotes,
    );
    if (res.success) {
      refetch();
      setActiveQuery(null);
    }
  };

  const activeWorkspaceStatus = activeQuery?.status
    ? BACKEND_TO_NUMERIC[activeQuery.status] || activeQuery.status
    : "1";
    
  const activeWorkspaceAdminNotes = activeQuery?.adminNotes || "";

  const lookupKey = (activeQuery?.status && NUMERIC_TO_BACKEND[activeQuery.status]) || activeQuery?.status || "Pending";
  const activeMeta = CONTACT_STATUS_META[lookupKey] || CONTACT_STATUS_META.Pending;



  return (
    <div className="space-y-8 max-w-7xl ">
      <div>
        <p className="text-[10px] tracking-[0.4em] text-accent mb-2">
          CRM INBOX
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">
          Contact Queries
        </h1>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquare}
          label="TOTAL MESSAGES"
          value={stats.total}
          isLoading={isFetching}
        />
        <StatCard
          icon={AlertCircle}
          label="PENDING"
          value={stats.pending}
          isLoading={isFetching}
        />
        <StatCard
          icon={Clock}
          label="IN PROGRESS"
          value={stats.inProgress}
          isLoading={isFetching}
        />
        <StatCard
          icon={CheckCircle2}
          label="RESOLVED"
          value={stats.resolved}
          isLoading={isFetching}
        />
      </div>

      {/* Control Filters Bar */}
      <div className="bg-background/90 border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          {isFetching ? (
            <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
          ) : (
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          )}
          <Input
            placeholder="Search name, email..."
            className="pl-9 h-11"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            disabled={isFetching}
          />
        </div>

        <Select
          value={filters.dateRange}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, dateRange: val, page: 1 }))
          }
          disabled={isFetching}
        >
          <SelectTrigger className="h-11 md:w-44">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            {["all", "today", "7days", "30days"].map((v) => (
              <SelectItem key={v} value={v}>
                {v === "all"
                  ? "All dates"
                  : v === "7days"
                    ? "Last 7 Days"
                    : v === "30days"
                      ? "Last 30 Days"
                      : "Today"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(val) =>
            setFilters((prev) => ({ ...prev, status: val, page: 1 }))
          }
          disabled={isFetching}
        >
          <SelectTrigger className="h-11 md:w-44">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {NUMERIC_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isFetching ? (
        <div className="bg-background/90 border border-border rounded-2xl p-4 space-y-4">
          <div className="flex gap-4 border-b border-border pb-3 text-[10px] text-muted-foreground font-medium px-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-2 py-1">
              <Skeleton className="h-5 w-20 rounded-md" />
              <Skeleton className="h-5 w-32 rounded-md" />
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-5 flex-1 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>
      ) : queries.length === 0 ? (
        <div className="bg-background/90 border border-border rounded-2xl p-12 text-center text-sm text-muted-foreground">
          No records found.
        </div>
      ) : (
        <div className="bg-background/90 border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border text-[10px] tracking-[0.2em] text-muted-foreground">
                <tr>
                  {[
                    "DATE",
                    "SENDER",
                    "EMAIL",
                    "MESSAGE",
                    "STATUS",
                    "ACTIONS",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {queries.map((q: ContactQuery) => {
                  const meta =
                    CONTACT_STATUS_META[q.status] ||
                    CONTACT_STATUS_META.Pending;
                  return (
                    <tr
                      key={q._id}
                      className="border-t border-border hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {fmtDate(q.createdAt)}
                      </td>
                      <td className="px-4 py-4 font-medium text-foreground">
                        {q.name}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {q.email}
                      </td>
                      <td className="px-4 py-4 max-w-xs truncate text-muted-foreground">
                        {q.message}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium border rounded-full px-2.5 py-0.5 ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setActiveQuery(q)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full border-rose-500/20 text-rose-500 hover:bg-rose-500/10"
                            disabled={isDeleting}
                            onClick={() => deleteContactQuery(q._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Sheet
        open={!!activeQuery}
        onOpenChange={(open) => !open && setActiveQuery(null)}
      >
        <SheetContent className="w-full sm:max-w-xl scrollbar-premium overflow-y-auto">
          {activeQuery && (
            <>
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">
                  Query Workspace
                </SheetTitle>
                <SheetDescription>
                  Received on {fmtDate(activeQuery.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="bg-muted/20 border border-border rounded-xl p-4 text-sm">
                  <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-1">
                    SENDER PROFILE
                  </p>
                  <p className="text-foreground font-medium">
                    {activeQuery.name}
                  </p>
                  <p className="text-accent text-xs">{activeQuery.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] tracking-[0.3em] text-muted-foreground">
                    CLIENT MESSAGE
                  </p>
                  <div className="bg-background border border-border rounded-xl p-4 text-sm text-foreground italic whitespace-pre-wrap">
                    "{activeQuery.message}"
                  </div>
                </div>

                <Separator />
                <div className="space-y-4">
                

                  <div className="flex items-center justify-between gap-3  ">
                    <span
                       className={`inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] font-medium uppercase border rounded-full px-2.5 py-1 ${activeMeta.className}`}
                    >
                      {activeMeta.label}
                    </span>
                    
                    <Select
                      value={activeWorkspaceStatus}
                      onValueChange={(val) =>
                        setActiveQuery((prev) =>
                          prev ? { ...prev, status: val } : null,
                        )
                      }
                    >
                      <SelectTrigger className="h-9 w-44 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NUMERIC_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground">
                      Internal Admin Notes
                    </label>
                    <textarea
                      rows={4}
                      value={activeWorkspaceAdminNotes}
                      onChange={(e) =>
                        setActiveQuery((prev) =>
                          prev ? { ...prev, adminNotes: e.target.value } : null,
                        )
                      }
                      placeholder="Followed up with client..."
                      className="w-full bg-background border border-border p-3 text-sm text-foreground rounded-md focus:outline-none resize-none"
                    />
                  </div>

                  <Button
                    className="w-full h-11 gap-2"
                    disabled={isUpdatingStatus}
                    onClick={handleUpdatePipeline}
                  >
                    {isUpdatingStatus && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Save Diagnostics Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminContacts;