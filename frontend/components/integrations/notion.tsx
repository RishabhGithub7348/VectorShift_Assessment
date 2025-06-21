"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthorizeNotion, useGetNotionCredentials, useGetNotionItems } from "@/providers/notion";
import { useIntegrationContext } from "@/context/integration-context";

// Define the props interface
interface NotionIntegrationProps {
  user: string;
  org: string;
}

export const NotionIntegration = ({ user, org }: NotionIntegrationProps) => {
  const { integrations, setIntegrationState } = useIntegrationContext();
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  // React Query Hooks
  const { mutateAsync: authorizeMutation, isPending: isAuthorizePending } = useAuthorizeNotion();
  const { data: credentials, refetch: refetchCredentials } = useGetNotionCredentials(user, org);
  const { data: items } = useGetNotionItems(credentials || null);

  const handleConnectClick = async () => {
    try {
      setIsConnecting(true);
      const response = await authorizeMutation({ user_id: user, org_id: org });
      console.log("Authorization URL:", response.auth_url);
      const newWindow = window.open(response.auth_url, "Notion Authorization", "width=600,height=600");

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
      const currentState = integrations["Notion"] || { type: "Notion", isConnected: false };
      const newState = {
        access_token: credentials.access_token,
        type: "Notion",
        isConnected: true,
      };
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        setIntegrationState("Notion", newState);
      }
    } else if (integrations["Notion"]?.access_token) {
      const currentState = integrations["Notion"];
      const newState = {
        ...currentState,
        isConnected: !!currentState.access_token,
      };
      if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
        setIntegrationState("Notion", newState);
      }
    }
  }, [credentials]);

  useEffect(() => {
    console.log("Notion Items:", items);
  }, [items]);

  return (
    <div className="mt-2">
      <p className="font-semibold">Parameters</p>
      <div className="mt-2 flex justify-center">
        <Button
          variant="default"
          onClick={integrations["Notion"]?.isConnected ? () => {} : handleConnectClick}
          disabled={isConnecting || isAuthorizePending}
          className={integrations["Notion"]?.isConnected ? "bg-green-500 text-white" : ""}
        >
          {integrations["Notion"]?.isConnected
            ? "Notion Connected"
            : isConnecting || isAuthorizePending
            ? "Connecting..."
            : "Connect to Notion"}
        </Button>
      </div>
    </div>
  );
};