import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageLoader from "../components/common/PageLoader";

const DefaultRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div><PageLoader /></div>;
    if (!user) return <Navigate to="/login" replace />;

    if (user.roles?.includes("admin")) {
        return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.roles?.includes("parent")) {
        return <Navigate to="/chat" replace />;
    }
    if (user.roles?.includes("staff")) {
        return <Navigate to="/chat" replace />;
    }

    return <Navigate to="/login" replace />;
};

export default DefaultRoute;