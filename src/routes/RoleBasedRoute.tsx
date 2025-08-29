import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLoader from "../components/common/PageLoader";

interface RoleBasedRouteProps {
    allowedRoles: string[];
}

const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return <div><PageLoader /></div>;

    const isAdminRoute = location.pathname.startsWith("/admin");
    const loginPath = isAdminRoute ? "/admin/login" : "/login";

    if (!user) return <Navigate to={loginPath} replace />;

    const hasAccess = user.roles?.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleBasedRoute;
