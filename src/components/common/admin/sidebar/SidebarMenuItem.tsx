import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import type { SidebarItemBadge, SidebarSubItem } from "./SidebarItems";
import { SidebarBadge } from "./SidebarBadge";

interface SidebarMenuItemProps {
  item: {
    title: string;
    icon: any;
    href?: string;
    expandable?: boolean;
    expanded?: boolean;
    badge?: SidebarItemBadge;
    subItems?: SidebarSubItem[];
  };
  isActive: boolean;
  collapsed: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

export function SidebarMenuItem({
  item,
  isActive,
  collapsed,
  expanded,
  onToggle
}: SidebarMenuItemProps) {

  const Icon = item.icon;

  // Base component to render (either Link or button)
  const Component = item.href && !item.expandable
    ? ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <Link to={item.href || "#"} className={className}>{children}</Link>
    )
    : ({ children, className }: { children: React.ReactNode, className?: string }) => (
      <button onClick={onToggle} className={className}>{children}</button>
    );

  return (
    <div>
      <Component
        className={`
          flex w-full items-center gap-2 rounded-md px-2 py-3 text-sm font-semibold
          transition-colors duration-200
          ${isActive
            ? "bg-[#dbfff3b7]  text-[#008080]"
            : "text-[#333333] hover:bg-teal-100"}             
          ${collapsed ? "justify-center" : ""}
        `}
      >
        <Icon className={`h-4 w-4 shrink-0 ${collapsed ? "mr-0" : "mr-2"} ${isActive ? "text-[#008080]" : ""}`} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.title}</span>
            {item.badge && <SidebarBadge badge={item.badge} />}
            {item.expandable && (
              <ChevronDown
                className={`
                  h-4 w-4 transition-transform
                  ${expanded ? "rotate-180" : ""}
                `}
              />
            )}
          </>
        )}
      </Component>

      {/* Render sub-items if expanded and not collapsed */}
      {/* {expanded && !collapsed && item.subItems && (
        <div className="mt-1 space-y-1 pl-6">
          {item.subItems.map((subItem, index) => {
            const SubIcon = subItem.icon;
            const location = useLocation();
            const isSubActive = location.pathname === subItem.href;

            return (
              <Link
                key={index}
                to={subItem.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                  "transition-colors duration-200",
                  isSubActive
                    ? "bg-[#FFF7E6] hover:bg-[#FFF7E6] text-[#008080]"
                    : "text-[#333333] hover:bg-[#FFFBEA]",
                )}
              >
                <SubIcon className="h-4 w-4 shrink-0" />
                <span className="truncate">{subItem.title}</span>
              </Link>
            );
          })}
        </div>
      )} */}
    </div>
  );
}
