import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [skillRole, setSkillRole] = useState('Dẫn đoàn');
  const [appRole, setAppRole] = useState('Member');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Vui lòng nhập họ tên!');
        if (!email.trim()) throw new Error('Vui lòng nhập Email!');
        if (!password) throw new Error('Vui lòng nhập mật khẩu!');
        
        register(name, email, password, appRole, skillRole);
        setSuccess('Đăng ký tài khoản thành công!');
      } else {
        if (!email.trim()) throw new Error('Vui lòng nhập Email!');
        login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Thao tác không thành công!');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 cow-pattern">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 shadow-2xl border-2 border-cow-spot relative overflow-hidden">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-soft-pink flex items-center justify-center text-cow-spot shadow-tactile border-2 border-cow-spot mb-3 animate-bounce">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>pets</span>
          </div>
          <h1 className="text-3xl font-extrabold text-cow-spot tracking-tight">ChronosPlan</h1>
          <p className="text-xs font-semibold text-on-surface-variant mt-1">
            Ứng dụng Quản lý Lịch trình & Chi tiêu Chuyến đi
          </p>
        </div>

        <div className="flex bg-surface-container-high rounded-full p-1 mb-6 border border-surface-variant">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              !isRegister ? 'bg-tertiary text-white shadow-md' : 'text-on-surface hover:text-cow-spot'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isRegister ? 'bg-tertiary text-white shadow-md' : 'text-on-surface hover:text-cow-spot'
            }`}
          >
            Đăng Ký
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-300">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-pastel-green text-green-900 rounded-2xl text-xs font-bold flex items-center gap-2 border border-green-300">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                Họ và Tên
              </label>
              <input
                type="text"
                placeholder="VD: Nguyễn Văn A"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tertiary"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="VD: lead@chronos.vn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
              Mật khẩu
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tertiary"
            />
          </div>

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                  Nhiệm vụ trong chuyến đi
                </label>
                <select
                  value={skillRole}
                  onChange={e => setSkillRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tertiary cursor-pointer"
                >
                  <option value="Dẫn đoàn">Dẫn đoàn (Trưởng nhóm)</option>
                  <option value="Xem map & Chụp hình">Xem map & Chụp hình</option>
                  <option value="Nấu ăn & Thủ quỹ">Nấu ăn & Thủ quỹ</option>
                  <option value="Hậu cần & Chuẩn bị">Hậu cần & Chuẩn bị</option>
                  <option value="Lái xe & An toàn">Lái xe & An toàn</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                  Vai trò Phân quyền
                </label>
                <select
                  value={appRole}
                  onChange={e => setAppRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-tertiary cursor-pointer"
                >
                  <option value="Member">Member (Thành viên thường)</option>
                  <option value="Lead">Lead (Trưởng đoàn - Toàn quyền)</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-soft-pink text-cow-spot font-extrabold text-sm rounded-full border-2 border-cow-spot shadow-pressable hover:shadow-pressable-hover active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isRegister ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Ngay'}
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-surface-variant text-center">
          <p className="text-[11px] text-on-surface-variant font-bold mb-2 uppercase">Dùng thử nhanh tài khoản mẫu:</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => { setEmail('lead@chronos.vn'); setPassword('123'); login('lead@chronos.vn', '123'); }}
              className="px-3 py-1.5 bg-cow-spot text-white rounded-full text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              Vào làm Lead
            </button>
            <button
              onClick={() => { setEmail('thanhvien1@chronos.vn'); setPassword('123'); login('thanhvien1@chronos.vn', '123'); }}
              className="px-3 py-1.5 bg-tertiary-container text-tertiary rounded-full text-xs font-bold hover:opacity-90 cursor-pointer"
            >
              Vào làm Member
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
