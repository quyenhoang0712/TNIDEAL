import {
  Activity, Building2, CirclePlus, Eye, KeyRound, Lock,
  ChevronRight, Clock3, DollarSign, HardHat, Image, LogOut, MoreVertical, Package,
  Pencil, RefreshCw, Search, Settings, ShieldCheck, Trash2, UsersRound, X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

async function adminRequest(path, token, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thể xử lý yêu cầu');
  return data;
}

const emptyUser = { username: '', displayName: '', phone: '', email: '', password: '', role: 'contractor' };

export default function AdminPage({ activeNavigation, activeNavigationId, logout, session, setActivePage, visibleNavigation }) {
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [constructions, setConstructions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [constructionFilter, setConstructionFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [userForm, setUserForm] = useState(emptyUser);
  const [resetUser, setResetUser] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [actionMenu, setActionMenu] = useState(null);
  const [selectedConstruction, setSelectedConstruction] = useState(null);
  const [constructionTab, setConstructionTab] = useState('overview');
  const [constructionData, setConstructionData] = useState(null);
  const [deleteConstruction, setDeleteConstruction] = useState(null);
  const [settings, setSettings] = useState({ companyName: 'TN Ideal', supportEmail: 'admin@tnideal.vn', loginAlerts: true, logo: '' });

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [nextUsers, nextActivity, nextConstructions, nextSettings] = await Promise.all([
        adminRequest('/api/admin/users', session.token),
        adminRequest('/api/admin/activity', session.token),
        adminRequest('/api/admin/constructions', session.token),
        adminRequest('/api/admin/settings', session.token)
      ]);
      const legacySetups = Object.keys(localStorage)
        .filter((key) => key.startsWith('tnideal_project_setup_'))
        .map((key) => ({ contractorId: key.replace('tnideal_project_setup_', ''), setup: JSON.parse(localStorage.getItem(key) || 'null') }))
        .filter(({ contractorId, setup }) => contractorId && setup?.name);

      if (legacySetups.length) {
        await Promise.all(legacySetups.map(({ contractorId, setup }) =>
          adminRequest('/api/admin/constructions/import', session.token, {
            method: 'POST', body: JSON.stringify({ ...setup, contractorId })
          }).then(() => localStorage.removeItem(`tnideal_project_setup_${contractorId}`))
        ));
        const [syncedConstructions, syncedActivity] = await Promise.all([
          adminRequest('/api/admin/constructions', session.token),
          adminRequest('/api/admin/activity', session.token)
        ]);
        setConstructions(syncedConstructions);
        setActivity(syncedActivity);
      } else {
        setConstructions(nextConstructions);
        setActivity(nextActivity);
      }
      setUsers(nextUsers);
      setSettings(nextSettings);
    } catch (error) { setNotice(error.message); }
    finally { setLoading(false); }
  }, [session.token]);

  useEffect(() => { loadAdminData(); }, [loadAdminData]);

  const filteredUsers = useMemo(() => users.filter((user) =>
    [user.username, user.displayName, user.role].some((value) => String(value).toLowerCase().includes(search.toLowerCase()))
  ), [search, users]);
  const activeUsers = users.filter((user) => user.active !== false).length;

  async function createUser(event) {
    event.preventDefault();
    try {
      await adminRequest('/api/admin/users', session.token, { method: 'POST', body: JSON.stringify(userForm) });
      setShowCreate(false); setUserForm(emptyUser); setNotice('Đã tạo tài khoản mới.'); await loadAdminData();
    } catch (error) { setNotice(error.message); }
  }

  async function updateUser(user, changes, success) {
    try {
      await adminRequest(`/api/admin/users/${user._id || user.id}`, session.token, { method: 'PATCH', body: JSON.stringify(changes) });
      setNotice(success); await loadAdminData();
    } catch (error) { setNotice(error.message); }
  }

  async function removeUser(user) {
    if (!window.confirm(`Xóa tài khoản ${user.username}?`)) return;
    try {
      await adminRequest(`/api/admin/users/${user._id || user.id}`, session.token, { method: 'DELETE' });
      setNotice('Đã xóa tài khoản.'); await loadAdminData();
    } catch (error) { setNotice(error.message); }
  }

  async function updateConstruction(construction, changes) {
    try {
      await adminRequest(`/api/admin/constructions/${construction._id}`, session.token, { method: 'PATCH', body: JSON.stringify(changes) });
      setNotice('Đã cập nhật công trình.'); await loadAdminData();
    } catch (error) { setNotice(error.message); }
  }

  async function removeConstruction(construction) {
    try {
      await adminRequest(`/api/admin/constructions/${construction._id}`, session.token, { method: 'DELETE' });
      setDeleteConstruction(null); setSelectedConstruction(null); setNotice('Đã xóa công trình.'); await loadAdminData();
    } catch (error) { setNotice(error.message); }
  }

  async function openConstruction(construction) {
    setSelectedConstruction(construction); setConstructionTab('overview'); setConstructionData(null); setActionMenu(null);
    try { setConstructionData(await adminRequest(`/api/admin/contractors/${construction.contractorId}/workspace?constructionId=${construction._id}`, session.token)); }
    catch (error) { setNotice(error.message); }
  }

  async function saveSettings(event) {
    event.preventDefault();
    try {
      const saved = await adminRequest('/api/admin/settings', session.token, { method: 'PUT', body: JSON.stringify(settings) });
      setSettings(saved); setNotice('Đã lưu cài đặt vào MongoDB.');
    } catch (error) { setNotice(error.message); }
  }

  useEffect(() => {
    const input = document.querySelector('.admin-settings input[type="file"]');
    if (!input) return undefined;
    const selectLogo = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setSettings((current) => ({ ...current, logo: reader.result }));
      reader.readAsDataURL(file);
    };
    input.addEventListener('change', selectLogo);
    return () => input.removeEventListener('change', selectLogo);
  }, [activeNavigationId]);

  const contractors = filteredUsers.filter((user) => user.role === 'contractor');
  const constructionStatus = { planning: ['Chuẩn bị', 'planning'], active: ['Đang thi công', 'active'], paused: ['Tạm dừng', 'paused'], done: ['Hoàn thành', 'done'] };
  const detailWorkspace = constructionData?.workspace || {};
  const detailJobs = constructionData?.jobs || [];
  const detailProgress = detailJobs.length ? Math.round(detailJobs.filter((job) => job.status === 'done').length / detailJobs.length * 100) : 0;
  const detailMaterialCost = (detailWorkspace.materialTransactions || []).filter((item) => item.type === 'IMPORT').reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const detailExpenseCost = (detailWorkspace.expenses || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const detailLaborCost = (detailWorkspace.laborCosts || []).reduce((sum, item) => sum + (item.paymentType === 'DAILY' ? Number(item.workUnits || 0) * Number(item.dailyRate || 0) : Number(item.contractAmount || 0)), 0);
  const dashboardActivity = activity.filter((log) => log.action !== 'Đăng nhập hệ thống');
  const UserTable = () => <div className="admin-table contractor-table"><div className="admin-table-head"><span>Tên thầu</span><span>SĐT</span><span>Email</span><span>Số công trình</span><span>Trạng thái</span><span>Ngày tạo</span><span>Thao tác</span></div>{contractors.map((user) => <div className="admin-table-row" key={user._id || user.id}><div><strong>{user.displayName}</strong><small>@{user.username}</small></div><span>{user.phone || '—'}</span><span>{user.email || '—'}</span><strong>{constructions.filter((item) => String(item.contractorId) === String(user._id)).length}</strong><span className={`account-state ${user.active === false ? 'locked' : 'active'}`}>{user.active === false ? 'Đã khóa' : 'Hoạt động'}</span><span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}</span><div className="admin-row-actions"><button title="Xem công trình" type="button" onClick={() => { setSearch(user.displayName); setActivePage('admin-projects'); }}><Eye size={16} /></button><button title="Sửa thông tin" type="button" onClick={() => setEditUser({ ...user })}><Pencil size={16} /></button><button title="Khóa hoặc mở tài khoản" type="button" onClick={() => updateUser(user, { active: user.active === false }, 'Đã cập nhật trạng thái tài khoản.')}><Lock size={16} /></button><button title="Đặt lại mật khẩu" type="button" onClick={() => { setResetUser(user); setResetPassword(''); }}><KeyRound size={16} /></button><button className="danger" title="Xóa" type="button" onClick={() => removeUser(user)}><Trash2 size={16} /></button></div></div>)}</div>;
  const ConstructionTable = () => <div className="admin-table construction-table"><div className="admin-table-head"><span>Mã CT</span><span>Tên công trình</span><span>Chủ nhà</span><span>Thầu phụ trách</span><span>Địa điểm</span><span>Trạng thái</span><span>Ngày bắt đầu</span><span>Thao tác</span></div>{constructions.filter((item) => (constructionFilter === 'all' || item.status === constructionFilter) && [item.code, item.name, item.investorName, item.contractorName, item.fullAddress].some((value) => String(value || '').toLowerCase().includes(search.toLowerCase()))).map((item) => <div className={`admin-table-row ${item.hidden ? 'construction-hidden' : ''}`} key={item._id}><strong>{item.code}</strong><button className="construction-name" type="button" onClick={() => openConstruction(item)}>{item.name}</button><span className="construction-owner">{item.investorName}</span><span className="construction-contractor">{item.contractorName}</span><span className="construction-address" title={item.fullAddress || item.location}>{item.fullAddress || item.location || '—'}</span><span className={`construction-status ${constructionStatus[item.status]?.[1] || 'planning'}`}>{item.hidden ? 'Tạm ẩn' : constructionStatus[item.status]?.[0] || 'Chuẩn bị'}</span><span className="construction-date">{item.startDate || '—'}</span><div className="construction-actions"><div><button aria-label="Mở menu thao tác" type="button" onClick={() => setActionMenu(actionMenu === item._id ? null : item._id)}><MoreVertical size={19} /></button>{actionMenu === item._id && <div className="construction-action-menu"><button type="button" onClick={() => openConstruction(item)}><Eye size={16} />Xem chi tiết</button><button type="button" onClick={() => { updateConstruction(item, { hidden: !item.hidden }); setActionMenu(null); }}><Lock size={16} />{item.hidden ? 'Hiện lại công trình' : 'Khóa/Tạm ẩn công trình'}</button><button className="danger" type="button" onClick={() => { setDeleteConstruction(item); setActionMenu(null); }}><Trash2 size={16} />Xóa công trình</button></div>}</div></div></div>)}</div>;

  return <main className="app-shell"><div className="app-layout admin-layout">
    <aside className="left-sidebar" aria-label="Menu quản trị"><div className="sidebar-brand"><div className="brand-mark"><ShieldCheck size={20} /></div><div><span>TN Ideal</span><strong>Quản trị</strong></div></div><nav className="sidebar-nav">{visibleNavigation.map((item) => { const Icon = item.icon; return <button className={activeNavigationId === item.id ? 'active' : ''} key={item.id} type="button" onClick={() => setActivePage(item.id)}><Icon size={18} /><span>{item.label}</span></button>; })}</nav><div className="sidebar-user"><span>{session.user.displayName}</span><strong>Admin</strong></div><button className="logout-button sidebar-logout" type="button" onClick={logout}><LogOut size={18} />Đăng xuất</button></aside>
    <section className="main-content"><header className="page-header admin-page-header"><div><h1>{activeNavigation.title}</h1><p>{activeNavigation.description}</p></div><button type="button" onClick={loadAdminData}><RefreshCw className={loading ? 'spin' : ''} size={18} />Làm mới</button></header>
      {notice && <div className="admin-notice"><span>{notice}</span><button onClick={() => setNotice('')} type="button"><X size={17} /></button></div>}

      {activeNavigationId === 'overview' && <><section className="admin-stat-grid admin-six-stats"><article><span><UsersRound /></span><div><small>Tổng số thầu</small><strong>{users.filter((u) => u.role === 'contractor').length}</strong><p>{activeUsers - users.filter((u) => u.role === 'admin' && u.active !== false).length} đang hoạt động</p></div></article><article><span><Building2 /></span><div><small>Tổng công trình</small><strong>{constructions.length}</strong><p>Toàn hệ thống</p></div></article><article><span><Clock3 /></span><div><small>Chuẩn bị</small><strong>{constructions.filter((item) => item.status === 'planning').length}</strong><p>Chưa khởi công</p></div></article><article><span><Activity /></span><div><small>Đang thi công</small><strong>{constructions.filter((item) => item.status === 'active').length}</strong><p>Cần theo dõi</p></div></article><article><span><Lock /></span><div><small>Tạm dừng</small><strong>{constructions.filter((item) => item.status === 'paused').length}</strong><p>Chờ xử lý</p></div></article><article><span><ShieldCheck /></span><div><small>Hoàn thành</small><strong>{constructions.filter((item) => item.status === 'done').length}</strong><p>Đã hoàn thành</p></div></article></section><section className="admin-panel"><div className="admin-section-title"><div><span className="eyebrow">Thay đổi quan trọng</span><h2>Hoạt động gần đây</h2></div><button type="button" onClick={() => setActivePage('activity-log')}>Xem tất cả</button></div><div className="activity-list">{dashboardActivity.slice(0, 8).map((log) => <article key={log._id}><span className={`activity-avatar ${log.actorRole}`}>{log.actorName.slice(0,1).toUpperCase()}</span><div><strong>{log.actorName}</strong><p>{log.action}{log.targetName ? ` — ${log.targetName}` : ''}</p></div><time>{new Date(log.createdAt).toLocaleString('vi-VN')}</time></article>)}{dashboardActivity.length === 0 && <div className="admin-empty">Chưa có thay đổi quan trọng gần đây.</div>}</div></section></>}

      {activeNavigationId === 'users' && <section className="admin-panel"><div className="admin-toolbar"><label><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên, tài khoản, vai trò..." /></label><select><option>Tất cả trạng thái</option><option>Hoạt động</option><option>Đã khóa</option></select><button className="primary-button" type="button" onClick={() => setShowCreate(true)}><CirclePlus size={18} />Tạo tài khoản</button></div><UserTable /></section>}

      {activeNavigationId === 'admin-projects' && <section className="admin-panel construction-panel"><div className="admin-toolbar project-admin-toolbar"><label><Search size={18} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã, tên công trình, chủ nhà hoặc nhà thầu..." /></label><select aria-label="Lọc trạng thái công trình" value={constructionFilter} onChange={(e) => setConstructionFilter(e.target.value)}><option value="all">Tất cả trạng thái</option><option value="planning">Chuẩn bị</option><option value="active">Đang thi công</option><option value="done">Hoàn thành</option><option value="paused">Tạm dừng</option></select></div><ConstructionTable /></section>}

      {activeNavigationId === 'activity-log' && <section className="admin-panel"><div className="admin-section-title"><div><span className="eyebrow">Truy vết thay đổi</span><h2>{activity.length} hoạt động gần nhất</h2></div></div><div className="activity-list full">{activity.map((log) => <article key={log._id}><span className={`activity-avatar ${log.actorRole}`}>{log.actorName.slice(0,1).toUpperCase()}</span><div><strong>{log.actorName} <small>· {log.actorRole === 'admin' ? 'Admin' : 'Nhà thầu'}</small></strong><p>{log.action}{log.targetName ? ` — ${log.targetName}` : ''}{log.details ? ` · ${log.details}` : ''}</p></div><time>{new Date(log.createdAt).toLocaleString('vi-VN')}</time></article>)}</div></section>}

      {activeNavigationId === 'settings' && <div className="settings-grid"><form className="admin-panel admin-settings" onSubmit={saveSettings}><div className="admin-section-title"><div><span className="eyebrow">Nhận diện hệ thống</span><h2>Cấu hình chung</h2></div><Settings /></div><label>Tên hệ thống<input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} /></label><label>Email hỗ trợ<input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} /></label><label>Logo hệ thống<input accept="image/*" type="file" /></label><label className="setting-toggle"><div><strong>Cảnh báo đăng nhập</strong><small>Ghi nhận và cảnh báo hoạt động đăng nhập.</small></div><input type="checkbox" checked={settings.loginAlerts} onChange={(e) => setSettings({ ...settings, loginAlerts: e.target.checked })} /></label><button className="primary-button" type="submit">Lưu cấu hình</button></form><section className="admin-panel admin-settings"><div className="admin-section-title"><div><span className="eyebrow">Tài khoản hiện tại</span><h2>Thông tin Admin</h2></div><ShieldCheck /></div><div className="admin-profile"><span>{session.user.displayName.slice(0,1).toUpperCase()}</span><div><strong>{session.user.displayName}</strong><small>@{session.user.username}</small></div></div><button className="ghost-button" type="button" onClick={() => { const current = users.find((u) => String(u._id) === String(session.user.id)); if (current) { setResetUser(current); setResetPassword(''); } }}>Đổi mật khẩu Admin</button></section></div>}
    </section>

    {showCreate && <section className="jobs-modal" role="dialog" aria-modal="true"><form className="jobs-modal-card admin-user-modal" onSubmit={createUser}><div className="jobs-modal-header"><div><span className="eyebrow">Tài khoản thầu</span><h2>Tạo tài khoản mới</h2></div><button type="button" onClick={() => setShowCreate(false)}><X /></button></div><label>Tên nhà thầu<input required minLength="2" value={userForm.displayName} onChange={(e) => setUserForm({ ...userForm, displayName: e.target.value })} /></label><div className="field-grid"><label>Số điện thoại<input required value={userForm.phone} onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })} /></label><label>Email<input required type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} /></label></div><label>Tên đăng nhập<input required minLength="3" value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} /></label><label>Mật khẩu<input required type="password" minLength="8" placeholder="Ví dụ: Matkhau@123" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} /></label><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowCreate(false)}>Hủy</button><button className="primary-button" type="submit">Tạo tài khoản</button></div></form></section>}
    {editUser && <section className="jobs-modal" role="dialog" aria-modal="true"><form className="jobs-modal-card admin-user-modal" onSubmit={(e) => { e.preventDefault(); updateUser(editUser, { displayName: editUser.displayName, phone: editUser.phone, email: editUser.email }, 'Đã sửa thông tin nhà thầu.'); setEditUser(null); }}><div className="jobs-modal-header"><div><span className="eyebrow">@{editUser.username}</span><h2>Sửa thông tin thầu</h2></div><button type="button" onClick={() => setEditUser(null)}><X /></button></div><label>Tên nhà thầu<input required value={editUser.displayName} onChange={(e) => setEditUser({ ...editUser, displayName: e.target.value })} /></label><label>Số điện thoại<input value={editUser.phone || ''} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })} /></label><label>Email<input type="email" value={editUser.email || ''} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} /></label><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setEditUser(null)}>Hủy</button><button className="primary-button" type="submit">Lưu thay đổi</button></div></form></section>}
    {resetUser && <section className="jobs-modal" role="dialog" aria-modal="true"><form className="jobs-modal-card admin-user-modal" onSubmit={(e) => { e.preventDefault(); updateUser(resetUser, { password: resetPassword }, 'Đã đặt lại mật khẩu.'); setResetUser(null); }}><div className="jobs-modal-header"><div><span className="eyebrow">@{resetUser.username}</span><h2>Đặt lại mật khẩu</h2></div><button type="button" onClick={() => setResetUser(null)}><X /></button></div><label>Mật khẩu mới<input autoFocus required type="password" minLength="8" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} placeholder="Có chữ hoa, số và ký tự đặc biệt" /></label><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setResetUser(null)}>Hủy</button><button className="primary-button" type="submit">Cập nhật</button></div></form></section>}
    {deleteConstruction && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Xác nhận xóa công trình"><div className="jobs-modal-card delete-construction-modal"><span className="delete-warning"><Trash2 /></span><h2>Xóa công trình {deleteConstruction.code}?</h2><p>Toàn bộ dữ liệu liên quan có thể bị ảnh hưởng. Thao tác này không thể hoàn tác.</p><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setDeleteConstruction(null)}>Hủy</button><button className="danger-confirm" type="button" onClick={() => removeConstruction(deleteConstruction)}>Xác nhận xóa</button></div></div></section>}
    {selectedConstruction && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selectedConstruction.name}`}><div className="jobs-modal-card admin-construction-detail"><div className="jobs-modal-header"><div><span className="eyebrow">{selectedConstruction.code} · Chế độ chỉ xem</span><h2>{selectedConstruction.name}</h2><p>Thầu phụ trách: <strong>{selectedConstruction.contractorName}</strong> · <span className={`construction-status ${selectedConstruction.status}`}>{constructionStatus[selectedConstruction.status]?.[0]}</span></p></div><button type="button" onClick={() => setSelectedConstruction(null)}><X /></button></div><div className="admin-detail-tabs">{[['overview','Tổng quan'],['progress','Tiến độ'],['workers','Nhân công'],['materials','Vật tư'],['costs','Chi phí'],['diaries','Nhật ký & hình ảnh']].map(([id,label]) => <button className={constructionTab === id ? 'active' : ''} type="button" key={id} onClick={() => setConstructionTab(id)}>{label}</button>)}</div>{!constructionData ? <div className="admin-detail-loading"><RefreshCw className="spin" />Đang tải dữ liệu MongoDB...</div> : <div className="admin-detail-body">
      {constructionTab === 'overview' && <div className="admin-detail-overview"><article><Building2 /><span>Chủ đầu tư</span><strong>{selectedConstruction.investorName}</strong><small>{selectedConstruction.investorPhone}</small></article><article><HardHat /><span>Nhà thầu</span><strong>{selectedConstruction.contractorName}</strong><small>{constructionData.contractor?.phone || 'Chưa có SĐT'}</small></article><article><Clock3 /><span>Khởi công</span><strong>{selectedConstruction.startDate || 'Chưa xác định'}</strong><small>Dự kiến {selectedConstruction.duration || 0} tháng</small></article><article><Activity /><span>Tiến độ</span><strong>{detailProgress}%</strong><small>{detailJobs.filter((job) => job.status === 'done').length}/{detailJobs.length} công việc hoàn thành</small></article><div className="detail-address"><strong>Địa điểm</strong><p>{selectedConstruction.fullAddress || selectedConstruction.location}</p></div></div>}
      {constructionTab === 'progress' && <div className="admin-readonly-list"><div className="detail-progress-summary"><strong>{detailProgress}% hoàn thành</strong><span><span style={{ width: `${detailProgress}%` }} /></span></div>{detailJobs.map((job) => <article key={job._id}><div><strong>{job.title}</strong><p>{job.category} · {job.owner}</p></div><span className={`construction-status ${job.status}`}>{job.status === 'done' ? 'Hoàn thành' : job.status === 'active' ? 'Đang làm' : 'Lên kế hoạch'}</span></article>)}</div>}
      {constructionTab === 'workers' && <div className="admin-readonly-list">{(detailWorkspace.constructionTeams || []).map((team) => <article key={team.id}><div><strong>{team.name}</strong><p>Đội trưởng: {team.leader} · {team.phone}</p></div><span>{team.members} người · {team.task}</span></article>)}{!(detailWorkspace.constructionTeams || []).length && <p>Chưa có dữ liệu nhân công.</p>}</div>}
      {constructionTab === 'materials' && <div className="admin-readonly-list">{[...(detailWorkspace.materialTransactions || [])].reverse().slice(0,20).map((item) => <article key={item.id}><div><strong>{item.material}</strong><p>{item.date} · {item.category}</p></div><span>{item.type === 'IMPORT' ? 'Nhập' : 'Xuất'} {Number(item.quantity).toLocaleString('vi-VN')}</span></article>)}{!(detailWorkspace.materialTransactions || []).length && <p>Chưa có dữ liệu vật tư.</p>}</div>}
      {constructionTab === 'costs' && <div className="admin-cost-summary"><article><Package /><span>Vật tư</span><strong>{detailMaterialCost.toLocaleString('vi-VN')}đ</strong></article><article><UsersRound /><span>Nhân công</span><strong>{detailLaborCost.toLocaleString('vi-VN')}đ</strong></article><article><DollarSign /><span>Phát sinh</span><strong>{detailExpenseCost.toLocaleString('vi-VN')}đ</strong></article><article className="total"><DollarSign /><span>Tổng chi phí</span><strong>{(detailMaterialCost + detailLaborCost + detailExpenseCost).toLocaleString('vi-VN')}đ</strong></article></div>}
      {constructionTab === 'diaries' && <div className="admin-diary-grid">{[...(detailWorkspace.diaries || [])].reverse().map((diary) => <article key={diary.id}><div><span>{diary.date}</span><strong>{diary.taskName}</strong><p>{diary.description}</p></div>{diary.images?.[0] ? <img src={diary.images[0].url} alt={diary.images[0].name} /> : <span className="no-image"><Image />Chưa có ảnh</span>}</article>)}{!(detailWorkspace.diaries || []).length && <p>Chưa có nhật ký thi công.</p>}</div>}
    </div>}</div></section>}
  </div></main>;
}
