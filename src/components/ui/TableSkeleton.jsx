import React from 'react';
import { cn } from '../../lib/utils';

const TableSkeleton = ({ columns = 5, rows = 5, className }) => {
    return (
        <div className={cn('w-full flex flex-col gap-4', className)}>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    {/* Header Skeleton */}
                    <thead className="bg-gray-50">
                        <tr>
                            {Array.from({ length: columns }).map((_, index) => (
                                <th key={index} className="px-6 py-3">
                                    <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    
                    {/* Body Skeleton */}
                    <tbody className="bg-white divide-y divide-gray-200">
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {Array.from({ length: columns }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            {colIndex === 0 && (
                                                <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse"></div>
                                            )}
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                                                {colIndex === 0 && (
                                                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between px-2">
                <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TableSkeleton;