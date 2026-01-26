import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getPaginationRowModel,
    getSortedRowModel,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from './Button';
import TableSkeleton from './TableSkeleton';

const Table = ({
    columns,
    data,
    isLoading = false,
    pagination = true,
    pageSize = 10,
    pageCount,
    onPageChange,
    currentPage,
    manualPagination = false,
    className
}) => {
    const tableData = useMemo(() => data || [], [data]);
    const tableColumns = useMemo(() => columns, [columns]);

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: manualPagination,
        pageCount: pageCount,
        onPaginationChange: (updater) => {
            if (manualPagination && onPageChange) {
                const newState = typeof updater === 'function'
                    ? updater({ pageIndex: currentPage, pageSize: pageSize })
                    : updater;
                onPageChange(newState.pageIndex);
            }
        },
        state: {
            ...(manualPagination && {
                pagination: {
                    pageIndex: currentPage,
                    pageSize: pageSize,
                }
            }),
        },
    });

    // Show skeleton when loading
    if (isLoading) {
        return <TableSkeleton columns={columns.length} rows={pageSize} className={className} />;
    }

    return (
        <div className={cn('w-full flex flex-col gap-4', className)}>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-2">
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            {{
                                                asc: <ChevronUp className="h-4 w-4" />,
                                                desc: <ChevronDown className="h-4 w-4" />,
                                            }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-10 text-center text-sm text-gray-400">
                                    No data found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (manualPagination ? pageCount > 1 : tableData.length > 0) && (
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                            Page <span className="font-semibold">{manualPagination ? currentPage + 1 : table.getState().pagination.pageIndex + 1}</span> of{' '}
                            <span className="font-semibold">{manualPagination ? pageCount : table.getPageCount()}</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => manualPagination ? onPageChange(0) : table.setPageIndex(0)}
                            disabled={manualPagination ? currentPage === 0 : !table.getCanPreviousPage()}
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => manualPagination ? onPageChange(currentPage - 1) : table.previousPage()}
                            disabled={manualPagination ? currentPage === 0 : !table.getCanPreviousPage()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="hidden sm:flex items-center gap-1">
                            {Array.from({ length: manualPagination ? pageCount : table.getPageCount() }, (_, i) => {
                                const isCurrent = manualPagination ? currentPage === i : table.getState().pagination.pageIndex === i;
                                const totalPages = manualPagination ? pageCount : table.getPageCount();

                                if (totalPages > 7) {
                                    const activePage = manualPagination ? currentPage : table.getState().pagination.pageIndex;
                                    if (i !== 0 && i !== totalPages - 1 && Math.abs(i - activePage) > 1) {
                                        if (i === 1 || i === totalPages - 2) return <span key={i} className="px-1 text-gray-400">...</span>;
                                        return null;
                                    }
                                }

                                return (
                                    <Button
                                        key={i}
                                        variant={isCurrent ? 'primary' : 'outline'}
                                        size="sm"
                                        className={cn("w-8 h-8 p-0", isCurrent && "bg-primary-500 text-white border-primary-500")}
                                        onClick={() => manualPagination ? onPageChange(i) : table.setPageIndex(i)}
                                    >
                                        {i + 1}
                                    </Button>
                                );
                            })}
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => manualPagination ? onPageChange(currentPage + 1) : table.nextPage()}
                            disabled={manualPagination ? currentPage === pageCount - 1 : !table.getCanNextPage()}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => manualPagination ? onPageChange(pageCount - 1) : table.setPageIndex(table.getPageCount() - 1)}
                            disabled={manualPagination ? currentPage === pageCount - 1 : !table.getCanNextPage()}
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;
