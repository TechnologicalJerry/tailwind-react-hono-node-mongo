import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { ProductsList } from '../pages/ProductsList';
import { UsersList } from '../pages/UsersList';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        <Route path="dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="products" element={
          <ProtectedRoute>
            <ProductsList />
          </ProtectedRoute>
        } />
        
        <Route path="users" element={
          <ProtectedRoute adminOnly>
            <UsersList />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};
