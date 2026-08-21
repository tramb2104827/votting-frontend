const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ChatbotService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/chatbot`;
  }

  // Gửi tin nhắn đến chatbot
  async sendMessage(message, sessionId = null) {
    try {
      const response = await fetch(`${this.baseURL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim(),
          sessionId: sessionId || `user-session-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      throw error;
    }
  }

  // Lấy danh sách intents từ Dialogflow
  async getIntents() {
    try {
      const response = await fetch(`${this.baseURL}/intents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching intents:', error);
      throw error;
    }
  }

  // Lấy thống kê chatbot
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching chatbot stats:', error);
      throw error;
    }
  }

  // Tạo session ID duy nhất cho người dùng
  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Lưu session ID vào localStorage
  saveSessionId(sessionId) {
    localStorage.setItem('chatbot_session_id', sessionId);
  }

  // Lấy session ID từ localStorage
  getSessionId() {
    return localStorage.getItem('chatbot_session_id');
  }

  // Xóa session ID
  clearSessionId() {
    localStorage.removeItem('chatbot_session_id');
  }
}

export default new ChatbotService(); 