import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface RoleBasedRouteProps {
    allowedRoles: string[];
}

const RoleBasedRoute = ({ allowedRoles }: RoleBasedRouteProps) => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;

    const hasAccess = user.roles?.some(role => allowedRoles.includes(role));

    if (!hasAccess) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RoleBasedRoute;
