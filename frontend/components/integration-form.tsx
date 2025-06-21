"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { User, Building, Plug } from "lucide-react";
import { NotionIntegration } from "./integrations/notion";
import { AirtableIntegration } from "./integrations/airtable";
import { HubSpotIntegration } from "./integrations/hubspot";

const integrationMapping = {
  Notion: NotionIntegration,
  Airtable: AirtableIntegration,
  HubSpot: HubSpotIntegration,
} as const;

type IntegrationType = keyof typeof integrationMapping;

export const IntegrationForm = () => {
  const [user, setUser] = useState<string>("TestUser");
  const [org, setOrg] = useState<string>("TestOrg");
  const [currType, setCurrType] = useState<IntegrationType | null>(null);

  const CurrIntegration = currType ? integrationMapping[currType] : null;

  const handleTypeChange = (value: string) => {
    setCurrType(value === "" ? null : (value as IntegrationType));
  };


  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="user" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <User className="h-4 w-4" />
            User
          </label>
          <Input
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Enter your username"
            className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="org" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Organization
          </label>
          <Input
            id="org"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            placeholder="Enter organization name"
            className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Integration Type Selection */}
      <div className="space-y-2">
        <label htmlFor="integrationType" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Plug className="h-4 w-4" />
          Integration Type
        </label>
        <Select onValueChange={handleTypeChange} value={currType || undefined}>
          <SelectTrigger
            id="integrationType"
            className="h-11 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
          >
            <SelectValue placeholder="Choose an integration platform" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(integrationMapping).map((type) => (
              <SelectItem key={type} value={type} className="focus:bg-indigo-50 dark:focus:bg-indigo-900/20">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Dynamic Integration Component */}
      {currType && CurrIntegration && (
        <Card className="border-2 border-dashed border-indigo-200 py-4 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                {currType} Configuration
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Configure your {currType} integration settings below
              </p>
            </div>
            <CurrIntegration
              user={user}
              org={org}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};