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

export const navbarLinks = [
  {
    title: "Dashboard",
    links: [
      {
        label: "Dashboard",
        fullLabel: "Main Dashboard",
        icon: GaugeCircle,
        path: "/dashboard",
      },
      {
        label: "SIEM",
        fullLabel: "Security Information and Event Management",
        icon: ShieldCheck,
        path: "/siem",
      },
      {
        label: "SOAR",
        fullLabel: "Security Orchestration, Automation and Response",
        icon: Zap,
        path: "/analytics",
      },
      {
        label: "XDR",
        fullLabel: "Extended Detection and Response",
        icon: Activity,
        path: "/reports",
      },
      {
        label: "EDR",
        fullLabel: "Endpoint Detection and Response",
        icon: Monitor,
        path: "/customers",
      },
      {
        label: "NDR",
        fullLabel: "Network Detection and Response",
        icon: Radar,
        path: "/new-customer",
      },
      {
        label: "UEBA",
        fullLabel: "User and Entity Behavior Analytics",
        icon: Users,
        path: "/verified-customers",
      },
      {
        label: "Threat Intelligence",
        fullLabel: "Threat Intelligence Analysis",
        icon: SearchCheck,
        path: "/new-product",
      },
      {
        label: "Machine Learning",
        fullLabel: "Machine Learning Security Analytics",
        icon: Brain,
        path: "/inventory",
      },
      {
        label: "Database",
        fullLabel: "Live Database",
        icon: Database,
        path: "/databse",
      },
      {
        label: "PC Performance",
        fullLabel: "Performance Metrics & Monitoring",
        icon: GaugeCircle,
        path: "/pcperformance",
      },
      {
        label: "USB Logs",
        fullLabel: "USB Scan Log Reports",
        icon: Usb,
        path: "/usb1",
      },
    ],
  },
];
