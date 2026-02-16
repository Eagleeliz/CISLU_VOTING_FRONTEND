import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useManagePointsMutation,
  useAdminUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserRoleMutation, 
} from "../../Features/Apis/Users.Api";
import { 
  User, ShieldCheck, ShieldAlert, 
  Search, Loader2, RefreshCw, ChevronLeft, 
  ChevronRight, Ban, CheckCircle,
  Trophy, Mail, Filter, Lock, Unlock,
  Edit3, Trash2, X, Save, AlertTriangle,
  UserCog 
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { RootState } from "../../app/store";

export const AllUsers = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth as any);
  
  // UI STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // MODAL STATES
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // FORM STATE
  const [editForm, setEditForm] = useState({ 
    fullName: "", 
    yearOfStudy: "", 
    studentRegNo: "",
    password: "",
    role: "" 
  });

  // API HOOKS
  const { data, isLoading, isFetching, refetch } = useGetAllUsersQuery({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage
  });
  
  const [updateStatus] = useUpdateUserStatusMutation();
  const [managePoints] = useManagePointsMutation();
  const [adminUpdate, { isLoading: isUpdating }] = useAdminUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [changeRole, { isLoading: isChangingRole }] = useChangeUserRoleMutation();

  /* ================= HANDLERS ================= */
  
  const handleToggleStatus = async (userId: string, currentActive: boolean, currentStanding: boolean) => {
    try {
      await updateStatus({
        userId,
        isActive: !currentActive,
        isGoodStanding: currentStanding
      }).unwrap();
      toast.success(`Access protocol ${!currentActive ? 'Enabled' : 'Disabled'}`);
    } catch (err: any) {
      toast.error(err.data?.message || "Action unauthorized");
    }
  };

  const handleAdjustPoints = async (userId: string) => {
    const newPoints = window.prompt("Enter new Participation Points value:");
    if (newPoints !== null && !isNaN(parseInt(newPoints))) {
      try {
        await managePoints({ userId, points: parseInt(newPoints) }).unwrap();
        toast.success("Points database synchronized");
      } catch {
        toast.error("Failed to update points");
      }
    }
  };

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditForm({ 
        fullName: user.fullName, 
        yearOfStudy: user.yearOfStudy, 
        studentRegNo: user.studentRegNo,
        password: "",
        role: user.role 
    });
    setIsEditModalOpen(true);
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Update Core Identity
      await adminUpdate({
        userId: selectedUser.id,
        fullName: editForm.fullName,
        yearOfStudy: editForm.yearOfStudy,
        studentRegNo: editForm.studentRegNo,
        password: editForm.password || undefined
      }).unwrap();

      // 2. Update Role if it has changed (Strictly Admin or Member)
      if (editForm.role !== selectedUser.role) {
        await changeRole({ 
          userId: selectedUser.id, 
          role: editForm.role as any 
        }).unwrap();
      }

      toast.success("Identity & Permissions synchronized");
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Sync failed");
    }
  };

  const openDeleteConfirm = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDeletion = async () => {
    try {
      await deleteUser(selectedUser.id).unwrap();
      toast.success("User purged from registry");
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      toast.error(err.data?.message || "Purge failed");
    }
  };

  /* ================= LOGIC ================= */
  
  const filteredUsers = useMemo(() => {
    const users = Array.isArray(data) ? data : [];
    return users.filter((u: any) => {
      const matchesSearch = 
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.studentRegNo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter ? u.role === roleFilter : true;
      return matchesSearch && matchesRole;
    });
  }, [data, searchTerm, roleFilter]);

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#07090d]">
      <Loader2 className="text-red-600 animate-spin mb-4" size={40} />
      <p className="text-[10px] font-mono text-red-500 uppercase tracking-[0.4em]">loading_users...</p>
    </div>
  );

  const totalCount = Array.isArray(data) ? data.length : 0;

  return (
    <div className="min-h-screen bg-[#07090d] text-slate-300 p-4 lg:p-8 font-sans">
      
      {/* MODAL: EDIT USER */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0f1117] border border-slate-800 rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                Override<span className="text-red-600">_Identity</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdminUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 block">Full_Legal_Name</label>
                <input 
                  type="text" value={editForm.fullName}
                  onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-red-600 outline-none transition-all text-white"
                />
              </div>

              {/* ROLE SELECTOR: STRICTLY MEMBER/ADMIN */}
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 block text-red-500">Access_Level_Permissions</label>
                <div className="relative">
                  <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <select 
                    value={editForm.role}
                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-red-600 outline-none transition-all text-white appearance-none uppercase font-mono"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 block">Student_Reg_No</label>
                <input 
                  type="text" value={editForm.studentRegNo}
                  onChange={(e) => setEditForm({...editForm, studentRegNo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-red-600 outline-none transition-all text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 block">Academic_Year</label>
                <input 
                  type="text" value={editForm.yearOfStudy}
                  onChange={(e) => setEditForm({...editForm, yearOfStudy: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-red-600 outline-none transition-all text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-mono text-slate-500 uppercase mb-1.5 block">Reset_Password (Leave_Blank_To_Keep)</label>
                <input 
                  type="password" placeholder="••••••••"
                  value={editForm.password}
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:border-red-600 outline-none transition-all text-white"
                />
              </div>
              
              <div className="md:col-span-2 pt-4">
                <button 
                  disabled={isUpdating || isChangingRole}
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white rounded-xl py-3 font-black uppercase text-[11px] flex items-center justify-center gap-2 transition-all"
                >
                  {(isUpdating || isChangingRole) ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Execute_Identity_Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRM */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-sm bg-[#0f1117] border border-rose-900/50 rounded-[2rem] p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-rose-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-rose-600" size={32} />
            </div>
            <h3 className="text-lg font-black text-white uppercase mb-2">Purge_Required?</h3>
            <p className="text-xs text-slate-500 mb-8 leading-relaxed">
                You are about to permanently delete <span className="text-white font-bold">{selectedUser?.fullName}</span>. 
                This action is irreversible and will remove all associated logs.
            </p>
            <div className="flex gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-[10px] font-black uppercase transition-all">Abort</button>
                <button 
                    onClick={handleExecuteDeletion} 
                    disabled={isDeleting}
                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 transition-all"
                >
                   {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Confirm_Purge
                </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1">
            User<span className="text-red-600 font-light not-italic">_Registry</span>
          </h2>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 uppercase">
            <ShieldCheck size={12} className="text-red-600" />
            <span>Root_Access: {currentUser?.fullName || 'ADMIN_OPERATOR'}</span>
          </div>
        </div>
        <div className="bg-slate-900/40 px-6 py-3 rounded-2xl border border-slate-800">
            <p className="text-[9px] font-mono text-slate-500 uppercase mb-1">Total_Records</p>
            <p className="text-xl font-black text-white font-mono">{totalCount}</p>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input 
            type="text" placeholder="SEARCH_BY_NAME_OR_REG_ NO..." 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono focus:border-red-600 outline-none transition-all"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <select 
            value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono focus:border-red-600 outline-none uppercase appearance-none"
          >
            <option value="">All_Roles</option>
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        </div>
        <button onClick={() => refetch()} className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-[10px] font-black uppercase transition-all">
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} /> Refresh_List
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="max-w-7xl mx-auto bg-[#0f1117] border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/20 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <th className="px-8 py-6">Identity</th>
                <th className="px-6 py-6">Academic_Ref</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6 text-center">Participation</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredUsers.length > 0 ? filteredUsers.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-900/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${user.role === 'admin' ? 'border-red-600 bg-red-600/10' : 'border-slate-700 bg-slate-800'}`}>
                        <User size={18} className={user.role === 'admin' ? 'text-red-500' : 'text-slate-400'} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-bold text-white uppercase">{user.fullName}</p>
                           <span className="text-[8px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">{user.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <Mail size={10} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 font-mono">
                    <div className="flex flex-col">
                        <span className="text-[11px] text-slate-300">{user.studentRegNo}</span>
                        <span className="text-[9px] text-slate-600 uppercase">Year_{user.yearOfStudy || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase border ${user.isActive ? 'border-emerald-600/30 text-emerald-500 bg-emerald-500/5' : 'border-red-600/30 text-red-500 bg-red-500/5'}`}>
                        {user.isActive ? <Unlock size={10} /> : <Lock size={10} />}
                        {user.isActive ? 'Active' : 'Locked'}
                      </span>
                      {user.isGoodStanding ? (
                        <span title="Good Standing">
                          <ShieldCheck size={14} className="text-emerald-600" />
                        </span>
                      ) : (
                        <span title="Under Review">
                          <ShieldAlert size={14} className="text-rose-600" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col items-center min-w-[100px]">
                        <div className="flex items-center gap-2 text-slate-300 font-mono font-bold text-xs">
                            <Trophy size={12} className="text-amber-500" />
                            {user.participationPoints}
                        </div>
                        <div className="w-full max-w-[80px] h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-red-600 transition-all duration-700" style={{ width: `${Math.min(user.participationPoints, 100)}%` }} />
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2.5 bg-slate-800 hover:bg-blue-600/20 hover:text-blue-500 rounded-xl transition-all"
                        title="Edit User & Permissions"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button 
                        onClick={() => handleAdjustPoints(user.id)}
                        className="p-2.5 bg-slate-800 hover:bg-amber-600/20 hover:text-amber-500 rounded-xl transition-all"
                        title="Adjust Points"
                      >
                        <Trophy size={14} />
                      </button>

                      <button 
                        onClick={() => handleToggleStatus(user.id, user.isActive, user.isGoodStanding)}
                        className={`p-2.5 rounded-xl transition-all ${user.isActive ? 'bg-slate-800 hover:bg-red-600/20 hover:text-red-500' : 'bg-red-600 text-white'}`}
                        title={user.isActive ? "Lock Account" : "Unlock Account"}
                      >
                        {user.isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
                      </button>

                      <button 
                        onClick={() => openDeleteConfirm(user)}
                        className="p-2.5 bg-slate-800 hover:bg-rose-600/20 hover:text-rose-500 rounded-xl transition-all"
                        title="Purge User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center font-mono text-[11px] text-slate-600 uppercase tracking-widest">
                    No users found in directory
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-8 border-t border-slate-800 bg-slate-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
            FETCHED_NODES: {filteredUsers.length} / {totalCount}
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2.5 border border-slate-800 rounded-xl hover:border-red-600 disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-mono text-[11px] text-white">PAGE_{String(currentPage).padStart(2, '0')}</span>
            <button 
              disabled={filteredUsers.length < itemsPerPage}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2.5 border border-slate-800 rounded-xl hover:border-red-600 disabled:opacity-20 transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};