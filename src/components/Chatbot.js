import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar,
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Chip,
  styled
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import chatbotService from '../services/chatbotService';
import ChatbotInfo from './ChatbotInfo';

const ChatContainer = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  width: 350,
  height: 500,
  display: 'flex',
  flexDirection: 'column',
  zIndex: 1000,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  borderRadius: 16,
  overflow: 'hidden',
  [theme.breakpoints.down('sm')]: {
    width: 'calc(100vw - 40px)',
    height: 'calc(100vh - 120px)',
    bottom: 10,
    right: 20,
  }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)',
  color: 'white',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  borderBottom: '1px solid rgba(255,255,255,0.1)'
}));

const MessageList = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  background: '#f8f9fa',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1)
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  display: 'flex',
  justifyContent: isUser ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1)
}));

const MessageContent = styled(Box)(({ theme, isUser }) => ({
  maxWidth: isUser ? '150%' : '80%', // Tin nhắn user rộng hơn
  padding: theme.spacing(1.5, 2),
  borderRadius: 18,
  background: isUser 
    ? 'linear-gradient(135deg, #169385 0%, #0f6b5f 100%)'
    : 'white',
  color: isUser ? 'white' : '#333',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  wordWrap: 'break-word',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    [isUser ? 'right' : 'left']: -8,
    width: 0,
    height: 0,
    border: `8px solid transparent`,
    borderTopColor: isUser 
      ? '#169385'
      : 'white',
    borderBottom: 'none',
    [isUser ? 'borderRight' : 'borderLeft']: 'none'
  },
  // Cải thiện cho tin nhắn dài
  '& .MuiTypography-root': {
    wordBreak: 'break-word',
    hyphens: 'auto'
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'white',
  borderTop: '1px solid #e0e0e0',
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'center'
}));

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là Lumi của hệ thống bầu cử trực tuyến. Tôi có thể giúp bạn tìm hiểu về quy trình bầu cử, cách đăng ký, hoặc trả lời các câu hỏi khác. Bạn cần hỗ trợ gì?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messageId, setMessageId] = useState(2); // bắt đầu từ 2 vì id:1 đã dùng cho tin nhắn đầu tiên
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Khởi tạo session ID khi component mount
  useEffect(() => {
    let currentSessionId = chatbotService.getSessionId();
    if (!currentSessionId) {
      currentSessionId = chatbotService.generateSessionId();
      chatbotService.saveSessionId(currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: messageId,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageId(prev => prev + 1);
    setInputValue('');
    setIsLoading(true);

    try {
      const data = await chatbotService.sendMessage(inputValue.trim(), sessionId);

      if (data.success) {
        const botResponse = data.data.fulfillmentText;

        setMessages(prev => [...prev, {
          id: messageId + 1,
          text: botResponse,
          isUser: false,
          timestamp: new Date(),
          intent: data.data.intent,
          confidence: data.data.confidence
        }]);
        setMessageId(prev => prev + 1);
      } else {
        setMessages(prev => [...prev, {
          id: messageId + 1,
          text: 'Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.',
          isUser: false,
          timestamp: new Date()
        }]);
        setMessageId(prev => prev + 1);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: messageId + 1,
        text: 'Xin lỗi, không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.',
        isUser: false,
        timestamp: new Date()
      }]);
      setMessageId(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Hàm format tin nhắn để hiển thị đúng xuống dòng
  const formatMessageText = (text) => {
    if (!text) return '';
    // Thay thế mọi loại xuống dòng thành '\n'
    return text.replace(/\r\n|\r|\n/g, '\n');
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 999,
          background: 'linear-gradient(135deg, #169385 0%, #1565c0 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)'
          }
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat Drawer */}
      {isOpen && (
        <ChatContainer>
          <ChatHeader>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <BotIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Trợ lý Lumi
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Online
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </ChatHeader>

          <MessageList>
            {messages.map((message) => (
              <MessageBubble key={message.id} isUser={message.isUser}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, maxWidth: '100%' }}>
                  {!message.isUser && (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      <BotIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                                     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: message.isUser ? 'flex-end' : 'flex-start' }}>
                     <MessageContent isUser={message.isUser}>
                       <Typography 
                         variant="body2" 
                         sx={{ 
                           lineHeight: 1.4,
                           whiteSpace: 'pre-line' // Cho phép xuống dòng
                         }}
                         component="div"
                       >
                         {message.text}
                       </Typography>
                     </MessageContent>
                     <Typography 
                       variant="caption" 
                       sx={{ 
                         color: 'text.secondary', 
                         mt: 0.5, 
                         fontSize: '0.7rem',
                         opacity: 0.7
                       }}
                     >
                       {formatTime(message.timestamp)}
                     </Typography>
                     {!message.isUser && (message.intent || message.confidence !== undefined) && (
                       <ChatbotInfo message={message} />
                     )}
                   </Box>
                  {message.isUser && (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
              </MessageBubble>
            ))}
            
            {isLoading && (
              <MessageBubble isUser={false}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    <BotIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Đang nhập...
                    </Typography>
                  </Box>
                </Box>
              </MessageBubble>
            )}
            
            <div ref={messagesEndRef} />
          </MessageList>

          <InputContainer>
            <TextField
              ref={inputRef}
              fullWidth
              variant="outlined"
              placeholder="Nhập tin nhắn..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#169385',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#169385',
                  },
                },
              }}
            />
            <IconButton
              color="primary"
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: '#e0e0e0',
                  color: '#999',
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </InputContainer>
        </ChatContainer>
      )}
    </>
  );
};

export default Chatbot;
