import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminLayout from '../admin/components/layout/AdminLayout';

const AdminRoutes = () => {
  return (
    <AdminLayout>
      <Outlet />  
    </AdminLayout>
  );
};

export default AdminRoutes;