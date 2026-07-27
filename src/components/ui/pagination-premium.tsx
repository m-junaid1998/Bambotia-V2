import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const PaginationPremium = ({
  currentPage,
  totalPages,
  onPageChange,
  disabled,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between border-t border-border/60 px-4 py-4 sm:px-6">

      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1 || disabled}
          className="relative inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages || disabled}
          className="relative ml-3 inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">
            Showing page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span> pages
          </p>
        </div>

        <div>
          <nav className="inline-flex -space-x-px rounded-xl gap-1" aria-label="Pagination">
 
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1 || disabled}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:border-border"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1 || disabled}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:border-border"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((page, idx) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-9 h-9 inline-flex items-center justify-center text-muted-foreground text-xs"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => onPageChange(page as number)}
                  disabled={disabled}
                  className={`w-9 h-9 inline-flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                    isCurrent
                      ? "bg-accent/10 border border-accent text-accent font-bold shadow-sm"
                      : "border border-border bg-background text-muted-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages || disabled}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:border-border"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages || disabled}
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-40 disabled:hover:text-muted-foreground disabled:hover:border-border"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};