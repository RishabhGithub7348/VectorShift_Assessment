"use client";

import { useIntegrationContext } from "@/context/integration-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, FileText, Users, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

const integrationIcons = {
  notion: FileText,
  airtable: Database,
  hubspot: Users,
};

export function IntegrationList() {
  const pathname = usePathname();
  const { integrations } = useIntegrationContext();
  const [client, setClient] = useState(false);
  const integrationsList = ["Notion", "Airtable", "HubSpot"];

  // Get connected count from actual integrations object
  const connectedIntegrations = Object.values(integrations).filter((int) => int.isConnected).length;

  useEffect(() => {
    setClient(true)
  },[])

  return (
   
      client && (
       <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Integrations
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your connected services
          </p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6 bg-gradient-to-br from-indigo-50 py-1 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  Connected
                </p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                  {connectedIntegrations}/{integrationsList.length}
                </p>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integration List */}
        <nav className="space-y-3">
          {integrationsList.map((int) => {
            const integrationKey = int.toLowerCase();
            
            // Check connection status from the integrations context
            // Look for the integration by matching the type or key
            const integrationData = integrations[integrationKey] || 
                                   Object.values(integrations).find(integration => 
                                     integration.type.toLowerCase() === integrationKey ||
                                     integration.type.toLowerCase() === int.toLowerCase()
                                   );
            
            const isConnected = integrationData?.isConnected || false;
            
            // Check if this integration tab is currently active
            const isActive = pathname?.includes(`/${integrationKey}`) || 
                             pathname === `/${integrationKey}` ||
                             pathname?.startsWith(`/${integrationKey}/`);
            
            const IconComponent = integrationIcons[integrationKey as keyof typeof integrationIcons];

            // Determine styling priority: Active > Connected > Disconnected
            const getCardStyling = () => {
              if (isActive) {
                return "bg-indigo-600 text-white shadow-lg border-indigo-600";
              } else if (isConnected) {
                return "bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 border-green-200 dark:border-green-800";
              } else {
                return "bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 border-red-200 dark:border-red-800";
              }
            };

            const getIconContainerStyling = () => {
              if (isActive) {
                return "bg-white/20";
              } else if (isConnected) {
                return "bg-green-100 dark:bg-green-900/50";
              } else {
                return "bg-red-100 dark:bg-red-900/50";
              }
            };

            const getIconStyling = () => {
              if (isActive) {
                return "text-white";
              } else if (isConnected) {
                return "text-green-600 dark:text-green-400";
              } else {
                return "text-red-600 dark:text-red-400";
              }
            };

            const getTextStyling = () => {
              if (isActive) {
                return "text-white";
              } else if (isConnected) {
                return "text-green-900 dark:text-green-100";
              } else {
                return "text-red-900 dark:text-red-100";
              }
            };

            const getBadgeStyling = () => {
              if (isActive) {
                return "bg-white/20 text-white border-white/20";
              } else if (isConnected) {
                return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200";
              } else {
                return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200";
              }
            };

            const getStatusIconStyling = () => {
              if (isActive) {
                return "text-white";
              } else if (isConnected) {
                return "text-green-600 dark:text-green-400";
              } else {
                return "text-red-600 dark:text-red-400";
              }
            };

            return (
              <Link
                key={int}
                href={`/${integrationKey}`}
                className={`block transition-all duration-200 transform hover:scale-[1.02] ${
                  isActive ? "scale-[1.02]" : ""
                }`}
              >
                <Card className={`cursor-pointer transition-all duration-200 ${getCardStyling()}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getIconContainerStyling()}`}>
                          <IconComponent className={`h-5 w-5 ${getIconStyling()}`} />
                        </div>
                        <span className={`font-semibold ${getTextStyling()}`}>
                          {int}
                        </span>
                      </div>
                      {isConnected ? (
                        <CheckCircle className={`h-5 w-5 ${getStatusIconStyling()}`} />
                      ) : (
                        <XCircle className={`h-5 w-5 ${getStatusIconStyling()}`} />
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getBadgeStyling()}`}
                    >
                      {isConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
      )
    
    
  );
}