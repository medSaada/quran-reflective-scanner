
const API_URL = "http://127.0.0.1:8000/process-text/";

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
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to API server. Please ensure the server is running.');
  }
};
