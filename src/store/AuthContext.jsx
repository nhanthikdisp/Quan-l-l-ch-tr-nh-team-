import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, isFirebaseOnline, createUserWithEmailAndPassword, signInWithEmailAndPassword, collection, onSnapshot, doc, setDoc } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [userList, setUserList] = useState([
    {
      uid: 'user_lead_1',
      email: 'lead@chronos.vn',
      password: '123',
      name: 'Nguyễn Văn Lead',
      role: 'Lead',
      skillRole: 'Leader (Trưởng đoàn)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lead'
    },
    {
      uid: 'user_member_1',
      email: 'thanhvien1@chronos.vn',
      password: '123',
      name: 'Trần Thị Thu',
      role: 'Member',
      skillRole: 'Member (Thành viên)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Thu'
    },
    {
      uid: 'user_member_2',
      email: 'thanhvien2@chronos.vn',
      password: '123',
      name: 'Lê Hoàng Nam',
      role: 'Member',
      skillRole: 'Member (Thành viên)',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nam'
    }
  ]);

  const [currentUser, setCurrentUser] = useState(null);

  // Sync users real-time from Firestore
  useEffect(() => {
    if (isFirebaseOnline && db) {
      try {
        const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
          if (!snapshot.empty) {
            const fetched = [];
            snapshot.forEach(doc => fetched.push({ uid: doc.id, ...doc.data() }));
            setUserList(fetched);
          }
        }, (err) => console.warn('Firestore users sync:', err));
        return () => unsub();
      } catch (e) { }
    }
  }, []);

  const login = async (email, password) => {
    if (isFirebaseOnline && auth) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (fbErr) {
        console.warn('Firebase Auth Login Note:', fbErr.message);
      }
    }
    const found = userList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      const fallbackUser = {
        uid: 'user_' + Date.now(),
        email,
        name: email.split('@')[0],
        role: 'Member',
        skillRole: 'Member (Thành viên)',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`
      };
      setUserList(prev => [...prev, fallbackUser]);
      setCurrentUser(fallbackUser);
      return fallbackUser;
    }
    if (found.password && found.password !== password) throw new Error('Mật khẩu không chính xác!');
    setCurrentUser(found);
    return found;
  };

  const register = async (name, email, password, role = 'Member') => {
    const existing = userList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('Email này đã được sử dụng!');

    const hasLead = userList.some(u => u.role === 'Lead');
    const assignedRole = (!hasLead || role === 'Lead') ? 'Lead' : 'Member';

    let uid = 'user_' + Date.now();

    // 1. Đẩy tài khoản lên Firebase Authentication
    if (isFirebaseOnline && auth) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
      } catch (fbErr) {
        console.warn('Firebase Auth Error:', fbErr.message);
        if (fbErr.code === 'auth/email-already-in-use') {
          throw new Error('Email này đã đăng ký trên hệ thống Firebase!');
        } else if (fbErr.code === 'auth/weak-password') {
          throw new Error('Mật khẩu quá yếu (tối thiểu 6 ký tự)!');
        }
      }
    }

    const newUser = {
      uid,
      email,
      password,
      name,
      role: assignedRole,
      skillRole: assignedRole === 'Lead' ? 'Leader (Trưởng đoàn)' : 'Member (Thành viên)',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };

    // 2. Đẩy thông tin Profile người dùng lên Cloud Firestore
    if (isFirebaseOnline && db) {
      try {
        await setDoc(doc(db, 'users', uid), newUser, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc user error:', e);
      }
    }

    // 3. Khởi tạo DUY NHẤT 1 Task ví dụ mẫu riêng cho tài khoản mới này
    const todayStr = new Date().toISOString().split('T')[0];
    const sampleEvtId = 'evt_' + Date.now();
    const sampleEvent = {
      id: sampleEvtId,
      title: `Chào mừng ${name} - Sự kiện lịch trình khởi tạo`,
      description: 'Đây là sự kiện ví dụ khởi tạo ban đầu dành riêng cho tài khoản của bạn.',
      date: todayStr,
      startTime: '09:00',
      endTime: '10:30',
      startHour: 9,
      durationHours: 1.5,
      location: 'Địa điểm cá nhân',
      activityType: 'Công việc',
      status: assignedRole === 'Lead' ? 'Sắp tới' : 'Chờ duyệt',
      completed: false,
      assignedMembers: [uid],
      participantEmails: [email],
      cost: 0,
      payerId: uid,
      payerEmail: email,
      createdBy: uid,
      createdByName: name,
      row: 1
    };

    if (isFirebaseOnline && db) {
      try {
        await setDoc(doc(db, 'events', sampleEvtId), sampleEvent, { merge: true });
      } catch (e) {
        console.warn('Firestore setDoc sample event error:', e);
      }
    }

    setUserList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => setCurrentUser(null);

  const switchAccount = (uid) => {
    const target = userList.find(u => u.uid === uid);
    if (target) setCurrentUser(target);
  };

  const isLead = currentUser?.role === 'Lead';

  return (
    <AuthContext.Provider value={{
      currentUser,
      userList,
      setUserList,
      login,
      register,
      logout,
      switchAccount,
      isLead,
      setCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

