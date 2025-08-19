import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicAdminPanelRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) return;

    // if(user?.roles.length == 2 && user.isChildrenAdded && user.isStaffDetailAdded) return <Navigate to="/chat" replace />
    // if(user?.roles.length == 1 && user.roles[0] == 'parent'  && user.isChildrenAdded ) return <Navigate to="/chat" replace />
    // if(user?.roles.length == 1 && user.roles[0] == 'staff' && user.isStaffDetailAdded) return <Navigate to="/chat" replace />

    return user ? <Navigate to="/admin/dashboard" replace /> : <Outlet />;
};

export default PublicAdminPanelRoute;
