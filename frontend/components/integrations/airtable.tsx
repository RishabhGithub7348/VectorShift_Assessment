"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthorizeAirtable, useGetAirtableCredentials, useGetAirtableItems } from "@/providers/airtable";
import { useIntegrationContext } from "@/context/integration-context";

// Define the props interface
interface AirtableIntegrationProps {
  user: string;
  org: string;
}

export const AirtableIntegration = ({ user, org }: AirtableIntegrationProps) => {
  const { integrations, setIntegrationState } = useIntegrationContext();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // React Query Hooks
  const { mutateAsync: authorizeMutation, isPending: isAuthorizePending } = useAuthorizeAirtable();
  const { data: credentials, refetch: refetchCredentials } = useGetAirtableCredentials(user, org);
  const { data: items } = useGetAirtableItems(credentials || null);

  const handleConnectClick = async () => {
    try {
      setIsConnecting(true);
      const response = await authorizeMutation({ user_id: user, org_id: org });
      console.log("Authorization URL:", response.auth_url);
      const newWindow = window.open(response.auth_url, "Airtable Authorization", "width=600,height=600");

      if (newWindow) {
        const checkWindow = setInterval(() => {
          if (newWindow.closed) {
            clearInterval(checkWindow);
            setIsConnecting(false);
            // Refetch credentials after window closes
            refetchCredentials().then(() => {
              console.log("Credentials refetched after authorization");
            }).catch((error) => {
              console.error("Error refetching credentials:", error);
            });
          }
        }, 200);
      }
    } catch (error) {
      setIsConnecting(false);
      console.error("Connection failed:", error);
    }
  };

  useEffect(() => {
    if (credentials?.access_token) {
      const currentState = integrations["Airtable"] || { type: "Airtable", isConnected: false };
      const newState = {
        access_token: credentials.access_token,
        type: "Airtable",
        isConnected: true,
      };
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        setIntegrationState("Airtable", newState);
      }
    } else if (integrations["Airtable"]?.access_token) {
      const currentState = integrations["Airtable"];
      const newState = {
        ...currentState,
        isConnected: !!currentState.access_token,
      };
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        setIntegrationState("Airtable", newState);
      }
    }
  }, [credentials]);

  useEffect(() => {
    console.log("Airtable Items:", items);
  }, [items]);

  return (
    <div className="mt-2">
      <p className="font-semibold">Parameters</p>
      <div className="mt-2 flex justify-center">
        <Button
          variant="default"
          onClick={integrations["Airtable"]?.isConnected ? () => {} : handleConnectClick}
          disabled={isConnecting || isAuthorizePending}
          className={integrations["Airtable"]?.isConnected ? "bg-green-500 text-white" : ""}
        >
          {integrations["Airtable"]?.isConnected
            ? "Airtable Connected"
            : isConnecting || isAuthorizePending
            ? "Connecting..."
            : "Connect to Airtable"}
        </Button>
      </div>
    </div>
  );
};