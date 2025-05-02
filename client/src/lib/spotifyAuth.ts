import { apiRequest } from './queryClient';

// Function to open Spotify auth in a popup window
export async function loginWithPopup(): Promise<string | null> {
  try {
    // Get the authorization URL from our backend
    const response = await apiRequest('GET', '/api/spotify/login', undefined);
    const data = await response.json();
    const { url } = data;
    
    // Calculate the popup dimensions to center on screen
    const width = 450;
    const height = 730;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    // Open the popup window
    const popup = window.open(
      url,
      'Spotify Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      throw new Error('Popup was blocked by the browser. Please allow popups for this site.');
    }
    
    // Return a Promise that resolves when the popup is redirected to our callback URL
    return new Promise((resolve, reject) => {
      // Poll for changes
      const interval = setInterval(() => {
        try {
          // Check if popup is closed by user
          if (popup.closed) {
            clearInterval(interval);
            reject(new Error('Authentication was cancelled.'));
            return;
          }
          
          // Check if popup URL contains our callback
          const currentUrl = popup.location.href;
          
          if (currentUrl.includes('/callback')) {
            // Extract the authorization code from the URL
            const urlParams = new URLSearchParams(new URL(currentUrl).search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');
            
            clearInterval(interval);
            popup.close();
            
            if (error) {
              reject(new Error(`Authentication failed: ${error}`));
            } else if (code) {
              resolve(code);
            } else {
              reject(new Error('No authorization code was received.'));
            }
          }
        } catch (e) {
          // Cross-origin errors will occur when the popup is redirected to Spotify
          // We can ignore these errors and keep polling
          if (!(e instanceof DOMException && e.name === 'SecurityError')) {
            clearInterval(interval);
            popup.close();
            reject(e);
          }
        }
      }, 500);
      
      // Set a timeout to reject the promise after 5 minutes
      setTimeout(() => {
        clearInterval(interval);
        if (!popup.closed) {
          popup.close();
        }
        reject(new Error('Authentication timed out after 5 minutes.'));
      }, 5 * 60 * 1000);
    });
  } catch (error) {
    console.error('Error initiating Spotify login:', error);
    return null;
  }
}

// Exchange the authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
  try {
    const response = await apiRequest('POST', '/api/spotify/callback', { code });
    if (!response.ok) {
      throw new Error('Failed to exchange authorization code for tokens');
    }
    return response.json();
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
}