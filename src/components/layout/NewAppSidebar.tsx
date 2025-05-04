
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Package, 
  Settings, 
  Users,
  Database,
  List,
  Bell,
  ChevronDown,
  Mail
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

const AppSidebarMenu = () => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Dashboard">
          <NavLink
            to="/"
            className={({ isActive }) => cn(isActive && "data-[active=true]")}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Pending">
          <NavLink
            to="/?tab=pending"
            className={({ isActive, isPending }) => 
              cn((isActive && window.location.search.includes('pending')) && "data-[active=true]")}
          >
            <List className="h-5 w-5" />
            <span>Pending</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Completed">
          <NavLink
            to="/?tab=completed"
            className={({ isActive }) => 
              cn((isActive && window.location.search.includes('completed')) && "data-[active=true]")}
          >
            <Package className="h-5 w-5" />
            <span>Completed</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="New Shipment">
          <NavLink
            to="/shipments/new"
            className={({ isActive }) => cn(isActive && "data-[active=true]")}
          >
            <Package className="h-5 w-5" />
            <span>New Shipment</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Notifications">
          <NavLink
            to="/notifications"
            className={({ isActive }) => cn(isActive && "data-[active=true]")}
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const AppSidebarManagement = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <>
      <SidebarSeparator />
      <SidebarGroup>
        <SidebarGroupLabel>Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {isAdmin && (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dropdown Management">
                    <NavLink
                      to="/manage/dropdowns"
                      className={({ isActive }) => cn(isActive && "data-[active=true]")}
                    >
                      <Database className="h-5 w-5" />
                      <span>Dropdown Management</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="User Management">
                    <NavLink
                      to="/manage/users"
                      className={({ isActive }) => cn(isActive && "data-[active=true]")}
                    >
                      <Users className="h-5 w-5" />
                      <span>User Management</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Address Settings">
                    <NavLink
                      to="/address-settings"
                      className={({ isActive }) => cn(isActive && "data-[active=true]")}
                    >
                      <Mail className="h-5 w-5" />
                      <span>Address Settings</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

const NewAppSidebar = () => {
  const { user } = useAuth();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2">
          <div className="h-6 w-6 bg-blue-500 rounded-md"></div>
          <h1 className="text-lg font-bold">Swift Flow</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <AppSidebarMenu />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <AppSidebarManagement />
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2 text-sm text-muted-foreground">
          {user && <p>Logged in as: {user.email}</p>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default NewAppSidebar;
