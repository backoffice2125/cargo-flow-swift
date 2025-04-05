
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { PDFProvider } from '@/contexts/PDFContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import ShipmentNew from '@/pages/ShipmentNew';
import ShipmentDetails from '@/pages/ShipmentDetails';
import DropdownManagement from '@/pages/DropdownManagement';
import ManageAddresses from '@/pages/ManageAddresses';
import NotificationsPage from '@/pages/NotificationsPage';
import AddressSettingsPage from '@/pages/AddressSettings';

function App() {
  // Always clear session storage first-load flag when the app component mounts
  useEffect(() => {
    sessionStorage.removeItem('appOpened');
  }, []);
  
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="swift-ui-theme">
        <PDFProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/shipments/new" element={
                <ProtectedRoute>
                  <ShipmentNew />
                </ProtectedRoute>
              } />
              <Route path="/shipments/:id" element={
                <ProtectedRoute>
                  <ShipmentDetails />
                </ProtectedRoute>
              } />
              <Route path="/manage/dropdowns" element={
                <ProtectedRoute>
                  <DropdownManagement />
                </ProtectedRoute>
              } />
              <Route path="/manage/addresses" element={
                <ProtectedRoute>
                  <ManageAddresses />
                </ProtectedRoute>
              } />
              <Route path="/address-settings" element={
                <ProtectedRoute>
                  <AddressSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
            <Toaster />
          </AuthProvider>
        </PDFProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
