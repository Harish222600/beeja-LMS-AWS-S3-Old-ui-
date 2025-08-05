import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoutes = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  if (!token || !user || user?.accountType !== "Admin") {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default AdminRoutes;
