
import React from "react";
import AppHeader from "./AppHeader";
import NewAppSidebar from "./NewAppSidebar";
import { SidebarRail, SidebarInset } from "@/components/ui/sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <NewAppSidebar />
      <SidebarRail />
      
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto p-6 mt-16">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
};

export default AppLayout;
