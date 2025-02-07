
// Use HTTPS by default
const API_URL = "https://127.0.0.1:8000/process-text/";

interface ProcessDataParams {
  text: string;
  language: string;
}

export const processData = async (data: ProcessDataParams) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add CORS headers
        'Accept': 'application/json',
      },
      // Add CORS mode
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Provide more detailed error message
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to API server. Please ensure the server is running and accessible.');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};
