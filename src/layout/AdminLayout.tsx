import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "../components/common/admin/AdminSidebar";
import { Header } from "../components/common/admin/adminHeader";
import { useAuth } from "../contexts/AuthContext";
import Footer from "../components/common/Footer";
// import { Header } from "./Header";

interface DashboardLayoutProps {
  requireAuth?: boolean;
}

const AdminLayout: React.FC<DashboardLayoutProps> = ({ requireAuth = true }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden overflow-y-auto">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1  overflow-auto p-6">
          <Outlet />
        </main>
         <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
