import type { ReactNode } from 'react';
import './ui.css';

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
  /** Ação ao clicar na linha (ex.: abrir o registro para edição). */
  onRowClick?: (row: T) => void;
}

/** Tabela genérica reutilizada por todas as telas de listagem. */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  empty = 'Nenhum registro encontrado.',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.header}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="table__empty" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className={onRowClick ? 'table__row--clickable' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.header}>{c.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
