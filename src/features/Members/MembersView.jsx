import React, { useState } from 'react';
import { useAuth } from '../../store/AuthContext';
import { useTrip } from '../../store/TripContext';

export default function MembersView() {
  const { isLead } = useAuth();
  const { members, addMember, updateMemberRole, deleteMember } = useTrip();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [memberName, setMemberName] = useState('');
  const [appRole, setAppRole] = useState('Member');
  const [skillRole, setSkillRole] = useState('Xem map & Chụp hình');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setError('');
    setEditingMember(null);
    setMemberName('');
    setAppRole('Member');
    setSkillRole('Xem map & Chụp hình');
    setShowAddModal(true);
  };

  const openEditModal = (m) => {
    setError('');
    setEditingMember(m);
    setMemberName(m.name);
    setAppRole(m.role || 'Member');
    setSkillRole(m.skillRole || 'Thành viên');
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!memberName.trim()) throw new Error('Vui lòng nhập tên thành viên!');

      if (editingMember) {
        updateMemberRole(editingMember.id, appRole, skillRole);
      } else {
        addMember({ name: memberName, role: appRole, skillRole });
      }

      setShowAddModal(false);
    } catch (err) {
      setError(err.message || 'Thao tác thất bại!');
    }
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant">
        <div>
          <h3 className="text-lg font-extrabold text-cow-spot">Danh Sách Thành Viên & Vai Trò</h3>
          <p className="text-xs text-on-surface-variant font-medium">Quản lý nhiệm vụ (Dẫn đoàn, xem map, nấu ăn, chụp hình...) và phân quyền</p>
        </div>

        {isLead && (
          <button
            onClick={openAddModal}
            className="w-full sm:w-auto px-6 py-3 bg-soft-pink text-cow-spot font-extrabold text-xs rounded-full border-2 border-cow-spot shadow-pressable hover:shadow-pressable-hover active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>+ Thêm Thành Viên Mới</span>
          </button>
        )}
      </div>

      {!isLead && (
        <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-variant flex items-center gap-3 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-tertiary">info</span>
          <span>Bạn đang ở quyền <strong>Member</strong>. Chỉ có <strong>Lead</strong> mới có quyền thêm, xóa hoặc sửa vai trò thành viên.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(m => {
          const isMemberLead = m.role === 'Lead';
          return (
            <div
              key={m.id}
              className="bg-surface-container-lowest rounded-3xl p-6 shadow-tactile border border-surface-variant hover:border-cow-spot transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-4">
                <img
                  src={m.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(m.name)}`}
                  alt={m.name}
                  className="w-14 h-14 rounded-full bg-soft-pink border-2 border-cow-spot p-0.5"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                      isMemberLead ? 'bg-cow-spot text-white' : 'bg-soft-pink text-cow-spot'
                    }`}>
                      {m.role || 'Member'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-base text-cow-spot">{m.name}</h4>
                  <p className="text-xs font-bold text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">assignment_ind</span>
                    {m.skillRole || 'Thành viên'}
                  </p>
                </div>
              </div>

              {isLead && (
                <div className="pt-4 mt-4 border-t border-surface-variant flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(m)}
                    className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-cow-spot rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Đổi Vai Trò</span>
                  </button>
                  
                  {!isMemberLead && (
                    <button
                      onClick={() => deleteMember(m.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cow-spot/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-cow-spot">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-surface-variant">
              <h3 className="text-base font-extrabold text-cow-spot flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">person_add</span>
                {editingMember ? 'Cập Nhật Vai Trò Thành Viên' : 'Thêm Thành Viên Mới'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-2xl text-xs font-bold flex items-center gap-2 border border-rose-300">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phạm Văn Bình"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                  Mô Tả Nhiệm Vụ (Skill Role)
                </label>
                <input
                  type="text"
                  placeholder="VD: Dẫn đoàn, Xem map, Nấu ăn, Chụp hình..."
                  value={skillRole}
                  onChange={e => setSkillRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-cow-spot uppercase tracking-wider mb-1">
                  Vai Trò Hệ Thống (App Role)
                </label>
                <select
                  value={appRole}
                  onChange={e => setAppRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full border border-outline-variant bg-surface-container-low text-xs font-semibold cursor-pointer"
                >
                  <option value="Member">Member (Thành viên thường)</option>
                  <option value="Lead">Lead (Trưởng đoàn - Toàn quyền)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-surface-variant flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-surface-container text-cow-spot font-bold text-xs rounded-full border border-surface-variant cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-soft-pink text-cow-spot font-extrabold text-xs rounded-full border-2 border-cow-spot shadow-pressable cursor-pointer"
                >
                  {editingMember ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
