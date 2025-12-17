import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSidebarItems } from "./sidebar/SidebarItems";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";
import logo from "../../../assets/images/logo.svg"

interface SidebarProps {
    className?: string;
}

export function Sidebar({ }: SidebarProps) {

    const [collapsed, setCollapsed] = useState(false);
    const [posExpanded, setPosExpanded] = useState(false);
    const location = useLocation();
    const isPosPath = location.pathname.startsWith('/pos');

    useEffect(() => {
        if (isPosPath) {
            setPosExpanded(true);
        }
    }, [isPosPath]);

    const sidebarItems = useSidebarItems();

    return (
        <div className={`flex flex-col h-full bg-alice-peach border-r border-alice-gray transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
            <div className="flex items-center justify-center h-16 px-4 border-b border-alice-gray">


                {!collapsed && (
                    <Link
                        to="/admin/dashboard"
                        className="font-bold text-lg text-primary transition-opacity duration-300 text-center w-full">
                        <>
                            <div className="h-11 w-auto flex items-center">
                                <img
                                src={logo}
                                srcSet="/logo@2x.png 2x, /logo@3x.png 3x"
                                alt="Logo"
                                className="h-[53px] w-auto"
                                />
                            </div>
                        </>
                    </Link>
                )}



                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0  hover:text-emerald-700 text-black h-10 w-10 ml-auto"
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="flex-grow py-4">
                <ul className="space-y-1 px-2">
                    {sidebarItems.map((item) => {
                        // if (item.adminOnly && !isAdmin && !isSuperAdmin) return null;
                        // if (item.superAdminOnly && !isSuperAdmin) return null;
                        // if (!isSuperAdmin && !item.isActive) return null;
                        // if (!item.isActive) return null;

                        const isActive = item.expandable
                            ? isPosPath
                            : location.pathname === item.href ||
                            (item.href !== "/" && location.pathname.startsWith(item.href ?? ""));
                        return (
                            <li key={item.title} className={item.expandable && posExpanded ? "pb-1" : ""}>
                                <SidebarMenuItem
                                    item={item}
                                    isActive={isActive}
                                    collapsed={collapsed}
                                    expanded={item.expandable ? posExpanded : undefined}
                                    onToggle={item.expandable ? () => setPosExpanded(!posExpanded) : undefined}
                                />
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
}
