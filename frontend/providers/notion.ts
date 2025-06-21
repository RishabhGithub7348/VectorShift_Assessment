import { frontendAxios } from "@/config/axios";
import { IntegrationItem, IntegrationAuthorizeUrl, IntegrationCredentials } from "@/types/integration.types";
import { ApiResponse } from "@/types/request_response.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance, AxiosResponse } from "axios";

/**
 * Initiates Notion OAuth authorization.
 * @param data The authorization request data (user_id, org_id).
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the authorization URL.
 */
export const authorizeNotion = async (
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
    >("/integrations/notion/authorize", formData);
    return response.data.data || {};
  } catch (error) {
    console.error("Error authorizing Notion:", error);
    throw error;
  }
};

/**
 * Fetches Notion credentials after OAuth callback.
 * @param data The credential request data (user_id, org_id).
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to the credentials.
 */
export const getNotionCredentials = async (
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
    >("/integrations/notion/credentials", formData);
    return response.data.data || {};
  } catch (error) {
    console.error("Error fetching Notion credentials:", error);
    throw error;
  }
};

/**
 * Fetches Notion items using credentials.
 * @param credentials The integration credentials.
 * @param axiosInstance The Axios instance to use.
 * @returns A promise resolving to an array of IntegrationItem objects.
 */
export const getNotionItems = async (
  credentials: IntegrationCredentials,
  axiosInstance: AxiosInstance = frontendAxios
): Promise<IntegrationItem[]> => {
  try {
    const formData = new FormData();
    formData.append("credentials", JSON.stringify(credentials));
    const response = await axiosInstance.post<
      FormData,
      AxiosResponse<ApiResponse<IntegrationItem[]>>
    >("/integrations/notion/items", formData);
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching Notion items:", error);
    throw error;
  }
};

/**
 * Hook to initiate Notion OAuth authorization.
 * @returns A React Query mutation instance to authorize Notion.
 */
export const useAuthorizeNotion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { user_id: string; org_id: string }) =>
      authorizeNotion(data, frontendAxios),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notionCredentials"] });
    },
  });
};

/**
 * Hook to fetch Notion credentials.
 * @param userId The user ID.
 * @param orgId The organization ID.
 * @returns A React Query instance for Notion credentials.
 */
export const useGetNotionCredentials = (userId: string | null, orgId: string | null) => {
  return useQuery<IntegrationCredentials, Error>({
    queryKey: ["notionCredentials", userId, orgId],
    queryFn: () => {
      if (!userId || !orgId) throw new Error("User ID and Org ID are required");
      return getNotionCredentials({ user_id: userId, org_id: orgId }, frontendAxios);
    },
    enabled: !!userId && !!orgId,
  });
};

/**
 * Hook to fetch Notion items.
 * @param credentials The integration credentials.
 * @returns A React Query instance for Notion items.
 */
export const useGetNotionItems = (credentials: IntegrationCredentials | null) => {
  return useQuery<IntegrationItem[], Error>({
    queryKey: ["notionItems", credentials],
    queryFn: () => {
      if (!credentials?.access_token) throw new Error("Access token is required");
      return getNotionItems(credentials, frontendAxios);
    },
    enabled: !!credentials?.access_token,
    initialData: [],
  });
};