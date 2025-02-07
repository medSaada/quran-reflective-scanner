
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
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(`API request failed: ${errorMessage}`);
  }
};
