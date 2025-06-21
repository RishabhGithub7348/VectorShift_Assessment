"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetIntegrationItems } from "@/hooks/useGetIntegrationItems";
import { IntegrationItem } from "@/types/integration.types";
import { useIntegrationContext } from "@/context/integration-context";
import { RefreshCw, Database, AlertCircle, CheckCircle, FileText, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const integrationIcons = {
  notion: FileText,
  airtable: Database,
  hubspot: Users,
};

export default function IntegrationPage() {
  const { type } = useParams<{ type: string }>();
  const { integrations } = useIntegrationContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Validate and normalize type
  const normalizedType = type?.toLowerCase() as keyof typeof integrationIcons;
  const currentIntegration = integrations[normalizedType] || 
    Object.values(integrations).find(integration => 
      integration.type.toLowerCase() === normalizedType
    );
  const IconComponent = integrationIcons[normalizedType] || Database;

  // Use the custom hook to get items based on type and credentials
  const { data: itemsQuery, refetch, isLoading, error } = useGetIntegrationItems(normalizedType, { 
    access_token: currentIntegration?.access_token 
  });

  const items: IntegrationItem[] = itemsQuery
    ? itemsQuery?.map((item: IntegrationItem) => ({
        ...item,
        creation_time: new Date(item.creation_time),
        last_modified_time: new Date(item.last_modified_time),
      }))
    : [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const capitalizedType = normalizedType ? 
    normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1) : "Unknown";

  // Styling functions for consistency
  const getBadgeVariant = () => currentIntegration?.isConnected ? "default" : "destructive";
  const getStatusIcon = () => currentIntegration?.isConnected ? CheckCircle : AlertCircle;
  const getStatsCardBg = (index: number) => 
    index === 0 ? "bg-indigo-50 dark:bg-indigo-950/30" : "bg-green-50 dark:bg-green-950/30";
  const getStatsTextColor = (index: number) => 
    index === 0 ? "text-indigo-600 dark:text-indigo-400" : "text-green-600 dark:text-green-400";

  // Get the status icon component
  const StatusIcon = getStatusIcon();

  // Debugging: Log the items to verify data
  console.log("Items received:", items);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <IconComponent className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {capitalizedType} Integration
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and view your {capitalizedType} data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getBadgeVariant()} className="px-3 py-1">
              {currentIntegration?.isConnected ? (
                <>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <StatusIcon className="h-4 w-4 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
              variant="outline"
              className="bg-white dark:bg-gray-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-white dark:bg-gray-800 py-4 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`text-center p-4 ${getStatsCardBg(0)} rounded-lg`}>
                  <div className={`text-3xl font-bold ${getStatsTextColor(0)}`}>
                    {items.length}
                  </div>
                  <div className="text-sm text-indigo-700 dark:text-indigo-300">
                    Total Items
                  </div>
                </div>
                <div className={`text-center p-4 ${getStatsCardBg(1)} rounded-lg`}>
                  <div className={`text-3xl font-bold ${getStatsTextColor(1)}`}>
                    {currentIntegration?.isConnected ? '1' : '0'}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Connections
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Items List */}
          <div className="lg:col-span-3">
            <Card className="bg-white dark:bg-gray-800 shadow-sm py-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Items from {capitalizedType}</span>
                  <Badge variant="outline" className="ml-2">
                    {items.length} items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Error Loading Items
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {(error as Error).message}
                    </p>
                    <Button onClick={handleRefresh} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Items Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No items were found in your {capitalizedType} integration.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <IconComponent className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {item.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {item.id} • Type: {item.type} • Created: {item.creation_time.toISOString()} • Modified: {item.last_modified_time.toISOString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}