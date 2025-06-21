"use client"; 

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createContext, useContext, ReactNode, useCallback } from "react";

interface IntegrationState {
  access_token?: string;
  type: string;
  isConnected: boolean;
}

interface IntegrationContextType {
  integrations: Record<string, IntegrationState>;
  setIntegrationState: (integrationType: string, state: Partial<IntegrationState>) => void;
}

const IntegrationContext = createContext<IntegrationContextType | undefined>(undefined);

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [integrations, setIntegrations] = useLocalStorage<Record<string, IntegrationState>>(
    "integrations",
    {}
  );

  const setIntegrationState = useCallback(
    (integrationType: string, state: Partial<IntegrationState>) => {
      setIntegrations((prev) => {
        const currentState = prev[integrationType] || { type: integrationType, isConnected: false };
        const newState = { ...currentState, ...state };
        return JSON.stringify(currentState) !== JSON.stringify(newState)
          ? {
              ...prev,
              [integrationType]: newState,
            }
          : prev;
      });
    },
    [setIntegrations]
  );

  return (
    <IntegrationContext.Provider value={{ integrations, setIntegrationState }}>
      {children}
    </IntegrationContext.Provider>
  );
}

export function useIntegrationContext() {
  const context = useContext(IntegrationContext);
  if (!context) {
    throw new Error("useIntegrationContext must be used within an IntegrationProvider");
  }
  return context;
}