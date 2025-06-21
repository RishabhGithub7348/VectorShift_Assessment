export interface Integration {
  type: string;
  connected: boolean;
  credentials?: string;
}

export interface IntegrationItem {
  id: string;
  name: string;
  type: string;
  parent_id?: string;
  parent_path_or_name?: string;
  creation_time: Date;
  last_modified_time: Date;
}

export type IntegrationCredentials = {
  access_token?: string; 
};

export type IntegrationAuthorizeUrl = {
  auth_url?: string; 
};
