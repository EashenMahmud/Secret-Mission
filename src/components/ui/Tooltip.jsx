import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { cn } from '../../lib/utils';
import { HelpCircle } from 'lucide-react';

const Tooltip = ({
    content,
    children,
    id,
    place = 'top',
    className
}) => {
    const tooltipId = id || `tooltip-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <>
            <div
                data-tooltip-id={tooltipId}
                data-tooltip-content={typeof content === 'string' ? content : undefined}
                className={cn('inline-flex items-center cursor-help', className)}
            >
                {children || <HelpCircle className="h-4 w-4 text-gray-400" />}
            </div>
            <ReactTooltip
                id={tooltipId}
                place={place}
                clickable={true}
                className="z-[9999] !bg-[var(--bg-card)] !text-[var(--text-main)] !border !border-[var(--border-main)] !px-3 !py-2 !rounded-lg !text-xs !shadow-2xl !opacity-100"
            >
                {typeof content !== 'string' ? content : null}
            </ReactTooltip>
        </>
    );
};

export default Tooltip;
