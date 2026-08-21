import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Collapse,
  styled
} from '@mui/material';
import {
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const InfoContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 8,
  marginTop: theme.spacing(1),
  border: '1px solid rgba(255,255,255,0.1)'
}));

const ChatbotInfo = ({ message }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!message.intent && !message.confidence) {
    return null;
  }

  const getIntentColor = (intent) => {
    const intentColors = {
      'greeting': '#4caf50',
      'registration': '#2196f3',
      'voting_process': '#ff9800',
      'security': '#f44336',
      'help': '#9c27b0',
      'unknown': '#757575'
    };
    return intentColors[intent] || '#757575';
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return 'Cao';
    if (confidence >= 0.6) return 'Trung bình';
    return 'Thấp';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#4caf50';
    if (confidence >= 0.6) return '#ff9800';
    return '#f44336';
  };

  return (
    <InfoContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)' }} />
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            Thông tin AI
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {message.intent && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Intent:
              </Typography>
              <Chip
                label={message.intent}
                size="small"
                sx={{
                  bgcolor: getIntentColor(message.intent),
                  color: 'white',
                  fontSize: '0.7rem'
                }}
              />
            </Box>
          )}
          
          {message.confidence !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Độ tin cậy:
              </Typography>
              <Tooltip title={`${(message.confidence * 100).toFixed(1)}%`}>
                <Chip
                  label={getConfidenceLevel(message.confidence)}
                  size="small"
                  sx={{
                    bgcolor: getConfidenceColor(message.confidence),
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              </Tooltip>
            </Box>
          )}
        </Box>
      </Collapse>
    </InfoContainer>
  );
};

export default ChatbotInfo; 