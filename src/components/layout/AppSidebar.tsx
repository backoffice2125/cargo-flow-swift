
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Truck, Package, Users, Settings, Database, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  {
    name: "Home",
    icon: Home,
    path: "/",
  },
  {
    name: "Shipments",
    icon: Truck,
    path: "/shipments",
  },
  {
    name: "Shipment Details",
    icon: Package,
    path: "/shipment-details",
  },
  {
    name: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    name: "Dropdown Management",
    icon: Database,
    path: "/dropdown-management",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

const AppSidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="h-screen w-64 bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-xl font-bold text-white">Swift Logistics</h1>
      </div>
      <nav className="flex-1 px-4 py-2">
        <ul className="space-y-2">
          {sidebarLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition-colors",
                  location.pathname === link.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-md font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50">
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
