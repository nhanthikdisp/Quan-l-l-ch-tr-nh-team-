import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseOnline, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc } from '../services/firebase';
import { calculateTripExpenses } from '../utils/expenseCalculations';

const TripContext = createContext();

export const useTrip = () => useContext(TripContext);

const getTodayStr = () => new Date().toISOString().split('T')[0];

const DEBUG_USER_IDS = ['user_lead_1', 'user_member_1', 'user_member_2'];
const DEBUG_USER_EMAILS = ['lead@chronos.vn', 'thanhvien1@chronos.vn', 'thanhvien2@chronos.vn'];
const DEBUG_EVENT_IDS = ['evt_1', 'evt_2', 'evt_3', 'evt_4'];

const isDebugUser = (user) => {
  if (!user) return false;
  const uid = user.uid || user.id || '';
  const email = (user.email || '').toLowerCase();
  return DEBUG_USER_IDS.includes(uid) || DEBUG_USER_EMAILS.includes(email);
};

const DEFAULT_MEMBERS = [
  { id: 'user_lead_1', email: 'lead@chronos.vn', name: 'Nguyễn Văn Lead', role: 'Lead', skillRole: 'Dẫn đoàn', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lead' },
  { id: 'user_member_1', email: 'thanhvien1@chronos.vn', name: 'Trần Thị Thu', role: 'Member', skillRole: 'Xem map & Chụp hình', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Thu' },
  { id: 'user_member_2', email: 'thanhvien2@chronos.vn', name: 'Lê Hoàng Nam', role: 'Member', skillRole: 'Nấu ăn & Thủ quỹ', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nam' },
];

const DEFAULT_EVENTS_BUILDER = (todayStr) => [
  {
    id: 'evt_1',
    title: 'Team Sync: Chiến lược Q4',
    description: 'Tập trung thảo luận định hướng quý 4.',
    date: todayStr,
    startTime: '08:30',
    endTime: '11:00',
    startHour: 8.5,
    durationHours: 2.5,
    location: 'Phòng họp A',
    activityType: 'Công việc',
    status: 'Đã xong',
    completed: true,
    assignedMembers: ['user_lead_1', 'user_member_1', 'user_member_2'],
    participantEmails: ['lead@chronos.vn', 'thanhvien1@chronos.vn', 'thanhvien2@chronos.vn'],
    cost: 600000,
    payerId: 'user_lead_1',
    payerEmail: 'lead@chronos.vn',
    createdBy: 'user_lead_1',
    createdByName: 'Nguyễn Văn Lead',
    row: 1
  },
  {
    id: 'evt_2',
    title: 'Review thiết kế giao diện',
    description: 'Đánh giá các bản thiết kế UI/UX.',
    date: todayStr,
    startTime: '10:00',
    endTime: '14:00',
    startHour: 10,
    durationHours: 4,
    location: 'Creative Lab',
    activityType: 'Công việc',
    status: 'Đang diễn ra',
    completed: false,
    assignedMembers: ['user_lead_1', 'user_member_1'],
    participantEmails: ['lead@chronos.vn', 'thanhvien1@chronos.vn'],
    cost: 450000,
    payerId: 'user_member_2',
    payerEmail: 'thanhvien2@chronos.vn',
    createdBy: 'user_lead_1',
    createdByName: 'Nguyễn Văn Lead',
    row: 2
  },
  {
    id: 'evt_3',
    title: 'Bữa trưa giao lưu thân mật',
    description: 'Thưởng thức ăn trưa cùng toàn đội.',
    date: todayStr,
    startTime: '12:00',
    endTime: '13:30',
    startHour: 12,
    durationHours: 1.5,
    location: 'Nhà hàng Pizza 4P\'s',
    activityType: 'Ăn uống',
    status: 'Sắp tới',
    completed: false,
    assignedMembers: ['user_lead_1', 'user_member_1', 'user_member_2'],
    participantEmails: ['lead@chronos.vn', 'thanhvien1@chronos.vn', 'thanhvien2@chronos.vn'],
    cost: 350000,
    payerId: 'user_member_1',
    payerEmail: 'thanhvien1@chronos.vn',
    createdBy: 'user_member_1',
    createdByName: 'Trần Thị Thu',
    row: 3
  },
  {
    id: 'evt_4',
    title: 'Dã ngoại ngắm cảnh hoàng hôn',
    description: 'Hoạt động ngắm cảnh teambuilding.',
    date: todayStr,
    startTime: '15:30',
    endTime: '17:30',
    startHour: 15.5,
    durationHours: 2,
    location: 'Công viên Hồ Tây',
    activityType: 'Ngắm cảnh',
    status: 'Sắp tới',
    completed: false,
    assignedMembers: ['user_lead_1', 'user_member_1'],
    participantEmails: ['lead@chronos.vn', 'thanhvien1@chronos.vn'],
    cost: 200000,
    payerId: 'user_lead_1',
    payerEmail: 'lead@chronos.vn',
    createdBy: 'user_lead_1',
    createdByName: 'Nguyễn Văn Lead',
    row: 4
  }
];

export const TripProvider = ({ children }) => {
  const { currentUser, isLead } = useAuth();
  const todayStr = getTodayStr();

  // Clear obsolete localStorage caches
  useEffect(() => {
    try {
      localStorage.removeItem('chronos_trip_members');
      localStorage.removeItem('chronos_trip_events');
    } catch (e) {}
  }, []);

  const [members, setMembers] = useState(DEFAULT_MEMBERS);
  const [events, setEvents] = useState(() => DEFAULT_EVENTS_BUILDER(todayStr));

  // Sync state when currentUser changes (Debug demo user vs Newly registered user)
  useEffect(() => {
    if (!currentUser) return;

    if (isDebugUser(currentUser)) {
      setMembers(prev => {
        const hasDebug = prev.some(m => DEBUG_USER_IDS.includes(m.id));
        return hasDebug ? prev : DEFAULT_MEMBERS;
      });

      setEvents(prev => {
        const hasDebug = prev.some(e => DEBUG_EVENT_IDS.includes(e.id));
        return hasDebug ? prev : DEFAULT_EVENTS_BUILDER(todayStr);
      });
    } else {
      // NEW USER (Non-debug user)
      setMembers(prev => {
        const cleaned = prev.filter(m => !DEBUG_USER_IDS.includes(m.id) && !DEBUG_USER_EMAILS.includes((m.email || '').toLowerCase()));
        const userObj = {
          id: currentUser.uid,
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role || 'Lead',
          skillRole: currentUser.skillRole || (currentUser.role === 'Lead' ? 'Leader (Trưởng đoàn)' : 'Member (Thành viên)'),
          avatar: currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentUser.name)}`
        };
        const exists = cleaned.some(m => m.id === currentUser.uid || (m.email && m.email.toLowerCase() === (currentUser.email || '').toLowerCase()));
        return exists ? cleaned : [userObj, ...cleaned];
      });

      setEvents(prev => {
        const cleaned = prev.filter(e => !DEBUG_EVENT_IDS.includes(e.id));
        const userEvts = cleaned.filter(e => e.createdBy === currentUser.uid || e.assignedMembers?.includes(currentUser.uid) || e.participantEmails?.includes(currentUser.email));
        if (userEvts.length === 0) {
          const sampleEvt = {
            id: 'evt_' + Date.now(),
            title: `Chào mừng ${currentUser.name} - Lịch trình mới`,
            description: 'Đây là sự kiện khởi đầu cho lịch trình chuyến đi của bạn.',
            date: todayStr,
            startTime: '09:00',
            endTime: '10:30',
            startHour: 9,
            durationHours: 1.5,
            location: 'Địa điểm cá nhân',
            activityType: 'Công việc',
            status: currentUser.role === 'Lead' ? 'Sắp tới' : 'Chờ duyệt',
            completed: false,
            assignedMembers: [currentUser.uid],
            participantEmails: [currentUser.email],
            cost: 0,
            payerId: currentUser.uid,
            payerEmail: currentUser.email,
            createdBy: currentUser.uid,
            createdByName: currentUser.name,
            row: 1
          };
          return [sampleEvt];
        }
        return cleaned;
      });
    }
  }, [currentUser]);

  // Firestore sync listener
  useEffect(() => {
    if (isFirebaseOnline && db) {
      try {
        const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
          if (!snapshot.empty) {
            const fetched = [];
            snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
            if (currentUser && !isDebugUser(currentUser)) {
              const nonDebug = fetched.filter(e => !DEBUG_EVENT_IDS.includes(e.id) && (e.createdBy === currentUser.uid || e.assignedMembers?.includes(currentUser.uid) || e.participantEmails?.includes(currentUser.email)));
              if (nonDebug.length > 0) {
                setEvents(nonDebug);
              }
            } else {
              setEvents(fetched);
            }
          }
        }, (err) => console.warn('Firestore sync note:', err));
        return () => unsub();
      } catch (e) { }
    }
  }, [currentUser]);

  // Realtime Status Engine
  useEffect(() => {
    const updateRealtimeStatus = () => {
      const now = new Date();
      const hStr = String(now.getHours()).padStart(2, '0');
      const mStr = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${hStr}:${mStr}`;
      const currentDateStr = getTodayStr();

      setEvents(prevEvents => {
        let updated = false;
        const newEvents = prevEvents.map(evt => {
          if (evt.status === 'Tạm hoãn' || evt.status === 'Hủy' || evt.status === 'Chờ duyệt') {
            return evt;
          }
          let newStatus = evt.status;
          if (evt.date < currentDateStr) newStatus = 'Đã xong';
          else if (evt.date > currentDateStr) newStatus = 'Sắp tới';
          else {
            if (currentTimeStr >= evt.endTime) newStatus = 'Đã xong';
            else if (currentTimeStr >= evt.startTime && currentTimeStr < evt.endTime) newStatus = 'Đang diễn ra';
            else if (currentTimeStr < evt.startTime) newStatus = 'Sắp tới';
          }
          if (newStatus !== evt.status) {
            updated = true;
            return { ...evt, status: newStatus };
          }
          return evt;
        });
        return updated ? newEvents : prevEvents;
      });
    };

    updateRealtimeStatus();
    const interval = setInterval(updateRealtimeStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Validation
  const validateEvent = (eventData, currentId = null) => {
    if (!eventData.title || !eventData.title.trim()) {
      throw new Error('Tên sự kiện không được để trống!');
    }
    if (eventData.startTime && eventData.endTime) {
      if (eventData.endTime <= eventData.startTime) {
        throw new Error('Giờ kết thúc phải diễn ra sau giờ bắt đầu!');
      }
    }
    if (eventData.status !== 'Chờ duyệt') {
      const activeSameDate = events.filter(e =>
        e.id !== currentId &&
        e.date === eventData.date &&
        e.status !== 'Hủy' &&
        e.status !== 'Chờ duyệt'
      );
      const overlap = activeSameDate.some(e =>
        (eventData.startTime < e.endTime) && (eventData.endTime > e.startTime)
      );
      if (overlap) {
        throw new Error('Khung giờ này bị trùng lắp với một sự kiện chính thức khác!');
      }
    }
  };

  const addEvent = async (eventData) => {
    const defaultStatus = isLead ? 'Sắp tới' : 'Chờ duyệt';
    const newEvt = {
      ...eventData,
      id: 'evt_' + Date.now(),
      status: eventData.status || defaultStatus,
      completed: false,
      createdBy: currentUser?.uid || 'guest',
      createdByName: currentUser?.name || 'Thành viên',
      cost: Number(eventData.cost) || 0,
      assignedMembers: eventData.assignedMembers || [currentUser?.uid],
      participantEmails: eventData.participantEmails || [currentUser?.email].filter(Boolean),
      row: Number(eventData.row) || 1
    };

    validateEvent(newEvt);
    setEvents(prev => [...prev, newEvt]);

    if (isFirebaseOnline && db) {
      try { await addDoc(collection(db, 'events'), newEvt); } catch (e) { }
    }
    return newEvt;
  };

  const updateEvent = async (id, eventData) => {
    const existing = events.find(e => e.id === id);
    if (!existing) return;

    if (!isLead) {
      if (existing.createdBy !== currentUser?.uid) {
        throw new Error('Bạn chỉ có quyền sửa sự kiện do mình tạo!');
      }
      if (existing.status !== 'Chờ duyệt') {
        throw new Error('Chỉ Lead mới được sửa sự kiện đã duyệt!');
      }
    }

    const updated = { ...existing, ...eventData, cost: Number(eventData.cost) || 0 };
    validateEvent(updated, id);
    setEvents(prev => prev.map(e => e.id === id ? updated : e));

    if (isFirebaseOnline && db) {
      try { await setDoc(doc(db, 'events', id), updated, { merge: true }); } catch (e) { }
    }
  };

  const deleteEvent = async (id) => {
    const existing = events.find(e => e.id === id);
    if (!existing) return;

    if (!isLead) {
      if (existing.createdBy !== currentUser?.uid) throw new Error('Bạn chỉ có quyền xóa sự kiện do mình tạo!');
      if (existing.status !== 'Chờ duyệt') throw new Error('Chỉ Lead mới được xóa sự kiện đã duyệt!');
    }

    setEvents(prev => prev.filter(e => e.id !== id));
    if (isFirebaseOnline && db) {
      try { await deleteDoc(doc(db, 'events', id)); } catch (e) { }
    }
  };

  const approveEvent = async (id) => {
    if (!isLead) throw new Error('Chỉ Lead mới được duyệt sự kiện!');
    const evt = events.find(e => e.id === id);
    if (!evt) return;
    const approved = { ...evt, status: 'Sắp tới' };
    validateEvent(approved, id);
    setEvents(prev => prev.map(e => e.id === id ? approved : e));
  };

  const rejectEvent = async (id) => {
    if (!isLead) throw new Error('Chỉ Lead mới được từ chối!');
    deleteEvent(id);
  };

  const toggleEventComplete = async (id) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        const nextComp = !e.completed;
        return { ...e, completed: nextComp, status: nextComp ? 'Đã xong' : 'Sắp tới' };
      }
      return e;
    }));
  };

  const addMember = (memberData) => {
    if (!isLead) throw new Error('Chỉ Lead mới có quyền thêm thành viên!');
    const newMember = {
      id: 'user_' + Date.now(),
      email: memberData.email || '',
      name: memberData.name,
      role: memberData.role || 'Member',
      skillRole: memberData.skillRole || 'Thành viên',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(memberData.name)}`
    };
    setMembers(prev => [...prev, newMember]);
    return newMember;
  };

  const addParticipantByEmail = async (eventId, inputEmail) => {
    if (!isLead) throw new Error('Chỉ Leader mới được phép nhập email thêm thành viên vào sự kiện!');
    const emailStr = (inputEmail || '').trim().toLowerCase();
    if (!emailStr || !emailStr.includes('@')) {
      throw new Error('Vui lòng nhập định dạng Email hợp lệ!');
    }

    const existingEvt = events.find(e => e.id === eventId);
    if (!existingEvt) throw new Error('Không tìm thấy sự kiện!');

    const currentEmails = existingEvt.participantEmails || [];
    if (currentEmails.map(e => e.toLowerCase()).includes(emailStr)) {
      throw new Error(`Email ${emailStr} đã có trong danh sách tham gia sự kiện này!`);
    }

    // Check if email matches existing member
    const foundMember = members.find(m => m.email && m.email.toLowerCase() === emailStr);
    const updatedAssigned = [...(existingEvt.assignedMembers || [])];
    if (foundMember && !updatedAssigned.includes(foundMember.id)) {
      updatedAssigned.push(foundMember.id);
    }

    const updatedEmails = [...currentEmails, emailStr];
    const updatedEvt = {
      ...existingEvt,
      participantEmails: updatedEmails,
      assignedMembers: updatedAssigned
    };

    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvt : e));

    if (isFirebaseOnline && db) {
      try {
        await setDoc(doc(db, 'events', eventId), updatedEvt, { merge: true });
      } catch (e) { console.warn('Firestore update error:', e); }
    }
  };

  const removeParticipantFromEvent = async (eventId, emailOrId) => {
    if (!isLead) throw new Error('Chỉ Leader mới được phép xóa thành viên khỏi sự kiện!');
    const existingEvt = events.find(e => e.id === eventId);
    if (!existingEvt) return;

    const targetStr = (emailOrId || '').trim().toLowerCase();
    const updatedEmails = (existingEvt.participantEmails || []).filter(e => e.toLowerCase() !== targetStr);
    const updatedAssigned = (existingEvt.assignedMembers || []).filter(id => id !== emailOrId);

    const updatedEvt = {
      ...existingEvt,
      participantEmails: updatedEmails,
      assignedMembers: updatedAssigned
    };

    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvt : e));

    if (isFirebaseOnline && db) {
      try {
        await setDoc(doc(db, 'events', eventId), updatedEvt, { merge: true });
      } catch (e) { }
    }
  };

  const addEventPayment = async (eventId, { title, amount, payerEmail }) => {
    if (!isLead) throw new Error('Chỉ Leader mới được phân bổ khoản chi cho sự kiện!');
    const existingEvt = events.find(e => e.id === eventId);
    if (!existingEvt) throw new Error('Không tìm thấy sự kiện!');

    const amt = Number(amount) || 0;
    if (amt <= 0) throw new Error('Số tiền khoản chi phải lớn hơn 0!');

    const pEmail = (payerEmail || '').trim().toLowerCase();
    const foundMember = members.find(m => m.email && m.email.toLowerCase() === pEmail);

    const newPayment = {
      id: 'pay_' + Date.now(),
      title: title || 'Khoản chi tiêu',
      amount: amt,
      payerEmail: pEmail,
      payerName: foundMember ? foundMember.name : pEmail.split('@')[0],
      payerId: foundMember ? foundMember.id : ''
    };

    const currentPayments = Array.isArray(existingEvt.payments) ? existingEvt.payments : [];
    const updatedPayments = [...currentPayments, newPayment];
    const newTotalCost = updatedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const updatedEvt = {
      ...existingEvt,
      payments: updatedPayments,
      cost: newTotalCost
    };

    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvt : e));

    if (isFirebaseOnline && db) {
      try {
        await setDoc(doc(db, 'events', eventId), updatedEvt, { merge: true });
      } catch (e) { }
    }
  };

  const removeEventPayment = async (eventId, paymentId) => {
    if (!isLead) throw new Error('Chỉ Leader mới được xóa khoản chi khỏi sự kiện!');
    const existingEvt = events.find(e => e.id === eventId);
    if (!existingEvt) return;

    const currentPayments = Array.isArray(existingEvt.payments) ? existingEvt.payments : [];
    const updatedPayments = currentPayments.filter(p => p.id !== paymentId);
    const newTotalCost = updatedPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const updatedEvt = {
      ...existingEvt,
      payments: updatedPayments,
      cost: newTotalCost
    };

    setEvents(prev => prev.map(e => e.id === eventId ? updatedEvt : e));

    if (isFirebaseOnline && db) {
      try {
        await setDoc(doc(db, 'events', eventId), updatedEvt, { merge: true });
      } catch (e) { }
    }
  };

  const updateMemberRole = (memberId, newRole, newSkillRole) => {
    if (!isLead) throw new Error('Chỉ Lead mới được sửa vai trò!');
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole || m.role, skillRole: newSkillRole || m.skillRole } : m));
  };

  const deleteMember = (memberId) => {
    if (!isLead) throw new Error('Chỉ Lead mới được xóa thành viên!');
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const calculateExpenses = () => calculateTripExpenses(events, members);

  const currentOngoingEvent = events.find(e => e.status === 'Đang diễn ra');

  return (
    <TripContext.Provider value={{
      events,
      members,
      addEvent,
      updateEvent,
      deleteEvent,
      approveEvent,
      rejectEvent,
      toggleEventComplete,
      addMember,
      addParticipantByEmail,
      removeParticipantFromEvent,
      addEventPayment,
      removeEventPayment,
      updateMemberRole,
      deleteMember,
      calculateExpenses,
      currentOngoingEvent
    }}>
      {children}
    </TripContext.Provider>
  );
};
