import { AsyncLocalStorage } from "async_hooks";

export interface TenantContextData {
  tenantId: number;
  userId: number;
  username: string;
  roles: string[];
  permissions: string[];
  membershipTier: string;
}

export const tenantStorage = new AsyncLocalStorage<TenantContextData>();

export function getTenantContext(): TenantContextData | undefined {
  return tenantStorage.getStore();
}
