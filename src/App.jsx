import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import SIEM from "./routes/dashboard/SIEM";
import SOAR from "./routes/dashboard/Soar";
import XDR from "./routes/dashboard/XDR";
import ThreatIntelligence from "./routes/dashboard/ThreatIntelligence";
import MachineLearningSecurity from "./routes/dashboard/MachineLearningSecurity";
import MyAccount from "./routes/dashboard/MyAccount";
import EDR from "./routes/dashboard/EDR";
import NDR from "./routes/dashboard/NDR";
import UEBA from "./routes/dashboard/UEBA";
import Notification from "./routes/dashboard/Notifaction";
import Settings from "./routes/dashboard/Settings";
import Login from "./routes/dashboard/login";
import ProtectedRoute from "./layouts/ProtectedRoute";
import AdminLayout from "./routes/adminlayout";
import AdminDashboard from "./routes/admindashbord/AdminDashboard";
import ADMINSIEM from "./routes/admindashbord/SIEM";
import ADMINSOAR from "./routes/admindashbord/Soar";
import ADMINXDR from "./routes/admindashbord/XDR";
import ADMINEDR from "./routes/admindashbord/EDR";
import ADMINUEBA from "./routes/admindashbord/ueba";
import ADMINNDR from "./routes/admindashbord/NDR";
import ADMINThreatIntelligence from "./routes/admindashbord/threatIntelligence";
import ADMINMachineLearningSecurity from "./routes/admindashbord/machineLearningSecurity";
import ADMINMyAccount from "./routes/admindashbord/myaccount";
import ADMINNotification from "./routes/admindashbord/Notifaction";
import ADMINSettings from "./routes/admindashbord/Settings";
import Dashboard from "./routes/dashboard/Dashbord";
import Database from "./routes/admindashbord/Database";
import PcPerformance from "./routes/admindashbord/PcPerformance";
import USBLog from "./routes/admindashbord/usb";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["user", "admin"]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "siem", element: <SIEM /> },
      { path: "analytics", element: <SOAR /> },
      { path: "reports", element: <XDR /> },
      { path: "customers", element: <EDR /> },
      { path: "verified-customers", element: <UEBA /> },
      { path: "new-customer", element: <NDR /> },
      { path: "new-product", element: <ThreatIntelligence /> },
      { path: "inventory", element: <MachineLearningSecurity /> },
      { path: "account", element: <MyAccount /> },
      { path: "notification", element: <Notification /> },
      { path: "databse", element: <Database/> },
      { path: "pcperformance", element: <PcPerformance/> },
      { path: "usb1", element: <USBLog/> },
      { path: "setting", element: <Settings /> },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute allowedRoles={["user", "admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [

      { path: "admindashboard", element: <AdminDashboard /> },
      { path: "/dashboard/user/:userId", element: <Dashboard /> },
      { path: "adminsiem", element: <ADMINSIEM /> },
      { path: "adminanalytics", element: <ADMINSOAR /> },
      { path: "adminreports", element: <ADMINXDR /> },
      { path: "admincustomers", element: <ADMINEDR /> },
      { path: "adminverified-customers", element: <ADMINUEBA /> },
      { path: "adminnew-customer", element: <ADMINNDR /> },
      { path: "adminnew-product", element: <ADMINThreatIntelligence /> },
      { path: "admininventory", element: <ADMINMachineLearningSecurity /> },
      { path: "adminaccount", element: <ADMINMyAccount /> },
      { path: "adminnotification", element: <ADMINNotification /> },
      { path: "adminsetting", element: <ADMINSettings /> },
      { path: "admindatabse", element: <Database/> },
      { path: "adminpcperformance", element: <PcPerformance/> },
      { path: "usb", element: <USBLog/> },
      { path: "/dashboard/user/:userId", element: <Dashboard /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider storageKey="theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;