import { useLocation } from "@remix-run/react";
import { LucideProps } from "lucide-react";
import React from "react";

export default function UriTabs({
  tabs,
}: {
  tabs: {
    path: string;
    label: string;
    icon: React.ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
  }[];
}) {
  const location = useLocation();
  return (
    <div className="flex space-x-2 mb-6 overflow-scroll">
      {tabs.map(({ path, label, icon: Icon }) => (
        <a
          key={path}
          href={path}
          className={`
          flex items-center px-4 py-2 rounded-lg flex-1 
          justify-center transition-colors
          ${
            location.pathname === path
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : ""
          }
        `}
        >
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </a>
      ))}
    </div>
  );
}
