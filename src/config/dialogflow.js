// Dialogflow Configuration
export const DIALOGFLOW_CONFIG = {
  projectId: 'voting-9xfa',
  sessionId: '123456789',
  languageCode: 'vi',
  // API endpoint sẽ được cấu hình trong environment variables
  apiEndpoint: process.env.REACT_APP_DIALOGFLOW_ENDPOINT || 'https://dialogflow.googleapis.com/v2',
  // Token sẽ được lấy từ environment variables
  accessToken: process.env.REACT_APP_DIALOGFLOW_TOKEN,
}; 