
import React from 'react';
import type { SidebarItemBadge } from './SidebarItems';

interface SidebarBadgeProps {
  badge: SidebarItemBadge;
}

export const SidebarBadge: React.FC<SidebarBadgeProps> = ({ badge }) => {
  // Add null check for badge.color to prevent "undefined (reading 'bg')" error
  if (!badge.color) {
    // Use default colors if color is not specified
    return (
      <span className="ml-auto text-xs font-semibold px-2 rounded-full min-w-[28px] text-center block bg-gray-200 text-gray-700">
        {badge.count}
      </span>
    );
  }

  return (
    <span className={`
      ml-auto text-xs font-semibold px-2 rounded-full min-w-[28px] text-center block
      badge.color.bg
      badge.color.text
    `}>
      {badge.count}
    </span>
  );
};
