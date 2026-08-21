import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format ngày tháng theo định dạng tiếng Việt
 * @param {string | Date} date - Ngày cần format
 * @returns {string} - Ngày đã format
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateNoTime = (dateString) => {
  if (!dateString) return 'Chưa cập nhật';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Hàm định dạng số phiếu bầu
export const formatVoteCount = (count) => {
  if (count === undefined || count === null) return '0';
  
  return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}; 