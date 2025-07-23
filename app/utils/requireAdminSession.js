// utils/requireAdminSession.js
import { authenticate } from "../shopify.server";

/**
 * Ensures an authenticated Shopify Admin session.
 * If not authenticated, automatically redirects to Shopify's /auth/login.
 */
export async function requireAdminSession(request) {
    try {
        
    
  const result = await authenticate.admin(request);

  // If the session is missing or invalid, Remix's shopify.auth returns a 302 Response.
  if (result instanceof Response) {
    return result; // Remix will handle redirect to /auth/login
  }

  // Otherwise, session is valid
  return result; // { session, admin }
  } catch (error) {
        return error;
    }
}
