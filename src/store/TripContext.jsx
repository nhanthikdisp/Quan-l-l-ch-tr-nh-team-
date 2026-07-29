import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseOnline, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc } from '../services/firebase';
import { calculateTripExpenses } from '../utils/expenseCalculations';

const TripContext = createContext();

export const useTrip = () => useContext(TripContext);

const getTodayStr = () => new Date().toISOString().split('T')[0];

const DEFAULT_MEMBERS = [
  { id: 'user_lead_1', name: 'Nguyễn Văn Lead', role: 'Lead', skillRole: 'Dẫn đoàn', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lead' },
  { id: 'user_member_1', name: 'Trần Thị Thu', role: 'Member', skillRole: 'Xem map & Chụp hình', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Thu' },
  { id: 'user_member_2', name: 'Lê Hoàng Nam', role: 'Member', skillRole: 'Nấu ăn & Thủ quỹ', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nam' },
];

export const TripProvider = ({ children }) => {
  const { currentUser, isLead } = useAuth();
  const todayStr = getTodayStr();

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('chronos_trip_members');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('chronos_trip_events');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
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
        cost: 600000,
        payerId: 'user_lead_1',
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
        cost: 450000,
        payerId: 'user_member_2',
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
        cost: 350000,
        payerId: 'user_member_1',
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
        cost: 200000,
        payerId: 'user_lead_1',
        createdBy: 'user_lead_1',
        createdByName: 'Nguyễn Văn Lead',
        row: 4
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('chronos_trip_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('chronos_trip_events', JSON.stringify(events));
  }, [events]);

  // Firestore sync listener
  useEffect(() => {
    if (isFirebaseOnline && db) {
      try {
        const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
          if (!snapshot.empty) {
            const fetched = [];
            snapshot.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
            setEvents(fetched);
          }
        }, (err) => console.warn('Firestore sync note:', err));
        return () => unsub();
      } catch (e) { }
    }
  }, []);

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
      name: memberData.name,
      role: memberData.role || 'Member',
      skillRole: memberData.skillRole || 'Thành viên',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(memberData.name)}`
    };
    setMembers(prev => [...prev, newMember]);
    return newMember;
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
      updateMemberRole,
      deleteMember,
      calculateExpenses,
      currentOngoingEvent
    }}>
      {children}
    </TripContext.Provider>
  );
};
