import {
  ShieldCheck,
  Zap,
  Activity,
  Monitor,
  Radar,
  Cpu,
  Brain,
  Settings,
  Users,
  Database,
  GaugeCircle,
  Usb,
  SearchCheck,
} from "lucide-react";

export const adminnavbarLinks = [
  {
    title: "Dashboard",
    links: [
      {
        label: "Admin Dashboard",
        fullLabel: "Main Dashboard",
        icon: GaugeCircle,
        path: "/admindashboard",

      },
      {
        label: "SIEM",
        fullLabel: "Security Information and Event Management",
        icon: ShieldCheck,
        path: "/adminsiem",
      },
      {
        label: "SOAR",
        fullLabel: "Security Orchestration, Automation and Response",
        icon: Zap,
        path: "/adminanalytics",
      },
      {
        label: "XDR",
        fullLabel: "Extended Detection and Response",
        icon: Activity,
        path: "/adminreports",
      },
      {
        label: "EDR",
        fullLabel: "Endpoint Detection and Response",
        icon: Monitor,
        path: "/admincustomers",
      },
      {
        label: "NDR",
        fullLabel: "Network Detection and Response",
        icon: Radar,
        path: "/adminnew-customer",
      },
      {
        label: "UEBA",
        fullLabel: "User and Entity Behavior Analytics",
        icon: Users,
        path: "/adminverified-customers",
      },
      {
        label: "Threat Intelligence",
        fullLabel: "Threat Intelligence Analysis",
        icon: SearchCheck,
        path: "/adminnew-product",
      },
      {
        label: "Machine Learning",
        fullLabel: "Machine Learning Security Analytics",
        icon: Brain,
        path: "/admininventory",
      },
      {
        label: "Database",
        fullLabel: "Live Database",
        icon: Database,
        path: "/admindatabse",
      },
      {
        label: "PC Performance",
        fullLabel: "Performance Metrics & Monitoring",
        icon: GaugeCircle,
        path: "/adminpcperformance",
      },
      {
        label: "USB Logs",
        fullLabel: "USB Scan Log Reports",
        icon: Usb,
        path: "/usb",
      },
    ],
  },
];
