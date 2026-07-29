import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, isFirebaseOnline, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc } from '../firebase/config';

const TripContext = createContext();

export const useTrip = () => useContext(TripContext);

// Initial Default Sample Events
const getTodayStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

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
        title: 'Tập trung & Khởi hành đi Đà Lạt',
        description: 'Tập trung tại Bến xe Miền Đông, kiểm tra lại hành lý và lên xe.',
        date: todayStr,
        startTime: '06:00',
        endTime: '11:30',
        location: 'Bến xe Miền Đông, TP.HCM',
        activityType: 'Khác',
        status: 'Đã xong',
        completed: true,
        assignedMembers: ['user_lead_1', 'user_member_1', 'user_member_2'],
        cost: 600000,
        payerId: 'user_lead_1',
        createdBy: 'user_lead_1',
        createdByName: 'Nguyễn Văn Lead',
        order: 1
      },
      {
        id: 'evt_2',
        title: 'Ăn trưa Lẩu Gà Lá É Tao Ngộ',
        description: 'Thưởng thức đặc sản lẩu gà lá é nóng hổi ngày mưa Đà Lạt.',
        date: todayStr,
        startTime: '12:00',
        endTime: '13:30',
        location: '34 Đường 3/4, Đà Lạt',
        activityType: 'Ăn uống',
        status: 'Đang diễn ra',
        completed: false,
        assignedMembers: ['user_lead_1', 'user_member_1', 'user_member_2'],
        cost: 450000,
        payerId: 'user_member_2',
        createdBy: 'user_lead_1',
        createdByName: 'Nguyễn Văn Lead',
        order: 2
      },
      {
        id: 'evt_3',
        title: 'Check-in Quảng trường Lâm Viên & Hồ Xuân Hương',
        description: 'Chụp hình nhóm với Nụ hoa Atiso và đi dạo quanh hồ.',
        date: todayStr,
        startTime: '14:30',
        endTime: '17:00',
        location: 'Quảng trường Lâm Viên',
        activityType: 'Ngắm cảnh',
        status: 'Sắp tới',
        completed: false,
        assignedMembers: ['user_lead_1', 'user_member_1'],
        cost: 150000,
        payerId: 'user_member_1',
        createdBy: 'user_member_1',
        createdByName: 'Trần Thị Thu',
        order: 3
      },
      {
        id: 'evt_4',
        title: 'BBQ & Bonding đêm tại homestay',
        description: 'Nướng thịt, hát guitar và chơi boardgame gắn kết thành viên.',
        date: todayStr,
        startTime: '18:30',
        endTime: '22:00',
        location: 'Homestay Mây Đêm Đà Lạt',
        activityType: 'Bonding',
        status: 'Sắp tới',
        completed: false,
        assignedMembers: ['user_lead_1', 'user_member_1', 'user_member_2'],
        cost: 900000,
        payerId: 'user_lead_1',
        createdBy: 'user_lead_1',
        createdByName: 'Nguyễn Văn Lead',
        order: 4
      },
      {
        id: 'evt_5',
        title: 'Gợi ý quán cafe ngắm hoàng hôn (Chờ duyệt)',
        description: 'Quán cafe Túi Mơ To view thung lũng đẹp.',
        date: todayStr,
        startTime: '17:15',
        endTime: '18:15',
        location: 'Quán Cafe Túi Mơ To',
        activityType: 'Ngắm cảnh',
        status: 'Chờ duyệt',
        completed: false,
        assignedMembers: ['user_member_1', 'user_member_2'],
        cost: 120000,
        payerId: 'user_member_1',
        createdBy: 'user_member_1',
        createdByName: 'Trần Thị Thu',
        order: 5
      }
    ];
  });

  // Sync to local storage as fallback cache
  useEffect(() => {
    localStorage.setItem('chronos_trip_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('chronos_trip_events', JSON.stringify(events));
  }, [events]);

  // Firestore Realtime Listener (Firebase integration)
  useEffect(() => {
    if (isFirebaseOnline && db) {
      try {
        const eventsRef = collection(db, 'events');
        const unsub = onSnapshot(eventsRef, (snapshot) => {
          if (!snapshot.empty) {
            const fetchedEvents = [];
            snapshot.forEach(doc => {
              fetchedEvents.push({ id: doc.id, ...doc.data() });
            });
            // Keep local state synced
            setEvents(fetchedEvents);
          }
        }, (err) => {
          console.warn('Firestore subscription active with fallback cache:', err);
        });
        return () => unsub();
      } catch (e) {
        console.warn('Firestore initialization fallback:', e);
      }
    }
  }, []);

  // ----------------------------------------------------
  // REALTIME ENGINE: Auto Status Updating
  // ----------------------------------------------------
  useEffect(() => {
    const updateRealtimeStatus = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDateStr = getTodayStr();

      setEvents(prevEvents => {
        let updated = false;
        const newEvents = prevEvents.map(evt => {
          // Do NOT touch events in 'Tạm hoãn', 'Hủy', or 'Chờ duyệt'
          if (evt.status === 'Tạm hoãn' || evt.status === 'Hủy' || evt.status === 'Chờ duyệt') {
            return evt;
          }

          // Check only today's events for exact time or past/future dates
          let newStatus = evt.status;
          
          if (evt.date < currentDateStr) {
            newStatus = 'Đã xong';
          } else if (evt.date > currentDateStr) {
            newStatus = 'Sắp tới';
          } else {
            // Same date
            if (currentTimeStr >= evt.endTime) {
              newStatus = 'Đã xong';
            } else if (currentTimeStr >= evt.startTime && currentTimeStr < evt.endTime) {
              newStatus = 'Đang diễn ra';
            } else if (currentTimeStr < evt.startTime) {
              newStatus = 'Sắp tới';
            }
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

    // Run immediately and every 10 seconds
    updateRealtimeStatus();
    const interval = setInterval(updateRealtimeStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // ----------------------------------------------------
  // VALIDATION & COLLISION CHECK
  // ----------------------------------------------------
  const validateEvent = (eventData, currentEventId = null) => {
    // 1. Title mandatory
    if (!eventData.title || !eventData.title.trim()) {
      throw new Error('Tên sự kiện không được để trống!');
    }

    // 2. End time after start time
    if (eventData.startTime && eventData.endTime) {
      if (eventData.endTime <= eventData.startTime) {
        throw new Error('Giờ kết thúc phải diễn ra sau giờ bắt đầu!');
      }
    }

    // 3. Collision check: No 2 approved events of same timeslot overlap completely
    const isApprovedOrOfficial = eventData.status !== 'Chờ duyệt';
    if (isApprovedOrOfficial) {
      const activeEventsOnSameDate = events.filter(e => 
        e.id !== currentEventId &&
        e.date === eventData.date &&
        e.status !== 'Hủy' &&
        e.status !== 'Chờ duyệt'
      );

      const hasCollision = activeEventsOnSameDate.some(e => {
        // Complete overlap: (StartA < EndB) and (EndA > StartB)
        const overlap = (eventData.startTime < e.endTime) && (eventData.endTime > e.startTime);
        return overlap;
      });

      if (hasCollision) {
        throw new Error('Khung giờ này đã bị trùng lắp hoàn toàn với một sự kiện chính thức khác trên lịch trình!');
      }
    }
  };

  // ----------------------------------------------------
  // EVENT CRUD & APPROVAL WORKFLOW
  // ----------------------------------------------------
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
      order: events.length + 1
    };

    validateEvent(newEvt);

    setEvents(prev => [...prev, newEvt]);

    if (isFirebaseOnline && db) {
      try {
        await addDoc(collection(db, 'events'), newEvt);
      } catch (e) {
        console.warn('Firebase sync warning:', e);
      }
    }
    return newEvt;
  };

  const updateEvent = async (id, eventData) => {
    const existing = events.find(e => e.id === id);
    if (!existing) return;

    // Permissions check: Member can only edit their own pending events. Lead can edit anything.
    if (!isLead) {
      if (existing.createdBy !== currentUser?.uid) {
        throw new Error('Bạn chỉ có quyền sửa sự kiện do chính mình tạo!');
      }
      if (existing.status !== 'Chờ duyệt') {
        throw new Error('Sự kiện đã duyệt chỉ có Lead mới được chỉnh sửa!');
      }
    }

    const updatedEvt = {
      ...existing,
      ...eventData,
      cost: Number(eventData.cost) || 0
    };

    validateEvent(updatedEvt, id);

    setEvents(prev => prev.map(e => e.id === id ? updatedEvt : e));

    if (isFirebaseOnline && db) {
      try {
        await setDoc(doc(db, 'events', id), updatedEvt, { merge: true });
      } catch (e) {
        console.warn('Firebase sync error:', e);
      }
    }
  };

  const deleteEvent = async (id) => {
    const existing = events.find(e => e.id === id);
    if (!existing) return;

    // Permissions check
    if (!isLead) {
      if (existing.createdBy !== currentUser?.uid) {
        throw new Error('Bạn chỉ có quyền xóa sự kiện do chính mình tạo!');
      }
      if (existing.status !== 'Chờ duyệt') {
        throw new Error('Không thể xóa sự kiện đã duyệt. Chỉ có Lead mới có quyền xóa!');
      }
    }

    setEvents(prev => prev.filter(e => e.id !== id));

    if (isFirebaseOnline && db) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (e) {
        console.warn('Firebase delete error:', e);
      }
    }
  };

  const approveEvent = async (id) => {
    if (!isLead) {
      throw new Error('Chỉ có vị trí Lead mới được duyệt sự kiện!');
    }

    const evt = events.find(e => e.id === id);
    if (!evt) return;

    // Determine initial status based on time
    const now = new Date();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    let newStatus = 'Sắp tới';
    if (evt.date === todayStr) {
      if (currentTimeStr >= evt.endTime) newStatus = 'Đã xong';
      else if (currentTimeStr >= evt.startTime) newStatus = 'Đang diễn ra';
    }

    const approvedEvt = { ...evt, status: newStatus };
    validateEvent(approvedEvt, id);

    setEvents(prev => prev.map(e => e.id === id ? approvedEvt : e));
  };

  const rejectEvent = async (id) => {
    if (!isLead) {
      throw new Error('Chỉ có vị trí Lead mới được từ chối sự kiện!');
    }
    deleteEvent(id);
  };

  const toggleEventComplete = async (id) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        const nextCompleted = !e.completed;
        return {
          ...e,
          completed: nextCompleted,
          status: nextCompleted ? 'Đã xong' : e.status
        };
      }
      return e;
    }));
  };

  // Reorder events via Drag & Drop or ↑↓ Arrows
  const reorderEvents = (draggedId, direction) => {
    setEvents(prev => {
      const list = [...prev];
      const index = list.findIndex(e => e.id === draggedId);
      if (index < 0) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;

      // Swap
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;

      return list.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  // ----------------------------------------------------
  // MEMBER MANAGEMENT (CRUD & Lead permissions)
  // ----------------------------------------------------
  const addMember = (memberData) => {
    if (!isLead) throw new Error('Chỉ Lead mới có quyền thêm thành viên mới!');
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
    if (!isLead) throw new Error('Chỉ Lead mới có quyền thay đổi vai trò!');
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return { ...m, role: newRole || m.role, skillRole: newSkillRole || m.skillRole };
      }
      return m;
    }));
  };

  const deleteMember = (memberId) => {
    if (!isLead) throw new Error('Chỉ Lead mới có quyền xóa thành viên!');
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // ----------------------------------------------------
  // EXPENSES & DEBT CALCULATION ENGINE ("Ai nợ ai bao nhiêu")
  // ----------------------------------------------------
  const calculateExpenses = () => {
    // Exclude cancelled & pending events from financial splitting
    const validEvents = events.filter(e => e.status !== 'Hủy' && e.status !== 'Chờ duyệt');

    // 1. Total Trip Cost
    const totalTripCost = validEvents.reduce((sum, e) => sum + (e.cost || 0), 0);

    // 2. Map per member: Paid, Share, Net
    const memberStats = members.map(m => {
      // Amount paid by this member (as payer)
      const totalPaid = validEvents
        .filter(e => e.payerId === m.id)
        .reduce((sum, e) => sum + (e.cost || 0), 0);

      // Amount this member has to pay (shared equally among assigned members per event)
      const totalShare = validEvents.reduce((sum, e) => {
        const assigned = e.assignedMembers || [];
        if (assigned.includes(m.id) && assigned.length > 0) {
          return sum + (e.cost / assigned.length);
        }
        return sum;
      }, 0);

      const netBalance = totalPaid - totalShare;

      return {
        member: m,
        totalPaid: Math.round(totalPaid),
        totalShare: Math.round(totalShare),
        netBalance: Math.round(netBalance)
      };
    });

    // 3. Settlement Transactions ("Ai nợ ai bao nhiêu")
    // Debtors (netBalance < 0) need to pay Creditors (netBalance > 0)
    let debtors = memberStats
      .filter(s => s.netBalance < -10)
      .map(s => ({ ...s, amountOwed: Math.abs(s.netBalance) }));

    let creditors = memberStats
      .filter(s => s.netBalance > 10)
      .map(s => ({ ...s, amountReceivable: s.netBalance }));

    const settlements = [];

    debtors.forEach(d => {
      creditors.forEach(c => {
        if (d.amountOwed > 0 && c.amountReceivable > 0) {
          const payment = Math.min(d.amountOwed, c.amountReceivable);
          settlements.push({
            fromMember: d.member,
            toMember: c.member,
            amount: Math.round(payment)
          });
          d.amountOwed -= payment;
          c.amountReceivable -= payment;
        }
      });
    });

    return {
      totalTripCost,
      memberStats,
      settlements
    };
  };

  // ----------------------------------------------------
  // CURRENT ONGOING EVENT FINDER
  // ----------------------------------------------------
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
      reorderEvents,
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
