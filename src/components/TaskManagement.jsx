import React, { useState, useRef, useEffect } from 'react';
import './TaskManagement.css';

const LOCAL_STORAGE_KEY = 'chronos_plan_tracks_v3';

// Get today's date in YYYY-MM-DD format
function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Add/subtract days from YYYY-MM-DD string
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format YYYY-MM-DD for Vietnamese display
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formatted = d.toLocaleDateString('vi-VN', options);
  // Capitalize first letter
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Helper to determine if date is past, today, or future
function getDateLabel(dateStr) {
  const todayStr = getTodayString();
  if (dateStr === todayStr) return { label: 'Hôm nay', class: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
  if (dateStr < todayStr) return { label: 'Quá khứ', class: 'bg-slate-100 text-slate-700 border-slate-300' };
  return { label: 'Tương lai', class: 'bg-blue-100 text-blue-700 border-blue-300' };
}

const ACTIVITY_TYPES = [
  { label: 'Ăn uống', icon: 'restaurant', colorClass: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: 'Ngắm cảnh', icon: 'photo_camera', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { label: 'Bonding', icon: 'groups', colorClass: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Công việc', icon: 'work', colorClass: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Khác', icon: 'auto_awesome', colorClass: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const STATUS_OPTIONS = [
  { value: 'Sắp tới', label: 'Sắp tới', colorClass: 'bg-blue-500 text-white', icon: 'schedule' },
  { value: 'Đang diễn ra', label: 'Đang diễn ra', colorClass: 'bg-amber-500 text-white', icon: 'play_circle' },
  { value: 'Đã xong', label: 'Đã xong', colorClass: 'bg-emerald-600 text-white', icon: 'check_circle' },
  { value: 'Hủy', label: 'Hủy', colorClass: 'bg-rose-500 text-white', icon: 'cancel' },
  { value: 'Tạm hoãn', label: 'Tạm hoãn', colorClass: 'bg-slate-500 text-white', icon: 'pause_circle' },
];

const TODAY_STR = getTodayString();
const YESTERDAY_STR = addDays(TODAY_STR, -1);
const TOMORROW_STR = addDays(TODAY_STR, 1);

const DEFAULT_TASKS = [
  // Today Tasks
  {
    id: 1,
    date: TODAY_STR,
    title: 'Team Sync: Chiến lược Q4',
    description: 'Thảo luận mục tiêu quý 4, phân chia công việc cho từng nhóm phát triển.',
    startTime: '08:30',
    endTime: '11:00',
    startHour: 8.5,
    durationHours: 2.5,
    location: 'Phòng họp A - Tầng 3',
    activityType: 'Bonding',
    status: 'Đã xong',
    completed: true,
    row: 1,
    bgClass: 'bg-primary text-white'
  },
  {
    id: 2,
    date: TODAY_STR,
    title: 'Review thiết kế giao diện',
    description: 'Đánh giá các bản vẽ UI/UX mới nhất của ứng dụng mobile.',
    startTime: '10:00',
    endTime: '14:00',
    startHour: 10,
    durationHours: 4,
    location: 'Phòng Creative Lab',
    activityType: 'Công việc',
    status: 'Đang diễn ra',
    completed: false,
    row: 2,
    bgClass: 'bg-secondary text-white'
  },
  {
    id: 3,
    date: TODAY_STR,
    title: 'Bữa trưa giao lưu thân mật',
    description: 'Ăn trưa cùng toàn đội ngũ thiết kế và làm quen nhân sự mới.',
    startTime: '12:00',
    endTime: '13:30',
    startHour: 12,
    durationHours: 1.5,
    location: 'Nhà hàng Pizza 4P\'s',
    activityType: 'Ăn uống',
    status: 'Sắp tới',
    completed: false,
    row: 3,
    bgClass: 'bg-tertiary text-white'
  },
  {
    id: 4,
    date: TODAY_STR,
    title: 'Dã ngoại ngắm cảnh hoàng hôn',
    description: 'Hoạt động ngắm cảnh và chụp ảnh teambuilding cuối ngày.',
    startTime: '15:30',
    endTime: '17:30',
    startHour: 15.5,
    durationHours: 2,
    location: 'Công viên Hồ Tây',
    activityType: 'Ngắm cảnh',
    status: 'Sắp tới',
    completed: false,
    row: 4,
    bgClass: 'bg-secondary-container text-on-secondary-container'
  },

  // Past Task (Yesterday)
  {
    id: 5,
    date: YESTERDAY_STR,
    title: 'Tổng kết kết quả tuần trước',
    description: 'Báo cáo doanh số và đánh giá các chỉ số KPIs.',
    startTime: '09:00',
    endTime: '11:30',
    startHour: 9,
    durationHours: 2.5,
    location: 'Phòng Hội nghị',
    activityType: 'Công việc',
    status: 'Đã xong',
    completed: true,
    row: 1,
    bgClass: 'bg-primary text-white'
  },
  {
    id: 6,
    date: YESTERDAY_STR,
    title: 'Tiệc tối Bonding Đội Ngũ',
    description: 'Bữa tối thân mật mừng hoàn thành cột mốc dự án.',
    startTime: '18:00',
    endTime: '21:00',
    startHour: 18,
    durationHours: 3,
    location: 'Buffet Sen Tây Hồ',
    activityType: 'Ăn uống',
    status: 'Đã xong',
    completed: true,
    row: 2,
    bgClass: 'bg-tertiary text-white'
  },

  // Future Task (Tomorrow)
  {
    id: 7,
    date: TOMORROW_STR,
    title: 'Khởi chạy chiến dịch Marketing',
    description: 'Phát động chiến dịch quảng bá sản phẩm quý tới trên kênh social.',
    startTime: '09:00',
    endTime: '12:00',
    startHour: 9,
    durationHours: 3,
    location: 'Phòng Truyền thông',
    activityType: 'Công việc',
    status: 'Sắp tới',
    completed: false,
    row: 1,
    bgClass: 'bg-secondary text-white'
  },
  {
    id: 8,
    date: TOMORROW_STR,
    title: 'Tham quan triển lãm nghệ thuật',
    description: 'Chuyến đi ngắm cảnh và lấy cảm hứng sáng tác cho team.',
    startTime: '14:00',
    endTime: '17:00',
    startHour: 14,
    durationHours: 3,
    location: 'Bảo tàng Mỹ thuật Việt Nam',
    activityType: 'Ngắm cảnh',
    status: 'Sắp tới',
    completed: false,
    row: 2,
    bgClass: 'bg-secondary-container text-on-secondary-container'
  }
];

function timeStringToHour(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
}

function hourToTimeString(hourNum) {
  const h = Math.floor(hourNum);
  const m = Math.round((hourNum - h) * 60);
  const hStr = String(Math.max(0, Math.min(23, h))).padStart(2, '0');
  const mStr = String(Math.max(0, Math.min(59, m))).padStart(2, '0');
  return `${hStr}:${mStr}`;
}

export default function TaskManagement() {
  const scrollRef = useRef(null);
  const timeScaleRef = useRef(null);
  const dateInputRef = useRef(null);

  const [activeView, setActiveView] = useState('Day');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Load state from Local Storage
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi khi đọc dữ liệu từ Local Storage:', e);
    }
    return DEFAULT_TASKS;
  });

  // Save state to Local Storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error('Lỗi khi lưu dữ liệu vào Local Storage:', e);
    }
  }, [tasks]);

  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Helper to move task A and automatically swap with overlapping task B if position is occupied
  const moveAndSwapTask = (taskId, targetRow, targetStartHour) => {
    setTasks((prevTasks) => {
      const taskA = prevTasks.find((t) => String(t.id) === String(taskId));
      if (!taskA) return prevTasks;

      const oldRow = taskA.row;
      const oldStartHour = taskA.startHour;
      const durationA = taskA.durationHours || 1;

      let newStartHourA = targetStartHour;
      if (newStartHourA + durationA > 24) {
        newStartHourA = Math.max(0, 24 - durationA);
      }
      const newEndHourA = newStartHourA + durationA;

      const taskADate = taskA.date || TODAY_STR;

      // Find overlapping task B on target row and same date
      const taskB = prevTasks.find((t) => {
        if (String(t.id) === String(taskId)) return false;
        if ((t.date || TODAY_STR) !== taskADate) return false;
        if (t.row !== targetRow) return false;

        const bStart = t.startHour;
        const bEnd = t.startHour + (t.durationHours || 1);
        return newStartHourA < bEnd && newEndHourA > bStart;
      });

      return prevTasks.map((t) => {
        // Move Task A to target position
        if (String(t.id) === String(taskId)) {
          return {
            ...t,
            row: targetRow,
            startHour: newStartHourA,
            durationHours: durationA,
            startTime: hourToTimeString(newStartHourA),
            endTime: hourToTimeString(newEndHourA)
          };
        }

        // Swap Overlapped Task B to Task A's original position
        if (taskB && String(t.id) === String(taskB.id)) {
          const durationB = t.durationHours || 1;
          let bNewStart = oldStartHour;
          if (bNewStart + durationB > 24) {
            bNewStart = Math.max(0, 24 - durationB);
          }
          const bNewEnd = bNewStart + durationB;
          return {
            ...t,
            row: oldRow,
            startHour: bNewStart,
            durationHours: durationB,
            startTime: hourToTimeString(bNewStart),
            endTime: hourToTimeString(bNewEnd)
          };
        }

        return t;
      });
    });

    // Update selectedTask state if open
    if (selectedTask && String(selectedTask.id) === String(taskId)) {
      setSelectedTask((prev) => {
        if (!prev) return null;
        const durationA = prev.durationHours || 1;
        let newStartHourA = targetStartHour;
        if (newStartHourA + durationA > 24) {
          newStartHourA = Math.max(0, 24 - durationA);
        }
        return {
          ...prev,
          row: targetRow,
          startHour: newStartHourA,
          startTime: hourToTimeString(newStartHourA),
          endTime: hourToTimeString(newStartHourA + durationA)
        };
      });
    }
  };

  const handleGridDrop = (e) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskIdStr) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate row (48px per row)
    const targetRow = Math.max(1, Math.min(20, Math.floor(clickY / 48) + 1));

    // Calculate start hour (50px per 0.5 hour = 30 mins)
    const targetStartHour = Math.max(0, Math.min(23.5, Math.floor(clickX / 50) * 0.5));

    moveAndSwapTask(taskIdStr, targetRow, targetStartHour);
    setDraggedTaskId(null);
  };

  // Form State for New Track
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(selectedDate);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('11:00');
  const [newLocation, setNewLocation] = useState('');
  const [newActivityType, setNewActivityType] = useState('Ăn uống');
  const [newStatus, setNewStatus] = useState('Sắp tới');
  const [newCompleted, setNewCompleted] = useState(false);
  const [newRow, setNewRow] = useState(1);
  const [newColor, setNewColor] = useState('bg-primary text-white');

  // Update newDate when selectedDate changes or modal opens
  useEffect(() => {
    setNewDate(selectedDate);
  }, [selectedDate, isModalOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 800; // Auto scroll to ~08:00
    }
  }, [selectedDate]);

  const handleScrollGrid = (e) => {
    if (timeScaleRef.current) {
      timeScaleRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleScrollToday = () => {
    setSelectedDate(getTodayString());
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 800, behavior: 'smooth' });
    }
  };

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  // Status & Completed Sync in Form
  const handleStatusChange = (status) => {
    setNewStatus(status);
    if (status === 'Đã xong') {
      setNewCompleted(true);
    } else if (status === 'Sắp tới' || status === 'Đang diễn ra') {
      setNewCompleted(false);
    }
  };

  const handleCompletedChange = (checked) => {
    setNewCompleted(checked);
    if (checked) {
      setNewStatus('Đã xong');
    } else if (newStatus === 'Đã xong') {
      setNewStatus('Sắp tới');
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const startH = timeStringToHour(newStartTime);
    let endH = timeStringToHour(newEndTime);
    if (endH <= startH) endH = startH + 1;

    const duration = parseFloat((endH - startH).toFixed(2));

    const newTask = {
      id: Date.now(),
      date: newDate || selectedDate,
      title: newTitle.trim(),
      description: newDescription.trim(),
      startTime: newStartTime,
      endTime: newEndTime,
      startHour: startH,
      durationHours: Math.max(0.5, duration),
      location: newLocation.trim(),
      activityType: newActivityType,
      status: newStatus,
      completed: newCompleted,
      row: Number(newRow),
      bgClass: newColor
    };

    setTasks((prev) => [...prev, newTask]);

    // If user created a task for a different date, switch to that date to view it
    if (newDate && newDate !== selectedDate) {
      setSelectedDate(newDate);
    }

    // Reset form fields
    setNewTitle('');
    setNewDescription('');
    setNewStartTime('09:00');
    setNewEndTime('11:00');
    setNewLocation('');
    setNewActivityType('Ăn uống');
    setNewStatus('Sắp tới');
    setNewCompleted(false);
    setIsModalOpen(false);
  };

  // Move task row up/down with arrow buttons (with auto-swap if position is occupied)
  const moveTaskRow = (taskId, direction, e) => {
    if (e) e.stopPropagation();
    const task = tasks.find((t) => String(t.id) === String(taskId));
    if (!task) return;

    const newRow = direction === 'up' ? Math.max(1, task.row - 1) : Math.min(20, task.row + 1);
    moveAndSwapTask(taskId, newRow, task.startHour);
  };

  const toggleTaskCompletion = (taskId, e) => {
    if (e) e.stopPropagation();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          const nextStatus = nextCompleted ? 'Đã xong' : (t.status === 'Đã xong' ? 'Sắp tới' : t.status);
          return { ...t, completed: nextCompleted, status: nextStatus };
        }
        return t;
      })
    );
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => {
        const nextCompleted = !prev.completed;
        const nextStatus = nextCompleted ? 'Đã xong' : (prev.status === 'Đã xong' ? 'Sắp tới' : prev.status);
        return { ...prev, completed: nextCompleted, status: nextStatus };
      });
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Khôi phục danh sách task mặc định (bao gồm cả task quá khứ & tương lai)?')) {
      setTasks(DEFAULT_TASKS);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setSelectedDate(getTodayString());
    }
  };

  // Filter tasks by selected date
  const filteredTasks = tasks.filter((t) => (t.date || TODAY_STR) === selectedDate);

  // Detailed Statistics Calculations
  const totalTaskCount = tasks.length;
  const todayCount = tasks.filter((t) => (t.date || TODAY_STR) === TODAY_STR).length;
  
  const completedCount = tasks.filter((t) => t.completed || t.status === 'Đã xong').length;
  const uncompletedCount = tasks.filter((t) => !t.completed && t.status !== 'Hủy').length;
  const upcomingCount = tasks.filter((t) => t.status === 'Sắp tới' && !t.completed).length;
  const ongoingCount = tasks.filter((t) => t.status === 'Đang diễn ra' && !t.completed).length;
  const postponedCount = tasks.filter((t) => t.status === 'Tạm hoãn').length;
  const cancelledCount = tasks.filter((t) => t.status === 'Hủy').length;

  const hours = Array.from({ length: 24 }, (_, i) => `${i < 10 ? '0' : ''}${i}:00`);
  const indexRows = Array.from({ length: 20 }, (_, i) => i + 1);

  const getActivityIcon = (type) => {
    const found = ACTIVITY_TYPES.find((a) => a.label === type);
    return found ? found.icon : 'star';
  };

  const getStatusBadge = (status) => {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found ? found.colorClass : 'bg-gray-500 text-white';
  };

  const dateTagInfo = getDateLabel(selectedDate);

  return (
    <div className="font-body-base text-on-background overflow-hidden flex h-screen w-screen m-0 p-0 bg-background">
      
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col flex-none w-[290px] border-r border-outline-variant py-6 bg-surface-container-low h-screen z-40">
        <div className="px-6 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined">dashboard</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Task Flow</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Lịch trình thông minh</p>
          </div>
        </div>

        <nav className="flex-1 space-y-3 px-3 overflow-y-auto custom-scrollbar">
          {/* Header Task */}
          <div className="flex items-center justify-between bg-primary text-white rounded-2xl px-4 py-3 font-bold shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">list_alt</span>
              <span className="font-label-caps text-label-caps text-base">Tasks</span>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-extrabold">
              {filteredTasks.length} hôm nay
            </span>
          </div>

          {/* Thống kê chi tiết các trạng thái ngay dưới mục Task */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider px-1">
              Thống kê trạng thái ({totalTaskCount})
            </p>

            {/* 1. Đã hoàn thành */}
            <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-700">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-900">Đã hoàn thành</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-full">
                {completedCount}
              </span>
            </div>

            {/* 2. Chưa hoàn thành */}
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xs hover:border-amber-300 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-700">
                  <span className="material-symbols-outlined text-base">pending_actions</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">Chưa hoàn thành</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-amber-800 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                {uncompletedCount}
              </span>
            </div>

            {/* 3. Đang diễn ra */}
            <div className="bg-purple-50/90 border border-purple-200/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xs hover:border-purple-300 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-700">
                  <span className="material-symbols-outlined text-base">play_circle</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-900">Đang diễn ra</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-purple-800 bg-purple-200/70 px-2.5 py-0.5 rounded-full">
                {ongoingCount}
              </span>
            </div>

            {/* 4. Sắp tới */}
            <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xs hover:border-blue-300 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-700">
                  <span className="material-symbols-outlined text-base">schedule</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">Sắp tới</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-blue-800 bg-blue-200/70 px-2.5 py-0.5 rounded-full">
                {upcomingCount}
              </span>
            </div>

            {/* 5. Tạm hoãn */}
            <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-500/15 flex items-center justify-center text-slate-700">
                  <span className="material-symbols-outlined text-base">pause_circle</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Tạm hoãn</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-slate-800 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                {postponedCount}
              </span>
            </div>

            {/* 6. Đã hủy */}
            <div className="bg-rose-50/90 border border-rose-200/80 rounded-2xl p-2.5 flex items-center justify-between shadow-xs hover:border-rose-300 transition-all">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-700">
                  <span className="material-symbols-outlined text-base">cancel</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-900">Đã hủy</p>
                </div>
              </div>
              <span className="text-sm font-extrabold text-rose-800 bg-rose-200/70 px-2.5 py-0.5 rounded-full">
                {cancelledCount}
              </span>
            </div>

          </div>
        </nav>

        <div className="px-4 mt-auto space-y-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="font-label-caps text-label-caps">New Track</span>
          </button>
          <button
            onClick={handleResetDefaults}
            className="w-full bg-surface-container-highest text-on-surface-variant text-xs py-2 px-3 rounded-full flex items-center justify-center gap-1 hover:bg-surface-container-high transition-all"
            title="Khôi phục dữ liệu mẫu"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Reset Local Store</span>
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-outline-variant px-2">
          <a href="#help" className="flex items-center text-on-surface-variant mx-2 px-4 py-2 hover:bg-surface-container-highest rounded-full transition-all">
            <span className="material-symbols-outlined mr-3">help</span>
            <span className="font-label-caps text-label-caps">Help</span>
          </a>
          <a href="#logout" className="flex items-center text-on-surface-variant mx-2 px-4 py-2 hover:bg-surface-container-highest rounded-full transition-all">
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="font-label-caps text-label-caps">Logout</span>
          </a>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-screen min-w-0 bg-background relative overflow-hidden">
        
        {/* TopAppBar */}
        <header className="flex justify-between items-center w-full px-container-padding h-16 z-50 glass-header border-b border-outline-variant sticky top-0">
          <div className="flex items-center gap-8">
            <h1 className="font-headline-md text-headline-md font-bold text-primary">ChronosPlan</h1>

          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 mr-4">
              {/* Interactive Calendar Button in Header */}
              <button
                onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container relative"
                title="Chọn ngày từ Lịch"
              >
                <span className="material-symbols-outlined">calendar_today</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors relative rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="md:hidden bg-primary text-white px-3 py-1.5 rounded-full flex items-center gap-1 text-sm font-bold shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Track</span>
            </button>

            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm">
              <img
                className="w-full h-full object-cover"
                alt="User Profile"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              />
            </div>
          </div>
        </header>

        {/* Sub-Header with Calendar & Date Navigation */}
        <section className="flex flex-col flex-none border-b border-outline-variant bg-surface w-full">
          <div className="px-container-padding py-3.5 flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Date Display & Date Picker */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => dateInputRef.current && dateInputRef.current.showPicker()}
                  className="flex items-center gap-2 group hover:opacity-80 transition-opacity text-left cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                    event
                  </span>
                  <h2 className="font-headline-md text-lg sm:text-xl text-on-surface font-bold">
                    {formatDateDisplay(selectedDate)}
                  </h2>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">
                    arrow_drop_down
                  </span>
                </button>

                {/* Hidden Date Picker Input */}
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                />

                {/* Date Category Badge (Hôm nay / Quá khứ / Tương lai) */}
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${dateTagInfo.class}`}>
                  {dateTagInfo.label}
                </span>
              </div>


            </div>

            {/* Right: Date Navigation Chevrons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center border border-outline-variant/40"
                title="Ngày trước (Quá khứ)"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              
              <button
                onClick={handleScrollToday}
                className={`px-3.5 py-1 rounded-full text-xs font-bold border transition-colors ${
                  selectedDate === getTodayString()
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'border-outline-variant text-on-surface hover:bg-surface-container'
                }`}
              >
                Hôm nay
              </button>
              
              <button
                onClick={handleNextDay}
                className="p-1.5 hover:bg-surface-container rounded-lg transition-colors flex items-center justify-center border border-outline-variant/40"
                title="Ngày tiếp theo (Tương lai)"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Hour Scale Header */}
          <div
            ref={timeScaleRef}
            className="flex border-t border-outline-variant overflow-x-auto custom-scrollbar bg-surface-container-low w-full"
          >
            <div className="w-16 flex-none border-r border-outline-variant bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-outline">tag</span>
            </div>
            <div className="flex flex-none" style={{ width: '2400px' }}>
              {hours.map((h, idx) => (
                <div
                  key={idx}
                  className="w-[100px] flex-none flex items-center justify-center text-label-caps text-on-surface-variant font-bold border-r border-outline-variant py-2"
                >
                  {h}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Canvas */}
        <section
          ref={scrollRef}
          onScroll={handleScrollGrid}
          className="flex-1 overflow-auto custom-scrollbar relative bg-surface-bright w-full"
        >
          <div className="flex min-h-full" style={{ width: 'calc(2400px + 64px)' }}>
            
            {/* Left Index Column (Dashed borders) */}
            <div className="w-16 flex-none bg-surface-container-low border-r border-outline-variant sticky left-0 z-10">
              {indexRows.map((num) => (
                <div
                  key={num}
                  className="h-[48px] flex items-center justify-center font-label-caps text-on-surface-variant border-b border-dashed border-outline-variant/60"
                >
                  {num}
                </div>
              ))}
            </div>

            {/* Grid Area with Dashed Pattern */}
            <div
              className="flex-1 relative timeline-grid select-none"
              style={{ minHeight: '100%' }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
              }}
              onDrop={handleGridDrop}
            >
              
              {/* Vertical Guide Lines (Dashed) */}
              <div className="absolute inset-0 flex pointer-events-none">
                {hours.map((_, i) => (
                  <div key={i} className="w-[100px] h-full flex-none border-r border-dashed border-outline-variant/40" />
                ))}
              </div>

              {/* Empty state overlay when no tasks for selected date */}
              {filteredTasks.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 opacity-75">
                  <div className="bg-white/90 backdrop-blur border border-outline-variant/60 p-6 rounded-2xl shadow-lg text-center max-w-sm pointer-events-auto">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2">
                      event_busy
                    </span>
                    <h4 className="font-bold text-on-surface text-base">Chưa có track nào cho ngày này</h4>
                    <p className="text-xs text-on-surface-variant mt-1 mb-3">
                      Bạn đang xem {formatDateDisplay(selectedDate)}.
                    </p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:opacity-90 transition-all shadow-md"
                    >
                      + Thêm Track cho ngày này
                    </button>
                  </div>
                </div>
              )}

              {/* Task Items Filtered by Selected Date */}
              <div className="relative z-0 py-timeline-gutter">
                {filteredTasks.map((t) => {
                  const topPos = (t.row - 1) * 48 + 4;
                  const leftPos = (t.startHour || 0) * 100;
                  const widthPos = (t.durationHours || 1) * 100;

                  const isCancelled = t.status === 'Hủy';
                  const isBeingDragged = draggedTaskId === t.id;

                  return (
                    <div
                      key={t.id}
                      draggable={true}
                      onDragStart={(e) => {
                        setDraggedTaskId(t.id);
                        e.dataTransfer.setData('text/plain', String(t.id));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onClick={() => setSelectedTask(t)}
                      className={`absolute group cursor-grab active:cursor-grabbing transition-all hover:z-20 ${
                        t.completed ? 'opacity-85' : ''
                      } ${isCancelled ? 'opacity-50' : ''} ${
                        isBeingDragged ? 'opacity-40 scale-95 ring-2 ring-primary ring-offset-2' : ''
                      }`}
                      style={{
                        top: `${topPos}px`,
                        left: `${leftPos}px`,
                        width: `${widthPos}px`,
                        height: '40px'
                      }}
                      title="Kéo thả để sắp xếp lại giờ & hàng, hoặc click để xem chi tiết"
                    >
                      <div
                        className={`w-full h-full rounded-full flex items-center px-2.5 shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all ${t.bgClass}`}
                      >
                        {/* Drag indicator handle */}
                        <span
                          className="material-symbols-outlined text-[16px] mr-0.5 opacity-60 cursor-grab active:cursor-grabbing hover:opacity-100 flex-none"
                          title="Kéo thả vị trí"
                        >
                          drag_indicator
                        </span>

                        {/* Nút mũi tên Lên / Xuống hàng */}
                        <div className="flex flex-col justify-center gap-[1px] mr-1 flex-none opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => moveTaskRow(t.id, 'up', e)}
                            disabled={t.row <= 1}
                            className="p-0 hover:bg-black/20 rounded disabled:opacity-20 transition-all flex items-center justify-center"
                            title="Di chuyển lên hàng trên (Lên ⬆)"
                          >
                            <span className="material-symbols-outlined text-[11px] leading-none">keyboard_arrow_up</span>
                          </button>
                          <button
                            onClick={(e) => moveTaskRow(t.id, 'down', e)}
                            disabled={t.row >= 20}
                            className="p-0 hover:bg-black/20 rounded disabled:opacity-20 transition-all flex items-center justify-center"
                            title="Di chuyển xuống hàng dưới (Xuống ⬇)"
                          >
                            <span className="material-symbols-outlined text-[11px] leading-none">keyboard_arrow_down</span>
                          </button>
                        </div>

                        <button
                          onClick={(e) => toggleTaskCompletion(t.id, e)}
                          className="mr-1.5 hover:scale-125 transition-transform flex items-center justify-center flex-none"
                          title={t.completed ? 'Đánh dấu chưa xong' : 'Đánh dấu đã hoàn thành'}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {t.completed ? 'check_circle' : 'radio_button_unchecked'}
                          </span>
                        </button>

                        <span className="material-symbols-outlined text-[16px] mr-1.5 opacity-90 flex-none">
                          {getActivityIcon(t.activityType)}
                        </span>

                        <span className={`font-label-caps text-label-caps truncate flex-1 font-medium ${
                          t.completed || isCancelled ? 'line-through' : ''
                        }`}>
                          {t.title}
                        </span>

                        {t.status && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 flex-none opacity-90 ${getStatusBadge(t.status)}`}>
                            {t.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Modal CREATE NEW TRACK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-outline-variant p-6 rounded-2xl w-full max-w-lg shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-outline-variant/50">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">add_task</span>
                <h3 className="font-headline-md text-xl font-bold text-on-surface">Thêm Track Mới</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1 font-semibold">
                  Tiêu đề (Title) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Ăn trưa cùng nhóm, Khởi chạy chiến dịch..."
                  className="w-full px-3.5 py-2.5 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary text-body-base font-medium"
                />
              </div>

              {/* Date Selection (Ngày thực hiện) */}
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1 font-semibold">
                  Ngày thực hiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1 font-semibold">
                  Mô tả
                </label>
                <textarea
                  rows="2"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Nhập ghi chú hoặc mô tả chi tiết công việc..."
                  className="w-full px-3.5 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary text-body-base resize-none"
                />
              </div>

              {/* Khoảng thời gian */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-body-sm text-on-surface-variant mb-1 font-semibold">
                    Giờ bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-body-sm text-on-surface-variant mb-1 font-semibold">
                    Giờ kết thúc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1 font-semibold">
                  Địa điểm
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-sm">
                    location_on
                  </span>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Ví dụ: Nhà hàng Pizza 4P's, Phòng họp A..."
                    className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-xl bg-surface focus:outline-none focus:border-primary text-body-base"
                  />
                </div>
              </div>

              {/* Activity Type */}
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1.5 font-semibold">
                  Loại hoạt động
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_TYPES.map((act) => (
                    <button
                      type="button"
                      key={act.label}
                      onClick={() => setNewActivityType(act.label)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        newActivityType === act.label
                          ? `${act.colorClass} shadow-sm ring-2 ring-primary/40`
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{act.icon}</span>
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-body-sm text-on-surface-variant mb-1.5 font-semibold">
                  Trạng thái
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {STATUS_OPTIONS.map((st) => (
                    <button
                      type="button"
                      key={st.value}
                      onClick={() => handleStatusChange(st.value)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold border transition-all ${
                        newStatus === st.value
                          ? `${st.colorClass} ring-2 ring-offset-1 ring-primary shadow-sm`
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant border-outline-variant/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base mb-0.5">{st.icon}</span>
                      <span className="text-[11px] truncate w-full text-center">{st.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox completed & Row & Color */}
              <div className="p-3 bg-surface-container-low border border-outline-variant/50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newCompleted}
                      onChange={(e) => handleCompletedChange(e.target.checked)}
                      className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                    />
                    <span className="font-semibold text-sm text-on-surface">
                      Đánh dấu đã hoàn thành
                    </span>
                  </label>
                  {newCompleted && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Hoàn thành
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/40">
                  <div>
                    <label className="block text-xs text-on-surface-variant mb-1 font-semibold">
                      Hàng hiển thị (1-20)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={newRow}
                      onChange={(e) => setNewRow(e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 text-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-on-surface-variant mb-1 font-semibold">
                      Màu sắc thẻ
                    </label>
                    <select
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:border-primary"
                    >
                      <option value="bg-primary text-white">Xanh dương (Primary)</option>
                      <option value="bg-secondary text-white">Xanh lá (Secondary)</option>
                      <option value="bg-tertiary text-white">Cam (Tertiary)</option>
                      <option value="bg-secondary-container text-on-secondary-container">Xanh lục nhạt</option>
                      <option value="bg-error-container text-on-error-container">Đỏ nổi bật</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-sm font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full bg-primary text-white font-bold hover:opacity-90 shadow-md transition-all text-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>Tạo mới Track</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal DETAIL & EDIT TASK */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-outline-variant p-6 rounded-2xl w-full max-w-md shadow-2xl space-y-4">
            
            <div className="flex justify-between items-start border-b border-outline-variant/40 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary text-xl">
                    {getActivityIcon(selectedTask.activityType)}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-surface-container rounded-full text-on-surface-variant">
                    {selectedTask.activityType || 'Khác'}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStatusBadge(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                </div>
                <h3 className={`font-headline-md text-xl font-bold text-on-surface ${selectedTask.completed ? 'line-through text-gray-400' : ''}`}>
                  {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Date, Time & Location */}
            <div className="space-y-2 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">event</span>
                <span className="font-semibold text-on-surface">
                  {formatDateDisplay(selectedTask.date || TODAY_STR)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">schedule</span>
                <span className="font-semibold text-on-surface">
                  {selectedTask.startTime || '---'} – {selectedTask.endTime || '---'}
                </span>
                <span className="text-xs text-gray-500">({selectedTask.durationHours} giờ)</span>
              </div>
              {selectedTask.location && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">location_on</span>
                  <span className="font-medium text-on-surface">{selectedTask.location}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/40">
                <p className="text-xs text-on-surface-variant font-semibold mb-1">Mô tả:</p>
                <p className="text-sm text-on-surface whitespace-pre-wrap">{selectedTask.description}</p>
              </div>
            )}

            {/* Row Adjustment (Mũi tên Lên / Xuống) */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/60">
              <div>
                <span className="text-xs font-semibold text-on-surface-variant block">Sắp xếp Hàng (Row)</span>
                <span className="text-sm font-bold text-on-surface">Hàng hiện tại: <span className="text-primary">{selectedTask.row} / 20</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => moveTaskRow(selectedTask.id, 'up', e)}
                  disabled={selectedTask.row <= 1}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-primary hover:text-white border border-outline-variant/50 disabled:opacity-30 font-bold flex items-center gap-1 text-xs transition-all shadow-xs"
                  title="Di chuyển lên hàng trên"
                >
                  <span className="material-symbols-outlined text-base">arrow_upward</span>
                  <span>Lên</span>
                </button>
                <button
                  onClick={(e) => moveTaskRow(selectedTask.id, 'down', e)}
                  disabled={selectedTask.row >= 20}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-primary hover:text-white border border-outline-variant/50 disabled:opacity-30 font-bold flex items-center gap-1 text-xs transition-all shadow-xs"
                  title="Di chuyển xuống hàng dưới"
                >
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                  <span>Xuống</span>
                </button>
              </div>
            </div>

            {/* Quick Completion Toggle in Detail Modal */}
            <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-outline-variant">
              <span className="text-sm font-semibold text-on-surface">Đánh dấu đã hoàn thành</span>
              <button
                onClick={() => toggleTaskCompletion(selectedTask.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                  selectedTask.completed
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {selectedTask.completed ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <span>{selectedTask.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</span>
              </button>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/40">
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="px-3 py-1.5 rounded-full text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-base">delete</span>
                <span>Xóa Track</span>
              </button>
              
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-1.5 bg-primary text-white text-xs font-bold rounded-full hover:opacity-90 shadow-sm"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
