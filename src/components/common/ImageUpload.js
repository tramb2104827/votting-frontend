import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function ImageUpload({ onImageSelect, label = 'Upload Image', accept = 'image/*' }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(file);
        setLoading(false);
      };

      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <input
        accept={accept}
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleImageChange}
      />
      <label htmlFor="image-upload">
        <Button
          variant="outlined"
          component="span"
          startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
          disabled={loading}
          fullWidth
          sx={{ mb: 2 }}
        >
          {label}
        </Button>
      </label>
      {preview && (
        <Box sx={{ mt: 2 }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </Box>
      )}
    </Box>
  );
}

export default ImageUpload;