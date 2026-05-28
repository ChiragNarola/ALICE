import {
  LayoutDashboard,
  Users,
  Laptop2,
  ClipboardCheck,
  FileText,
  School,
  CalendarDays,
  BadgeQuestionMark,
  Handshake,
  Clock,
  Bell
} from "lucide-react";

export interface SidebarItemBadge {
  count?: number;
  color: {
    bg: string;
    text: string;
  };
}

export interface SidebarSubItem {
  title: string;
  icon: any;
}

export interface SidebarItem {
  title: string;
  icon: any;
  href?: string;
  badge?: SidebarItemBadge;
  expandable?: boolean;
  subItems?: SidebarSubItem[];
}

export const useSidebarItems = (): SidebarItem[] => {
  return [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
    },
    {
      title: "User",
      icon: Users,
      href: "/admin/user",
    },
    {
      title: "Staff Details",
      icon: Users,
      href: "/admin/staff-nursery",
    },
    {
      title: "Concerns",
      icon: ClipboardCheck,
      href: "/admin/concerns",
    },
    {
      title: "Area of Interest",
      icon: Laptop2,
      href: "/admin/area-of-interest",
    },
    {
      title: "Documents",
      icon: FileText,
      href: "/admin/documents",
    },
    {
      title: "Holiday Calendar",
      icon: CalendarDays,
      href: "/admin/holiday-calendar",
    },
    {
      title: "Nursery",
      icon: School,
      href: "/admin/nursery",
    },
    {
      title: "Waitlist",
      icon: Clock,
      href: "/admin/waitlist",
    },
    {
      title: "Collaboration",
      icon: Handshake,
      href: "/admin/collaboration",
    },
    // {
    //   title: "Notification",
    //   icon: Bell,
    //   href: "/admin/notification",
    // },
    {
      title: "FAQ",
      icon: BadgeQuestionMark ,
      href: "/admin/faq"
    }
    // {
    //   title: "Settings",
    //   icon: Settings,
    //   href: "/admin/settings",
    // },
  ];
};
