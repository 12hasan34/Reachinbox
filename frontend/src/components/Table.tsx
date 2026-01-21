import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  keyFn: (row: T) => string | number;
};

export default function Table<T>({ rows, columns, keyFn }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.header}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={keyFn(r)} className="border-t">
              {columns.map((c) => (
                <td
                  key={c.header}
                  className={`px-4 py-3 text-sm text-gray-900 ${c.className || ""}`}
                >
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
