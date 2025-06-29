import { useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import { Redirect } from '@shopify/app-bridge/actions';

/**
 * A hook that returns an authenticated fetch function.
 * This function will automatically handle authentication
 * and redirect to auth if needed.
 */
export function useAuthenticatedFetch() {
  const app = useAppBridge();
  
  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {
    try {
      const response = await fetchFunction(uri, options);
      
      // Check if response indicates auth is needed
      if (response.status === 401) {
        const authUrlHeader = response.headers.get('X-Shopify-API-Request-Failure-Reauthorize-Url');
        if (authUrlHeader) {
          const redirect = Redirect.create(app);
          redirect.dispatch(Redirect.Action.REMOTE, authUrlHeader);
          return;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Authenticated fetch error:', error);
      throw error;
    }
  };
}
