import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Ensure appBaseUrl is set to current origin if not provided
// This helps Base44 properly whitelist the modal.host domain
const resolvedAppBaseUrl = appBaseUrl || (typeof window !== 'undefined' ? window.location.origin : undefined);

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl: resolvedAppBaseUrl
});
