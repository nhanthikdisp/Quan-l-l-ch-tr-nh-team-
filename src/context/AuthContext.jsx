import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Initial default accounts for demonstration & immediate usage
  const [userList, setUserList] = useState([
    {
      uid: 'user_lead_1',
      email: 'lead@chronos.vn',
      password: '123',
      name: 'Nguyễn Văn Lead',
      role: 'Lead', // Lead: Full power
      skillRole: 'Dẫn đoàn',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lead'
    },
    {
      uid: 'user_member_1',
      email: 'thanhvien1@chronos.vn',
      password: '123',
      name: 'Trần Thị Thu (Member)',
      role: 'Member',
      skillRole: 'Xem map & Chụp hình',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Thu'
    },
    {
      uid: 'user_member_2',
      email: 'thanhvien2@chronos.vn',
      password: '123',
      name: 'Lê Hoàng Nam',
      role: 'Member',
      skillRole: 'Nấu ăn & Thủ quỹ',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nam'
    }
  ]);

  // Current logged in user. Default to Lead user for instant preview, can switch or logout
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('chronos_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return userList[0]; // Default Lead user
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('chronos_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('chronos_auth_user');
    }
  }, [currentUser]);

  const login = (email, password) => {
    const found = userList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      throw new Error('Email không tồn tại trên hệ thống!');
    }
    if (found.password && found.password !== password) {
      throw new Error('Mật khẩu không chính xác!');
    }
    setCurrentUser(found);
    return found;
  };

  const register = (name, email, password, role = 'Member', skillRole = 'Chưa phân công') => {
    const existing = userList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('Email này đã được sử dụng!');
    }

    // Check if there is already a Lead
    const hasLead = userList.some(u => u.role === 'Lead');
    const assignedRole = (!hasLead || role === 'Lead') ? 'Lead' : 'Member';

    const newUser = {
      uid: 'user_' + Date.now(),
      email,
      password,
      name,
      role: assignedRole,
      skillRole,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`
    };

    setUserList(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchAccount = (uid) => {
    const target = userList.find(u => u.uid === uid);
    if (target) {
      setCurrentUser(target);
    }
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
