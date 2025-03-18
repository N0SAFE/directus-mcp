import { z } from 'zod';

export const DirectusConfigSchema = z.object({
  url: z.string().url(),
  token: z.string(),
  collection: z.string(),
});

export type DirectusConfig = z.infer<typeof DirectusConfigSchema>;

export interface MCPMetadata {
  version: string;
  requestId?: string;
  timestamp: string;
}

export interface MCPError {
  code: string;
  message: string;
  details?: Record<string, any>;
  status: number;
}

export interface MCPResponse<T> {
  data?: T;
  error?: MCPError;
  metadata: MCPMetadata;
}

export interface MCPQueryParams {
  filter?: Record<string, any>;
  sort?: string[];
  page?: number;
  limit?: number;
}

export interface MCPPagination {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}