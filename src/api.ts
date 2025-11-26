// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-app.railway.app/api'
    : 'http://localhost:3000/api');

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Hunt API
export const huntAPI = {
  // Get all hunts
  getAll: async () => {
    return apiCall('/hunts');
  },

  // Get single hunt
  getById: async (id: string) => {
    return apiCall(`/hunts/${id}`);
  },

  // Create hunt
  create: async (hunt: any) => {
    return apiCall('/hunts', {
      method: 'POST',
      body: JSON.stringify(hunt),
    });
  },

  // Update hunt
  update: async (id: string, hunt: any) => {
    return apiCall(`/hunts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(hunt),
    });
  },

  // Delete hunt
  delete: async (id: string) => {
    return apiCall(`/hunts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Leaderboard API
export const leaderboardAPI = {
  // Get leaderboard
  getAll: async () => {
    return apiCall('/leaderboard');
  },

  // Submit entry
  submit: async (entry: { name: string; score: number; completionTime: number }) => {
    return apiCall('/leaderboard', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiCall('/health');
};
