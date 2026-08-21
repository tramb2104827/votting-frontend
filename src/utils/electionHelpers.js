/**
 * Kiểm tra trạng thái của cuộc bầu cử
 * @param {Object} election - Đối tượng cuộc bầu cử
 * @returns {string} - Trạng thái: upcoming, active, completed, unknown
 */
export function getElectionStatus(election) {
  if (election.status === 'completed') return 'completed';
  const now = new Date();
  if (now < new Date(election.startTime)) return 'upcoming';
  if (now > new Date(election.endTime)) return 'completed';
  return 'active';
}

/**
 * Lấy màu tương ứng với trạng thái cuộc bầu cử
 * @param {string} status - Trạng thái cuộc bầu cử
 * @returns {string} - Màu tương ứng (thành phần MUI color)
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'upcoming':
      return 'info';
    case 'active':
      return 'success';
    case 'completed':
      return 'default';
    default:
      return 'error';
  }
};

/**
 * Lấy text hiển thị cho trạng thái cuộc bầu cử
 * @param {string} status - Trạng thái cuộc bầu cử
 * @returns {string} - Text hiển thị
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'upcoming':
      return 'Sắp diễn ra';
    case 'active':
      return 'Đang diễn ra';
    case 'completed':
      return 'Đã kết thúc';
    default:
      return 'Không xác định';
  }
};

/**
 * Tính thời gian còn lại của cuộc bầu cử
 * @param {Date} endTime - Thời gian kết thúc
 * @returns {string} - Thời gian còn lại dạng text
 */
export const getRemainingTime = (endTime) => {
  if (!endTime) return '';
  
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  
  if (diff <= 0) return 'Đã kết thúc';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `Còn ${days} ngày ${hours} giờ`;
  } else if (hours > 0) {
    return `Còn ${hours} giờ ${minutes} phút`;
  } else {
    return `Còn ${minutes} phút`;
  }
}; 