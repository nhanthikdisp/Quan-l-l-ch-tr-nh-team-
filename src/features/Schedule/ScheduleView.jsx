import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTrip } from '../../store/TripContext';
import { timeStringToHour, hourToTimeString, formatDateDisplay } from '../../utils/formatters';

const ACTIVITY_TYPES = ['Ăn uống', 'Ngắm cảnh', 'Bonding', 'Công việc', 'Khác'];

export default function ScheduleView() {
  const { currentUser, isLead } = useAuth();
  const {
    events,
    members,
    addEvent,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent,
    toggleEventComplete
  } = useTrip();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const gridScrollRef = useRef(null);
  const [sliderHour, setSliderHour] = useState(8);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [activityType, setActivityType] = useState('Ăn uống');
  const [cost, setCost] = useState('');
  const [payerId, setPayerId] = useState(currentUser?.uid || '');
  const [assignedMembers, setAssignedMembers] = useState(members.map(m => m.id));
  const [targetRow, setTargetRow] = useState(1);
  const [formError, setFormError] = useState('');

  const [speechMsg, setSpeechMsg] = useState('Cố gắng lên, Moo-ve thôi!');
  const messages = [
    'Cố gắng lên, Moo-ve thôi!',
    'Đã đến lúc làm việc rồi!',
    'Bạn đang làm rất tốt!',
    'Đừng quên nghỉ ngơi nhé!',
    'Hành trình tuyệt vời lắm!'
  ];

  useEffect(() => {
    let idx = 0;
    const timer = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setSpeechMsg(messages[idx]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleOpenModal = () => openModal();
    window.addEventListener('open-new-track-modal', handleOpenModal);
    return () => window.removeEventListener('open-new-track-modal', handleOpenModal);
  }, []);

  const [cowPercent, setCowPercent] = useState(46.8);

  useEffect(() => {
    const calcCowPos = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();

      const currentMinutesFromMidnight = h * 60 + m;
      const totalMinutesDay = 24 * 60;

      let pct = (currentMinutesFromMidnight / totalMinutesDay) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;

      setCowPercent(pct);
    };

    calcCowPos();
    const interval = setInterval(calcCowPos, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSliderChange = (e) => {
    const targetHour = parseFloat(e.target.value);
    setSliderHour(targetHour);

    if (gridScrollRef.current) {
      const scrollWidth = gridScrollRef.current.scrollWidth - gridScrollRef.current.clientWidth;
      const pct = targetHour / 24;
      gridScrollRef.current.scrollLeft = scrollWidth * pct;
    }
  };

  const handleGridScroll = (e) => {
    const container = e.target;
    const scrollWidth = container.scrollWidth - container.clientWidth;
    if (scrollWidth > 0) {
      const pct = container.scrollLeft / scrollWidth;
      setSliderHour(parseFloat((pct * 24).toFixed(1)));
    }
  };

  const jumpToHour = (targetHour) => {
    setSliderHour(targetHour);
    if (gridScrollRef.current) {
      const scrollWidth = gridScrollRef.current.scrollWidth - gridScrollRef.current.clientWidth;
      const pct = targetHour / 24;
      gridScrollRef.current.scrollTo({ left: scrollWidth * pct, behavior: 'smooth' });
    }
  };

  const jumpToCow = () => {
    const now = new Date();
    const currentH = now.getHours() + now.getMinutes() / 60;
    jumpToHour(Math.max(0, currentH - 2));
  };

  useEffect(() => {
    jumpToHour(7);
  }, [selectedDate]);

  const openModal = (evt = null) => {
    setFormError('');
    if (evt) {
      setEditingEventId(evt.id);
      setTitle(evt.title || '');
      setDescription(evt.description || '');
      setDate(evt.date || selectedDate);
      setStartTime(evt.startTime || '09:00');
      setEndTime(evt.endTime || '11:00');
      setLocation(evt.location || '');
      setActivityType(evt.activityType || 'Ăn uống');
      setCost(evt.cost ? String(evt.cost) : '');
      setPayerId(evt.payerId || currentUser?.uid || '');
      setAssignedMembers(evt.assignedMembers || members.map(m => m.id));
      setTargetRow(evt.row || 1);
    } else {
      setEditingEventId(null);
      setTitle('');
      setDescription('');
      setDate(selectedDate);
      setStartTime('09:00');
      setEndTime('11:00');
      setLocation('');
      setActivityType('Ăn uống');
      setCost('');
      setPayerId(currentUser?.uid || members[0]?.id || '');
      setAssignedMembers(members.map(m => m.id));
      setTargetRow(1);
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      const startH = timeStringToHour(startTime);
      let endH = timeStringToHour(endTime);
      if (endH <= startH) endH = startH + 1;

      const formData = {
        title,
        description,
        date,
        startTime,
        endTime,
        startHour: startH,
        durationHours: Math.max(0.5, endH - startH),
        location,
        activityType,
        cost: Number(cost) || 0,
        payerId: payerId || members[0]?.id,
        assignedMembers: assignedMembers.length > 0 ? assignedMembers : [currentUser?.uid],
        row: Number(targetRow) || 1
      };

      if (editingEventId) {
        await updateEvent(editingEventId, formData);
      } else {
        await addEvent(formData);
      }

      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Lỗi lưu sự kiện!');
    }
  };

  const handleDragStart = (evtId, e) => {
    setDraggedTaskId(evtId);
    e.dataTransfer.setData('text/plain', evtId);
  };

  const handleGridDragOver = (e) => {
    e.preventDefault();
  };

  const handleGridDrop = (e) => {
    e.preventDefault();
    const evtId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!evtId) return;

    const evtObj = events.find(e => String(e.id) === String(evtId));
    if (!evtObj) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const droppedRow = Math.max(1, Math.min(12, Math.floor(clickY / 60) + 1));
    const hourOffset = (clickX / rect.width) * 24;
    const droppedStartHour = Math.max(0, Math.min(23.5, Math.floor(hourOffset * 2) / 2));

    const duration = evtObj.durationHours || 1.5;
    const newEndHour = Math.min(24, droppedStartHour + duration);

    try {
      updateEvent(evtObj.id, {
        row: droppedRow,
        startHour: droppedStartHour,
        startTime: hourToTimeString(droppedStartHour),
        endTime: hourToTimeString(newEndHour)
      });
    } catch (err) {
      console.warn('Drag drop error:', err);
    }

    setDraggedTaskId(null);
  };

  const pendingEvents = events.filter(e => e.status === 'Chờ duyệt');
  const activeEventsOnDate = events.filter(e => e.date === selectedDate);
  const hoursList = Array.from({ length: 25 }, (_, i) => String(i).padStart(2, '0') + ':00');

  return (
    <div className="space-y-6">

      {/* TOP CALENDAR TOOLBAR */}
      <div className="px-6 py-4 border-b border-surface-variant flex flex-wrap gap-4 items-center justify-between bg-surface-container-lowest rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-on-surface">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            <h2 className="text-xl font-bold text-cow-spot">
              {formatDateDisplay(selectedDate)}
            </h2>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold border-0 cursor-pointer focus:ring-0 text-cow-spot"
            />
          </div>
          <span className="bg-pastel-green text-green-800 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
            Hôm nay
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate + 'T00:00:00');
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="w-10 h-10 rounded-full border border-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-5 py-2 rounded-full bg-tertiary text-on-tertiary font-bold text-xs shadow-sm hover:bg-tertiary/90 transition-colors cursor-pointer"
          >
            Hôm nay
          </button>

          <button
            onClick={() => {
              const d = new Date(selectedDate + 'T00:00:00');
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split('T')[0]);
            }}
            className="w-10 h-10 rounded-full border border-surface-variant flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      {/* TIME AXIS SLIDER BAR */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-tactile border border-surface-variant space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">tune</span>
            <h3 className="text-sm font-extrabold text-cow-spot">Thanh Trượt Trục Thời Gian 24 Giờ</h3>
            <span className="bg-soft-pink text-cow-spot px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
              Khung giờ: {hourToTimeString(sliderHour)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => jumpToHour(0)}
              className="px-3 py-1 bg-surface-container text-cow-spot rounded-full text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              🌙 Đêm (00:00)
            </button>
            <button
              onClick={() => jumpToHour(7)}
              className="px-3 py-1 bg-surface-container text-cow-spot rounded-full text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              🌅 Sáng (07:00)
            </button>
            <button
              onClick={() => jumpToHour(12)}
              className="px-3 py-1 bg-surface-container text-cow-spot rounded-full text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              ☀️ Trưa (12:00)
            </button>
            <button
              onClick={() => jumpToHour(18)}
              className="px-3 py-1 bg-surface-container text-cow-spot rounded-full text-xs font-bold hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              🌆 Tối (18:00)
            </button>
            <button
              onClick={jumpToCow}
              className="px-3.5 py-1 bg-pastel-purple text-purple-900 border border-purple-300 rounded-full text-xs font-extrabold flex items-center gap-1 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              🐮 Theo Con Bò
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-bold text-on-surface-variant font-mono">00:00</span>
          <input
            type="range"
            min="0"
            max="24"
            step="0.25"
            value={sliderHour}
            onChange={handleSliderChange}
            className="w-full accent-tertiary h-2.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs font-bold text-on-surface-variant font-mono">24:00</span>
        </div>
      </div>

      {/* LEAD APPROVAL SECTION */}
      {(isLead && pendingEvents.length > 0) && (
        <div className="bg-tertiary-container/60 rounded-3xl p-6 shadow-tactile border-2 border-tertiary">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-tertiary text-2xl">gavel</span>
            <div>
              <h3 className="text-base font-extrabold text-tertiary">KHU VỰC XÉT DUYỆT • DÀNH CHO LEAD ({pendingEvents.length})</h3>
              <p className="text-xs text-on-tertiary-container font-medium">Thành viên đề xuất sự kiện. Duyệt hoặc từ chối để đưa vào lịch chính thức.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-2xl p-4 border border-tertiary shadow-sm flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-extrabold bg-tertiary text-white px-2.5 py-0.5 rounded-full uppercase">
                      Đề xuất: {evt.createdByName}
                    </span>
                    <span className="text-xs font-bold text-cow-spot">
                      🕒 {evt.startTime} – {evt.endTime}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-cow-spot text-sm">{evt.title}</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">{evt.description || 'Không có mô tả'}</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-surface-variant">
                  <button
                    onClick={() => approveEvent(evt.id)}
                    className="flex-1 py-1.5 bg-moo-green text-white text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>Duyệt sự kiện</span>
                  </button>
                  <button
                    onClick={() => rejectEvent(evt.id)}
                    className="py-1.5 px-3 bg-error text-white text-xs font-bold rounded-full shadow-sm hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    <span>Từ chối</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULE TRACK GRID CANVAS */}
      <div className="bg-surface-container-lowest rounded-3xl border border-surface-variant shadow-tactile overflow-hidden relative">
        <div
          ref={gridScrollRef}
          onScroll={handleGridScroll}
          className="overflow-x-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#FFC0CB #f9ebe3' }}
        >
          <div className="flex border-b border-surface-variant bg-surface-container-lowest sticky top-0 z-20 min-w-[2400px]">
            <div className="w-16 flex-shrink-0 border-r border-surface-variant flex items-center justify-center font-bold text-xs text-on-surface-variant bg-surface-container-low sticky left-0 z-30">
              Hàng
            </div>
            <div className="flex-1 grid grid-cols-24 min-w-[2300px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
              {hoursList.slice(0, 24).map(t => (
                <div key={t} className="text-center py-2.5 text-xs font-bold text-on-surface-variant border-r border-surface-variant border-dashed">
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-[720px] min-w-[2400px] relative">
            <div className="w-16 flex-shrink-0 border-r border-surface-variant bg-surface-container-lowest sticky left-0 z-20 font-bold shadow-xs">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(r => (
                <div key={r} className="h-[60px] flex items-center justify-center text-xs text-on-surface-variant border-b border-surface-variant/40">
                  {r}
                </div>
              ))}
            </div>

            <div
              className="flex-1 min-w-[2300px] relative bg-[#fff8f5]"
              onDragOver={handleGridDragOver}
              onDrop={handleGridDrop}
            >
              <div className="absolute inset-0 pointer-events-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(r => (
                  <div key={r} className="h-[60px] border-b border-surface-variant/40"></div>
                ))}
              </div>

              <div
                className="absolute inset-y-0 w-0.5 bg-cow-spot z-20 pointer-events-none transition-all duration-700 ease-linear"
                style={{ left: `${cowPercent}%` }}
              ></div>

              <div
                className="absolute top-[2px] -ml-5 w-12 h-12 z-30 transition-all duration-700 ease-linear pointer-events-none"
                style={{ left: `${cowPercent}%` }}
              >
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white border-2 border-soft-pink rounded-full px-3 py-0.5 shadow-sm whitespace-nowrap z-40">
                  <span className="text-[10px] font-extrabold text-cow-spot">
                    {speechMsg}
                  </span>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-2 border-b-2 border-soft-pink rotate-45"></div>
                </div>

                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBin37itLYhRkRc8USeXzO82Lku9k64dNP9TzFuRTuB64cKG0dCT4w03mU4zQp_PRApqIj_zk_Jv_AzGGmhkAb_qJXco53KhjSCz1Bw7L85QWBXxYCZgO1oL6z_45tlqnRzuQ9Fl3I7NmGwCvikeCQ4C4mHonVvtKPsyy4k5Smpke5kvkMi3L6eG12AV30cx5FiKS1rSUJ8P3harq4HPiNybpG2NZwJN8BjmRqTaA4PULmdaI-bOMUlz69sDNqRZO_TkA"
                  alt="Tracker Cow"
                  className="w-full h-full object-contain drop-shadow-md animate-cow-walk"
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>

              {activeEventsOnDate.map(evt => {
                const row = evt.row || 1;
                const startH = evt.startHour || timeStringToHour(evt.startTime) || 9;
                const duration = evt.durationHours || 1.5;

                const startOffsetPct = Math.max(0, Math.min(100, (startH / 24) * 100));
                const widthPct = Math.max(2.5, Math.min(100 - startOffsetPct, (duration / 24) * 100));
                const topPx = (row - 1) * 60 + 10;

                const isOngoing = evt.status === 'Đang diễn ra';
                const isCompleted = evt.status === 'Đã xong' || evt.completed;

                let bgPillClass = 'bg-cow-spot text-white';
                let statusBadgeClass = 'bg-soft-pink text-cow-spot';

                if (isCompleted) {
                  bgPillClass = 'bg-tertiary text-on-tertiary';
                  statusBadgeClass = 'bg-moo-green text-white';
                } else if (isOngoing) {
                  bgPillClass = 'bg-moo-green text-white border border-green-700';
                  statusBadgeClass = 'bg-soft-pink text-cow-spot';
                } else if (evt.activityType === 'Ngắm cảnh') {
                  bgPillClass = 'bg-pastel-green text-green-900 border border-green-300';
                  statusBadgeClass = 'bg-soft-pink text-cow-spot';
                } else if (evt.activityType === 'Ăn uống') {
                  bgPillClass = 'bg-cow-spot text-white';
                  statusBadgeClass = 'bg-soft-pink text-cow-spot';
                }

                return (
                  <div
                    key={evt.id}
                    draggable
                    onDragStart={(e) => handleDragStart(evt.id, e)}
                    onClick={() => openModal(evt)}
                    style={{
                      top: `${topPx}px`,
                      left: `${startOffsetPct}%`,
                      width: `${widthPct}%`,
                      height: '40px'
                    }}
                    className={`absolute rounded-full shadow-md flex items-center px-3 gap-2 z-10 cursor-move hover:scale-[1.02] transition-transform select-none ${bgPillClass}`}
                  >
                    <span className="material-symbols-outlined text-[16px] opacity-70">drag_indicator</span>
                    
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleEventComplete(evt.id); }}
                      className="cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isCompleted ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                    </button>

                    <span className="material-symbols-outlined text-[16px]">
                      {evt.activityType === 'Ăn uống' ? 'restaurant' : evt.activityType === 'Ngắm cảnh' ? 'photo_camera' : evt.activityType === 'Bonding' ? 'groups' : 'work'}
                    </span>

                    <span className="font-bold text-xs truncate flex-1">{evt.title}</span>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto shrink-0 ${statusBadgeClass}`}>
                      {evt.status}
                    </span>
                  </div>
                );
              })}

            </div>
          </div>

        </div>
      </div>

      {/* MODAL FOR CREATE / EDIT EVENT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cow-spot/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface-container-lowest rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-cow-spot max-h-[90vh] overflow-y-auto my-8">
            
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-surface-variant">
              <h3 className="text-lg font-extrabold text-cow-spot flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">edit_calendar</span>
                {editingEventId ? 'Chỉnh Sửa Sự Kiện' : isLead ? '+ New Track Lịch Trình' : 'Gửi Đề Xuất Sự Kiện (Chờ Duyệt)'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-300">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                  Tên Sự Kiện <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Review thiết kế giao diện"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tertiary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                  Mô Tả
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả chi tiết..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-outline-variant bg-surface-container-low text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tertiary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">Ngày</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">Giờ Bắt Đầu</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">Giờ Kết Thúc</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">Hàng Track (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={targetRow}
                    onChange={e => setTargetRow(e.target.value)}
                    className="w-full px-3 py-2 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">Loại Hoạt Động</label>
                  <select
                    value={activityType}
                    onChange={e => setActivityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold cursor-pointer"
                  >
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">Chi Phí (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 450000"
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-variant flex justify-between items-center">
                {editingEventId && (
                  <button
                    type="button"
                    onClick={() => { deleteEvent(editingEventId); setShowModal(false); }}
                    className="px-4 py-2 bg-rose-100 text-rose-800 text-xs font-bold rounded-full hover:bg-rose-200 cursor-pointer"
                  >
                    Xóa Sự Kiện
                  </button>
                )}

                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-surface-container text-cow-spot font-bold text-xs rounded-full cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-soft-pink text-cow-spot font-extrabold text-xs rounded-full border-2 border-cow-spot shadow-pressable hover:shadow-pressable-hover cursor-pointer"
                  >
                    {editingEventId ? 'Lưu Thay Đổi' : isLead ? '+ Thêm Track' : 'Gửi Đề Xuất'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
