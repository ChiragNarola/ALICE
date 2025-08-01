import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateAdminPanelRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return;

    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateAdminPanelRoute;
