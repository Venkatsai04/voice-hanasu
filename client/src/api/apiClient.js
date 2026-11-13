const BASE_URL = '/api';

export const getStoredTokens = () => {
  return {
    accessToken: localStorage.getItem('sahara_access_token'),
    refreshToken: localStorage.getItem('sahara_refresh_token')
  };
};

export const setStoredTokens = (access, refresh) => {
  if (access) localStorage.setItem('sahara_access_token', access);
  if (refresh) localStorage.setItem('sahara_refresh_token', refresh);
};

export const clearStoredTokens = () => {
  localStorage.removeItem('sahara_access_token');
  localStorage.removeItem('sahara_refresh_token');
};

export const apiFetch = async (endpoint, options = {}) => {
  const { accessToken } = getStoredTokens();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  // Handle Token Expiry & Automatic Refresh
  if (response.status === 401) {
    const { refreshToken } = getStoredTokens();
    if (refreshToken && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setStoredTokens(refreshData.accessToken, refreshData.refreshToken);
          headers['Authorization'] = `Bearer ${refreshData.accessToken}`;

          // Retry original request
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers
          });
        } else {
          clearStoredTokens();
          window.dispatchEvent(new Event('auth:logout'));
        }
      } catch {
        clearStoredTokens();
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
