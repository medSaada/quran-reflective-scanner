
// Use environment-aware API URL
const API_URL = import.meta.env.PROD 
  ? "https://your-production-api.com/process-text/"  // Replace with actual production API URL
  : "http://127.0.0.1:8000/process-text/";

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
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to the server. Please check your connection and try again.');
      }
      throw new Error(error.message);
    }
    throw new Error('An unexpected error occurred');
  }
};

