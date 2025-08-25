import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLoader from "../components/common/PageLoader";

const DefaultRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace />;

    // Admin
    if (user.roles?.includes("admin")) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Parent or staff with completed setup
    if (
        (user.roles?.includes("parent") && user.isChildrenAdded) ||
        (user.roles?.includes("staff") && user.isStaffDetailAdded) ||
        (user.roles?.length === 2 && user.isChildrenAdded && user.isStaffDetailAdded)
    ) {
        return <Navigate to="/chat" replace />;
    }

    // Fallback → incomplete profile
    return <Navigate to="/child-basic-info" replace />;
};

export default DefaultRoute;
