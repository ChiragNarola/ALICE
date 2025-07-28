import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return;

    return user ? <Navigate to="/child-basic-info" replace /> : <Outlet />;
};

export default PublicRoute;
