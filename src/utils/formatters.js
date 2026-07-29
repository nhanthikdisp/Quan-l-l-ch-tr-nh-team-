// Time String to Hour Float (e.g., "08:30" => 8.5)
export function timeStringToHour(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
}

// Hour Float to Time String (e.g., 8.5 => "08:30")
export function hourToTimeString(hourNum) {
  const h = Math.floor(hourNum);
  const m = Math.round((hourNum - h) * 60);
  const hStr = String(Math.max(0, Math.min(23, h))).padStart(2, '0');
  const mStr = String(Math.max(0, Math.min(59, m))).padStart(2, '0');
  return `${hStr}:${mStr}`;
}

// Format Currency VNĐ
export function formatCurrency(amount) {
  return (Number(amount) || 0).toLocaleString('vi-VN') + ' VNĐ';
}

// Format Date Display for Vietnamese locale
export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formatted = d.toLocaleDateString('vi-VN', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
