
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
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
