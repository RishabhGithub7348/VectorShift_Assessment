import { frontendAxios } from "@/config/axios";
import { IntegrationItem, IntegrationAuthorizeUrl, IntegrationCredentials } from "@/types/integration.types"; // Adjust imports based on your types file
import { ApiResponse } from "@/types/request_response.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance, AxiosResponse } from "axios";

/**
 * Initiates HubSpot OAuth authorization.
 * @param data The authorization request data (user_id, org_id).
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the authorization URL.
 */
export const authorizeHubSpot = async (
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
    >("/integrations/hubspot/authorize", formData);
    return response.data.data || {};
  } catch (error) {
    console.error("Error authorizing HubSpot:", error);
    throw error;
  }
};

/**
 * Fetches HubSpot credentials after OAuth callback.
 * @param data The credential request data (user_id, org_id).
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the credentials.
 */
export const getHubSpotCredentials = async (
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
    >("/integrations/hubspot/credentials", formData);
    return response.data.data || {};
  } catch (error) {
    console.error("Error fetching HubSpot credentials:", error);
    throw error;
  }
};

/**
 * Fetches HubSpot items using credentials.
 * @param credentials The integration credentials.
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to an array of IntegrationItem objects.
 */
export const getHubSpotItems = async (
  credentials: IntegrationCredentials,
  axiosInstance: AxiosInstance = frontendAxios
): Promise<IntegrationItem[]> => {
  try {
    const formData = new FormData();
    formData.append("credentials", JSON.stringify(credentials));
    const response = await axiosInstance.post<
      FormData,
      AxiosResponse<ApiResponse<IntegrationItem[]>>
    >("/integrations/hubspot/items", formData);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching HubSpot items:", error);
    throw error;
  }
};

/**
 * Hook to initiate HubSpot OAuth authorization.
 * @returns A React Query mutation instance to authorize HubSpot.
 */
export const useAuthorizeHubSpot = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_id: string; org_id: string }) =>
      authorizeHubSpot(data, frontendAxios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hubspotCredentials"] });
    },
  });
};

/**
 * Hook to fetch HubSpot credentials.
 * @param userId The user ID.
 * @param orgId The organization ID.
 * @returns A React Query instance for HubSpot credentials.
 */
export const useGetHubSpotCredentials = (userId: string | null, orgId: string | null) => {
  return useQuery<IntegrationCredentials, Error>({
    queryKey: ["hubspotCredentials", userId, orgId],
    queryFn: () => {
      if (!userId || !orgId) throw new Error("User ID and Org ID are required");
      return getHubSpotCredentials({ user_id: userId, org_id: orgId }, frontendAxios);
    },
    enabled: !!userId && !!orgId,
  });
};

/**
 * Hook to fetch HubSpot items.
 * @param credentials The integration credentials.
 * @returns A React Query instance for HubSpot items.
 */
export const useGetHubSpotItems = (credentials: IntegrationCredentials | null) => {
  return useQuery<IntegrationItem[], Error>({
    queryKey: ["hubspotItems", credentials],
    queryFn: () => {
      if (!credentials?.access_token) throw new Error("Access token is required");
      return getHubSpotItems(credentials, frontendAxios);
    },
    enabled: !!credentials?.access_token,
    initialData: [],
  });
};