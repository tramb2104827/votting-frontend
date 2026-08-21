import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function ImageUpload({ label, value, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 533;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Use lower compression for better quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          // Create a local storage reference to ensure image persistence
          const timestamp = new Date().getTime();
          const imageKey = `image_${timestamp}`;
          try {
            localStorage.setItem(imageKey, compressedDataUrl);
            console.log('Image saved to localStorage with key:', imageKey);
          } catch (e) {
            console.error('Failed to save image to localStorage:', e);
          }
          
          resolve(compressedDataUrl);
        };
      };
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 2MB');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const compressedImage = await compressImage(file);
      onChange(compressedImage);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Không thể tải ảnh lên. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUploadIcon />}
          disabled={loading}
        >
          Chọn ảnh
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>
        {loading && <CircularProgress size={24} />}
      </Box>
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {value && (
        <Box
          sx={{
            width: '100%',
            maxWidth: 200,
            margin: '0 auto',
            position: 'relative',
            '&::before': {
              content: '""',
              display: 'block',
              paddingTop: '133.33%', // 3:4 aspect ratio
            }
          }}
        >
          <Box
            component="img"
            src={value || 'https://via.placeholder.com/200x267?text=Chọn+ảnh'}
            alt="Preview"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default ImageUpload; 