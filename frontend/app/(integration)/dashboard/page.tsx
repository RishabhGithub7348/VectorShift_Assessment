import { IntegrationForm } from "@/components/integration-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Zap, Database } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Integration Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Connect and manage your external integrations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Integration Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white py-5 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Setup New Integration
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure your integration settings below
                </p>
              </CardHeader>
              <CardContent>
                <IntegrationForm />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Stats and Info */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white py-4 dark:bg-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Available Integrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Notion</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Available
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Airtable</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Available
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">HubSpot</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Available
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br py-4  from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border-indigo-200 dark:border-indigo-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100">
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                  Choose an integration type to get started. Each integration will show specific configuration options.
                </p>
                <div className="text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
                  <div>• Fill in your user and organization details</div>
                  <div>• Select your preferred integration</div>
                  <div>• Configure the specific settings</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}