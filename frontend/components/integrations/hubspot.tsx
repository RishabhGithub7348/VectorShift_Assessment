"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthorizeHubSpot, useGetHubSpotCredentials, useGetHubSpotItems } from "@/providers/hubspot";
import { useIntegrationContext } from "@/context/integration-context";

// Define the props interface
interface HubSpotIntegrationProps {
  user: string;
  org: string;
}

export const HubSpotIntegration = ({ user, org }: HubSpotIntegrationProps) => {
  const { integrations, setIntegrationState } = useIntegrationContext();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
 
  // React Query Hooks
  const { mutateAsync: authorizeMutation, isPending: isAuthorizePending } = useAuthorizeHubSpot();
  const { data: credentials, refetch: refetchCredentials } = useGetHubSpotCredentials(user, org);
  const { data: items } = useGetHubSpotItems(credentials || null);

  const handleConnectClick = async () => {
    try {
      setIsConnecting(true);
      const response = await authorizeMutation({ user_id: user, org_id: org });
      console.log("Authorization URL:", response.auth_url);
      const newWindow = window.open(response.auth_url, "HubSpot Authorization", "width=600,height=600");

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
      const currentState = integrations["HubSpot"] || { type: "HubSpot", isConnected: false };
      const newState = {
        access_token: credentials.access_token,
        type: "HubSpot",
        isConnected: true,
      };
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        setIntegrationState("HubSpot", newState);
      }
    } else if (integrations["HubSpot"]?.access_token) {
      const currentState = integrations["HubSpot"];
      const newState = {
        ...currentState,
        isConnected: !!currentState.access_token,
      };
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        setIntegrationState("HubSpot", newState);
      }
    }
  }, [credentials]);

  useEffect(() => {
    console.log("HubSpot Items:", items);
  }, [items]);

  return (
    <div className="mt-2">
      <p className="font-semibold">Parameters</p>
      <div className="mt-2 flex justify-center">
        <Button
          variant="default"
          onClick={integrations["HubSpot"]?.isConnected ? () => {} : handleConnectClick}
          disabled={isConnecting || isAuthorizePending}
          className={integrations["HubSpot"]?.isConnected ? "bg-green-500 text-white" : ""}
        >
          {integrations["HubSpot"]?.isConnected
            ? "HubSpot Connected"
            : isConnecting || isAuthorizePending
            ? "Connecting..."
            : "Connect to HubSpot"}
        </Button>
      </div>
    </div>
  );
};