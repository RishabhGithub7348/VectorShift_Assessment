import { useGetHubSpotItems } from "@/providers/hubspot";
import { useGetAirtableItems } from "@/providers/airtable";
import { useGetNotionItems } from "@/providers/notion";
import { UseQueryResult } from "@tanstack/react-query";
import { IntegrationCredentials, IntegrationItem } from "@/types/integration.types";

export function useGetIntegrationItems(
  type: string | undefined,
  credentials: IntegrationCredentials
): UseQueryResult<IntegrationItem[], Error> {
  // Call all hooks unconditionally
  const hubspotQuery = useGetHubSpotItems(credentials);
  const airtableQuery = useGetAirtableItems(credentials);
  const notionQuery = useGetNotionItems(credentials);

  // Return the appropriate query result based on type
  if (!type) {
    throw new Error("Integration type is required");
  }

  switch (type.toLowerCase()) {
    case "hubspot":
      return hubspotQuery;
    case "airtable":
      return airtableQuery;
    case "notion":
      return notionQuery;
    default:
      throw new Error("Unsupported integration type");
  }
}