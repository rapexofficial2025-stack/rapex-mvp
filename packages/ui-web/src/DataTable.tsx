import { useMemo, useState, type ReactNode } from "react";
import { useTheme } from "./useTheme";
import { EmptyState } from "./EmptyState";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, query: string) => boolean;
  selectable?: boolean;
  selectedKeys?: Set<string>;
  onSelectionChange?: (keys: Set<string>) => void;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  searchPlaceholder = "Search…",
  searchFn,
  selectable,
  selectedKeys,
  onSelectionChange,
  pageSize = 10,
  emptyMessage = "No results",
  onRowClick,
}: DataTableProps<T>) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!searchFn || !query.trim()) return rows;
    return rows.filter((row) => searchFn(row, query.trim().toLowerCase()));
  }, [rows, query, searchFn]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const column = columns.find((c) => c.key === sortKey);
    if (!column?.sortValue) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = column.sortValue!(a);
      const bv = column.sortValue!(b);
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const toggleRow = (key: string) => {
    if (!onSelectionChange || !selectedKeys) return;
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSelectionChange(next);
  };

  const toggleAllOnPage = () => {
    if (!onSelectionChange || !selectedKeys) return;
    const pageKeys = pageRows.map(rowKey);
    const allSelected = pageKeys.every((k) => selectedKeys.has(k));
    const next = new Set(selectedKeys);
    pageKeys.forEach((k) => (allSelected ? next.delete(k) : next.add(k)));
    onSelectionChange(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
      {searchFn ? (
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
          style={{
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radius.md,
            padding: `${theme.spacing.sm}px ${theme.spacing.md}px`,
            fontSize: theme.typography.fontSize.sm,
            fontFamily: "inherit",
            outline: "none",
            maxWidth: 320,
          }}
        />
      ) : null}

      {sorted.length === 0 ? (
        <EmptyState title={emptyMessage} />
      ) : (
        <>
          <div style={{ overflowX: "auto", border: `1px solid ${theme.colors.border}`, borderRadius: theme.radius.md }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: theme.typography.fontSize.sm }}>
              <thead>
                <tr style={{ backgroundColor: theme.colors.surfaceAlt }}>
                  {selectable ? (
                    <th style={{ padding: theme.spacing.sm, width: 32 }}>
                      <input
                        type="checkbox"
                        checked={pageRows.length > 0 && pageRows.every((r) => selectedKeys?.has(rowKey(r)))}
                        onChange={toggleAllOnPage}
                      />
                    </th>
                  ) : null}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={col.sortValue ? () => toggleSort(col.key) : undefined}
                      style={{
                        textAlign: "left",
                        padding: theme.spacing.sm,
                        color: theme.colors.textSecondary,
                        fontWeight: 600,
                        cursor: col.sortValue ? "pointer" : "default",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.header}
                      {sortKey === col.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const key = rowKey(row);
                  return (
                    <tr
                      key={key}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      style={{
                        borderTop: `1px solid ${theme.colors.border}`,
                        cursor: onRowClick ? "pointer" : "default",
                      }}
                    >
                      {selectable ? (
                        <td style={{ padding: theme.spacing.sm }} onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={selectedKeys?.has(key) ?? false} onChange={() => toggleRow(key)} />
                        </td>
                      ) : null}
                      {columns.map((col) => (
                        <td key={col.key} style={{ padding: theme.spacing.sm, color: theme.colors.textPrimary }}>
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm, justifyContent: "flex-end" }}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                style={{ cursor: page <= 1 ? "default" : "pointer", opacity: page <= 1 ? 0.4 : 1 }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                style={{ cursor: page >= totalPages ? "default" : "pointer", opacity: page >= totalPages ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
