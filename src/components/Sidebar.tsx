
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  List,
  Menu
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, icon, label, collapsed, onClick }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => 
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group text-sm",
          isActive 
            ? "bg-sidebar-accent text-sidebar-accent-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )
      }
    >
      <div className="flex min-w-[20px] items-center justify-center text-sidebar-foreground">
        {icon}
      </div>
      {!collapsed && (
        <span className="animate-slide-in font-medium">{label}</span>
      )}
    </NavLink>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/agent-management', icon: <Users size={20} />, label: 'AI Agents' },
    { to: '/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/products', icon: <List size={20} />, label: 'Products' },
    { to: '/chat-logs', icon: <MessageSquare size={20} />, label: 'Chat Logs' },
  ];

  // Mobile sidebar
  const MobileSidebar = () => (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-sidebar-border">
            <div className="text-lg font-bold text-sidebar-foreground">AI Sales CRM</div>
          </div>
          
          <div className="flex-1 p-3 space-y-1 overflow-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={closeMobile}
              />
            ))}
          </div>
          
          <div className="p-3 border-t border-sidebar-border">
            <NavItem
              to="/settings"
              icon={<Users size={20} />}
              label="Settings"
              onClick={closeMobile}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div
      className={cn(
        "hidden md:flex h-screen flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        {!collapsed && (
          <div className="text-lg font-bold text-sidebar-foreground">AI Sales CRM</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapse}
          className={cn(
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "mx-auto" : ""
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      <div className="flex-1 p-3 space-y-1 overflow-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </div>

      <div className="p-3 border-t border-sidebar-border">
        <NavItem
          to="/settings"
          icon={<Users size={20} />}
          label="Settings"
          collapsed={collapsed}
        />
      </div>
    </div>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
};

export default Sidebar;
