import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    return user ? <Navigate to="/child-basic-info" replace /> : <Outlet />;
};

export default PublicRoute;
