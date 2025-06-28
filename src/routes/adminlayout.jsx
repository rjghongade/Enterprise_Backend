import { Outlet } from "react-router-dom";
import { useMediaQuery } from "@uidotdev/usehooks";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/utils/cn";
import { useEffect, useRef, useState } from "react";
import { AdminSidebar } from "../layouts/adminsidebar";
import { AdminHeader } from "../layouts/adminheader";



const AdminLayout = () => {
  const isDesktopDevice = useMediaQuery("(min-width: 768px)");
  const [collapsed, setCollapsed] = useState(!isDesktopDevice);
  const sidebarRef = useRef(null);

  useEffect(() => {
    setCollapsed(!isDesktopDevice);
  }, [isDesktopDevice]);

  useClickOutside([sidebarRef], () => {
    if (!isDesktopDevice && !collapsed) {
      setCollapsed(true);
    }
  });

  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950">
      <div
        className={cn(
          "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
          !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30"
        )}
      />
      <AdminSidebar ref={sidebarRef} collapsed={collapsed} />
      <div className={cn("transition-[margin] duration-300", collapsed ? "md:ml-[70px]" : "md:ml-[240px]")}>
        <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
