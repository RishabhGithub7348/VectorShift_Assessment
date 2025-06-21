import { frontendAxios } from "@/config/axios";
import { IntegrationItem, IntegrationAuthorizeUrl, IntegrationCredentials } from "@/types/integration.types";
import { ApiResponse } from "@/types/request_response.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance, AxiosResponse } from "axios";

/**
 * Initiates Airtable OAuth authorization.
 * @param data The authorization request data (user_id, org_id).
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the authorization URL.
 */
export const authorizeAirtable = async (
  data: { user_id: string; org_id: string },
  axiosInstance: AxiosInstance = frontendAxios
): Promise<IntegrationAuthorizeUrl> => {
  try {
    const formData = new FormData();
    formData.append("user_id", data.user_id);
    formData.append("org_id", data.org_id);
    const response = await axiosInstance.post<
      FormData,
      AxiosResponse<ApiResponse<IntegrationAuthorizeUrl>>
    >("/integrations/airtable/authorize", formData);
    return response.data.data || {};
  } catch (error) {
    console.error("Error authorizing Airtable:", error);
    throw error;
  }
};

/**
 * Fetches Airtable credentials after OAuth callback.
 * @param data The credential request data (user_id, org_id).
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the credentials.
 */
export const getAirtableCredentials = async (
  data: { user_id: string; org_id: string },
  axiosInstance: AxiosInstance = frontendAxios
): Promise<IntegrationCredentials> => {
  try {
    const formData = new FormData();
    formData.append("user_id", data.user_id);
    formData.append("org_id", data.org_id);
    const response = await axiosInstance.post<
      FormData,
      AxiosResponse<ApiResponse<IntegrationCredentials>>
    >("/integrations/airtable/credentials", formData);
    return response.data.data || {};
  } catch (error) {
    console.error("Error fetching Airtable credentials:", error);
    throw error;
  }
};

/**
 * Fetches Airtable items using credentials.
 * @param credentials The integration credentials.
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to an array of IntegrationItem objects.
 */
export const getAirtableItems = async (
  credentials: IntegrationCredentials,
  axiosInstance: AxiosInstance = frontendAxios
): Promise<IntegrationItem[]> => {
  try {
    const formData = new FormData();
    formData.append("credentials", JSON.stringify(credentials));
    const response = await axiosInstance.post<
      FormData,
      AxiosResponse<ApiResponse<IntegrationItem[]>>
    >("/integrations/airtable/items", formData);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching Airtable items:", error);
    throw error;
  }
};

/**
 * Hook to initiate Airtable OAuth authorization.
 * @returns A React Query mutation instance to authorize Airtable.
 */
export const useAuthorizeAirtable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_id: string; org_id: string }) =>
      authorizeAirtable(data, frontendAxios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["airtableCredentials"] });
    },
  });
};

/**
 * Hook to fetch Airtable credentials.
 * @param userId The user ID.
 * @param orgId The organization ID.
 * @returns A React Query instance for Airtable credentials.
 */
export const useGetAirtableCredentials = (userId: string | null, orgId: string | null) => {
  return useQuery<IntegrationCredentials, Error>({
    queryKey: ["airtableCredentials", userId, orgId],
    queryFn: () => {
      if (!userId || !orgId) throw new Error("User ID and Org ID are required");
      return getAirtableCredentials({ user_id: userId, org_id: orgId }, frontendAxios);
    },
    enabled: !!userId && !!orgId,
  });
};

/**
 * Hook to fetch Airtable items.
 * @param credentials The integration credentials.
 * @returns A React Query instance for Airtable items.
 */
export const useGetAirtableItems = (credentials: IntegrationCredentials | null) => {
  return useQuery<IntegrationItem[], Error>({
    queryKey: ["airtableItems", credentials],
    queryFn: () => {
      if (!credentials?.access_token) throw new Error("Access token is required");
      return getAirtableItems(credentials, frontendAxios);
    },
    enabled: !!credentials?.access_token,
    initialData: [],
  });
};