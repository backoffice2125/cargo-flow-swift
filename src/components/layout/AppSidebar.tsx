
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  Home, 
  Package, 
  Settings, 
  Bell, 
  ChevronDown, 
  FilePlus, 
  Database,
  Mail,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const AppSidebar = () => {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-blue-500 rounded-md"></div>
          <h1 className="text-xl font-bold">Swift Flow</h1>
        </div>

        <nav className="mt-8 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )
            }
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink
            to="/shipments/new"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )
            }
          >
            <FilePlus className="h-5 w-5" />
            <span>New Shipment</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              )
            }
          >
            <Bell className="h-5 w-5" />
            <span>Notifications</span>
          </NavLink>

          {/* Management Section */}
          <div className="pt-4">
            <div className="flex items-center px-3 mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Management
              </span>
            </div>

            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between px-3 py-2 rounded-md text-gray-700 dark:text-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem asChild>
                    <NavLink to="/manage/dropdowns" className="w-full cursor-pointer">
                      <Database className="mr-2 h-4 w-4" />
                      <span>Dropdown Management</span>
                    </NavLink>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <NavLink to="/address-settings" className="w-full cursor-pointer">
                      <Mail className="mr-2 h-4 w-4" />
                      <span>Address Settings</span>
                    </NavLink>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <NavLink to="/manage/users" className="w-full cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      <span>User Management</span>
                    </NavLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AppSidebar;
