
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { PDFProvider } from '@/contexts/PDFContext';
import { MobileNavProvider } from '@/hooks/use-mobile';
import { SidebarProvider } from '@/components/ui/sidebar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/react-query';
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
import UserManagement from '@/pages/UserManagement';
import SplashScreen from '@/components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ThemeProvider defaultTheme="light" storageKey="swift-ui-theme">
        <QueryClientProvider client={queryClient}>
          <PDFProvider>
            <AuthProvider>
              <MobileNavProvider>
                <SidebarProvider>
                  {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
                  <div className="w-full" style={{ visibility: showSplash ? 'hidden' : 'visible' }}>
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
                      <Route path="/manage/users" element={
                        <ProtectedRoute>
                          <UserManagement />
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
                  </div>
                </SidebarProvider>
              </MobileNavProvider>
            </AuthProvider>
          </PDFProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
