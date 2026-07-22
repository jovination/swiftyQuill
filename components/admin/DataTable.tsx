"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  pageSize?: number;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function DataTable<T>({ data, columns, className, pageSize = 10 }: DataTableProps<T>) {
  const [size, setSize] = React.useState(pageSize);
  const [page, setPage] = React.useState(0);

  const totalPages = Math.max(1, Math.ceil(data.length / size));
  const safePage = Math.min(page, totalPages - 1);
  const start = safePage * size;
  const paged = data.slice(start, start + size);

  React.useEffect(() => {
    setPage(0);
  }, [size]);

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full overflow-auto rounded-2xl border">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-24 text-center align-middle text-muted-foreground"
                >
                  No results.
                </td>
              </tr>
            ) : (
              paged.map((item, rowIndex) => (
                <tr
                  key={start + rowIndex}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                    >
                      {column.cell
                        ? column.cell(item)
                        : (item as any)[column.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: row selector + pagination */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Rows per page</span>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="h-8 rounded-xl border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="ml-2">
              {start + 1}–{Math.min(start + size, data.length)} of {data.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(0)}
              disabled={safePage === 0}
              className="h-8 px-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
            >
              {"<<"}
            </button>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="h-8 px-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
            >
              {"<"}
            </button>
            <span className="h-8 px-3 flex items-center text-xs font-medium text-foreground">
              {safePage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="h-8 px-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
            >
              {">"}
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={safePage >= totalPages - 1}
              className="h-8 px-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
            >
              {">>"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
