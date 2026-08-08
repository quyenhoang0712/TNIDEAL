import {
  Building2,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  ClipboardList,
  DollarSign,
  FileText,
  FolderKanban,
  Loader2,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Ruler,
  Search,
  Trash2,
  UserRound,
  UserCheck,
  UsersRound,
  X
} from 'lucide-react';
import { useState } from 'react';
import DiaryPage from './DiaryPage';

const placeholderItems = {
  users: ['Tạo tài khoản người dùng mới.', 'Khóa hoặc mở tài khoản khi có vấn đề.', 'Đặt lại mật khẩu cho user khi cần hỗ trợ.'],
  roles: ['Chuyển user giữa các nhóm quyền phù hợp.', 'Kiểm tra quyền thao tác trước khi cấp quyền mới.', 'Giữ tài khoản admin riêng cho quản trị hệ thống.'],
  'data-fixes': ['Sửa dữ liệu sai do nhập nhầm.', 'Gộp hoặc xóa dữ liệu bị trùng.', 'Khôi phục trạng thái đúng cho công việc/công trình.'],
  'system-errors': ['Kiểm tra lỗi đăng nhập và phiên làm việc.', 'Theo dõi lỗi kết nối MongoDB/API.', 'Ghi chú lỗi cần sửa trong source code.'],
  projects: ['Tạo và cập nhật hồ sơ dự án phần thô.', 'Quản lý thông tin chủ đầu tư, địa điểm và quy mô.', 'Theo dõi trạng thái tổng của từng dự án.'],
  workers: ['Quản lý danh sách công nhân.', 'Quản lý tổ đội và đội trưởng thi công.', 'Theo dõi chấm công và tiến độ từng người.'],
  materials: ['Ghi nhận vật tư cần mua.', 'Theo dõi vật tư đã cấp cho công trình.', 'Kiểm tra chi phí phát sinh.'],
  equipment: ['Quản lý máy móc và công cụ thi công.', 'Theo dõi thiết bị đang dùng tại công trình.', 'Ghi nhận tình trạng hư hỏng hoặc cần bảo trì.'],
  schedule: ['Lập mốc tiến độ phần thô.', 'Theo dõi hạng mục chậm hoặc đang thi công.', 'Cập nhật lịch làm việc theo ngày.'],
  costs: ['Tổng hợp chi phí phần thô tạm tính.', 'Theo dõi chi phí vật tư, nhân công và thiết bị.', 'Ghi nhận phát sinh theo từng công trình.'],
  diary: ['Đăng hình ảnh hiện trường mỗi ngày.', 'Ghi chú vấn đề phát sinh tại công trình.', 'Lưu lịch sử thi công theo thời gian.'],
  acceptance: ['Tạo checklist nghiệm thu phần thô.', 'Đánh dấu hạng mục đạt hoặc cần sửa.', 'Lưu biên bản nghiệm thu nội bộ.'],
  documents: ['Lưu bản vẽ, hợp đồng và biên bản.', 'Quản lý hồ sơ theo từng dự án.', 'Tìm lại tài liệu thi công nhanh hơn.'],
  reports: ['Xem báo cáo tiến độ theo dự án.', 'Tổng hợp nhân công, vật tư, chi phí và trạng thái.', 'Đánh dấu vấn đề cần xử lý.'],
  settings: ['Cấu hình thông tin hệ thống.', 'Quản lý cấu hình hỗ trợ và bảo trì.', 'Kiểm tra kết nối MongoDB, GitHub và Vercel.']
};

export default function DashboardPage({
  activeNavigation,
  activeNavigationId,
  completedProjectSetup,
  currentRole,
  form,
  handleFilterChange,
  handleSubmit,
  loading,
  logout,
  message,
  permissions,
  priorityLabels,
  projects,
  saving,
  session,
  setActivePage,
  setForm,
  stats,
  statusFilter,
  statusIcons,
  statusLabels,
  updateStatus,
  deleteProject,
  visibleNavigation
}) {
  const ActivePageIcon = activeNavigation.icon;
  const [showJobs, setShowJobs] = useState(false);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projectDetailTab, setProjectDetailTab] = useState('overview');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [workerSearch, setWorkerSearch] = useState('');
  const [workerStatus, setWorkerStatus] = useState('all');
  const [materialTab, setMaterialTab] = useState('overview');
  const [materialSearch, setMaterialSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showMaterialImport, setShowMaterialImport] = useState(false);
  const [materialImport, setMaterialImport] = useState({ material: 'Xi măng PCB40', quantity: 100, unit: 'Bao', unitPrice: 95000, supplier: 'Công ty ABC', date: '08/08/2026' });
  const [showMaterialExport, setShowMaterialExport] = useState(false);
  const [materialExport, setMaterialExport] = useState({ material: 'Xi măng PCB40', quantity: 1, category: 'Móng', date: '18/08/2026', note: '' });
  const [materialError, setMaterialError] = useState('');
  const [materialTransactions, setMaterialTransactions] = useState([
    { id: 1, projectId: 'current-project', material: 'Xi măng PCB40', type: 'IMPORT', quantity: 300, unitPrice: 95000, category: 'Móng', supplier: 'Công ty ABC', date: '15/08/2026', note: 'NCC ABC' },
    { id: 2, projectId: 'current-project', material: 'Xi măng PCB40', type: 'EXPORT', quantity: 220, unitPrice: 0, category: 'Móng', date: '17/08/2026', note: 'Đổ bê tông móng' },
    { id: 3, projectId: 'current-project', material: 'Thép D16', type: 'IMPORT', quantity: 2000, unitPrice: 17500, category: 'Móng', supplier: 'Thép Việt', date: '15/08/2026', note: 'Nhập thép đợt 1' },
    { id: 4, projectId: 'current-project', material: 'Thép D16', type: 'EXPORT', quantity: 1200, unitPrice: 0, category: 'Móng', date: '17/08/2026', note: 'Gia công thép móng' },
    { id: 5, projectId: 'current-project', material: 'Cát xây', type: 'IMPORT', quantity: 20, unitPrice: 420000, category: 'Xây tường', supplier: 'VLXD Lào Cai', date: '16/08/2026', note: '' },
    { id: 6, projectId: 'current-project', material: 'Cát xây', type: 'EXPORT', quantity: 15, unitPrice: 0, category: 'Xây tường', date: '18/08/2026', note: 'Trộn vữa xây' },
    { id: 7, projectId: 'current-project', material: 'Đá 1×2', type: 'IMPORT', quantity: 20, unitPrice: 480000, category: 'Móng', supplier: 'VLXD Lào Cai', date: '16/08/2026', note: '' },
    { id: 8, projectId: 'current-project', material: 'Đá 1×2', type: 'EXPORT', quantity: 8, unitPrice: 0, category: 'Móng', date: '18/08/2026', note: 'Đổ bê tông móng' }
  ]);
  const [purchaseRequests, setPurchaseRequests] = useState([
    { id: 1, projectId: 'current-project', material: 'Xi măng PCB40', quantity: 100, unit: 'Bao', category: 'Móng', neededDate: '18/08/2026', status: 'PENDING' },
    { id: 2, projectId: 'current-project', material: 'Thép D16', quantity: 500, unit: 'Kg', category: 'Cột tầng trệt', neededDate: '20/08/2026', status: 'ORDERED' }
  ]);
  const [costTab, setCostTab] = useState('overview');
  const [costFromDate, setCostFromDate] = useState('');
  const [costToDate, setCostToDate] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ type: 'MACHINE', description: '', amount: '', category: 'Móng', date: '18/08/2026', note: '' });
  const [expenses, setExpenses] = useState([
    { id: 1, projectId: 'current-project', type: 'MACHINE', description: 'Thuê máy xúc 1 ngày', amount: 3500000, category: 'Móng', date: '17/08/2026', note: '' },
    { id: 2, projectId: 'current-project', type: 'TRANSPORT', description: 'Vận chuyển thép đến công trình', amount: 2200000, category: 'Móng', date: '16/08/2026', note: 'Xe 5 tấn' },
    { id: 3, projectId: 'current-project', type: 'UTILITIES', description: 'Điện nước công trường', amount: 1200000, category: 'Chuẩn bị & mặt bằng', date: '18/08/2026', note: '' }
  ]);
  const completedJobs = Math.min(7, projects.filter((project) => project.status === 'done').length);
  const overallProgress = projects.length ? Math.round((completedJobs / projects.length) * 100) : 0;
  const constructionStatus = overallProgress === 100 ? 'Hoàn thành' : projects.some((project) => project.status === 'active') ? 'Đang thi công' : 'Chuẩn bị thi công';
  const constructionStatusClass = overallProgress === 100 ? 'done' : projects.some((project) => project.status === 'active') ? 'active' : 'planning';
  const roughCategories = ['Chuẩn bị & mặt bằng', 'Móng', 'Khung BTCT', 'Xây tường', 'Cầu thang', 'Mái', 'Tô/trát'];
  const foundationTasks = ['Đào đất móng', 'Đổ bê tông lót', 'Gia công cốt thép móng', 'Lắp dựng cốp pha', 'Đổ bê tông móng', 'Tháo cốp pha', 'Lấp đất'];
  const constructionTeams = [
    { id: 1, name: 'Đội thi công 01', leader: 'Nguyễn Văn Hùng', phone: '0901 234 567', members: 8, present: 7, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Móng', task: 'Gia công cốt thép móng', status: 'active' },
    { id: 2, name: 'Đội thi công 02', leader: 'Trần Minh Đức', phone: '0902 345 678', members: 7, present: 7, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Khung BTCT', task: 'Lắp dựng cốp pha cột', status: 'active' },
    { id: 3, name: 'Đội thi công 03', leader: 'Lê Quốc Nam', phone: '0903 456 789', members: 6, present: 5, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Xây tường', task: 'Chuẩn bị vật tư', status: 'waiting' },
    { id: 4, name: 'Đội thi công 04', leader: 'Phạm Anh Tuấn', phone: '0904 567 890', members: 5, present: 4, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Mái', task: 'Chờ phân công', status: 'paused' }
  ];
  const filteredTeams = constructionTeams.filter((team) => {
    const query = workerSearch.trim().toLocaleLowerCase('vi');
    const matchesSearch = !query || [team.name, team.leader, team.project, team.category].some((value) => value.toLocaleLowerCase('vi').includes(query));
    return matchesSearch && (workerStatus === 'all' || team.status === workerStatus);
  });
  const materialDefinitions = [
    { name: 'Xi măng PCB40', unit: 'Bao', minStock: 100, price: 95000 },
    { name: 'Thép D16', unit: 'Kg', minStock: 500, price: 17500 },
    { name: 'Cát xây', unit: 'm³', minStock: 6, price: 420000 },
    { name: 'Đá 1×2', unit: 'm³', minStock: 10, price: 480000 }
  ];
  const materials = materialDefinitions.map((definition) => {
    const transactions = materialTransactions.filter((transaction) => transaction.projectId === 'current-project' && transaction.material === definition.name);
    const imported = transactions.filter((transaction) => transaction.type === 'IMPORT').reduce((sum, transaction) => sum + transaction.quantity, 0);
    const used = transactions.filter((transaction) => transaction.type === 'EXPORT').reduce((sum, transaction) => sum + transaction.quantity, 0);
    const remaining = imported - used;
    return { ...definition, imported, used, remaining, status: remaining <= 0 ? 'empty' : remaining <= definition.minStock ? 'low' : 'enough' };
  });
  const filteredMaterials = materials.filter((material) => material.name.toLocaleLowerCase('vi').includes(materialSearch.trim().toLocaleLowerCase('vi')));
  const totalImportValue = materialTransactions.filter((transaction) => transaction.type === 'IMPORT').reduce((sum, transaction) => sum + transaction.quantity * transaction.unitPrice, 0);
  const laborCosts = [
    { id: 1, projectId: 'current-project', name: 'Đội thi công 01', category: 'Móng', paymentType: 'DAILY', workUnits: 20, dailyRate: 500000, contractAmount: 0, date: '17/08/2026' },
    { id: 2, projectId: 'current-project', name: 'Đội thi công 02', category: 'Khung BTCT', paymentType: 'CONTRACT', workUnits: 0, dailyRate: 0, contractAmount: 35000000, date: '18/08/2026' }
  ];
  const dateKey = (value) => { const [day, month, year] = String(value).split('/'); return year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : value; };
  const inCostDateRange = (date) => (!costFromDate || dateKey(date) >= costFromDate) && (!costToDate || dateKey(date) <= costToDate);
  const costMaterialTransactions = materialTransactions.filter((entry) => entry.projectId === 'current-project' && entry.type === 'IMPORT' && inCostDateRange(entry.date));
  const filteredLaborCosts = laborCosts.filter((entry) => entry.projectId === 'current-project' && inCostDateRange(entry.date));
  const filteredExpenses = expenses.filter((entry) => entry.projectId === 'current-project' && inCostDateRange(entry.date));
  const materialCost = costMaterialTransactions.reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0);
  const laborCost = filteredLaborCosts.reduce((sum, entry) => sum + (entry.paymentType === 'DAILY' ? entry.workUnits * entry.dailyRate : entry.contractAmount), 0);
  const machineCost = filteredExpenses.filter((entry) => entry.type === 'MACHINE').reduce((sum, entry) => sum + entry.amount, 0);
  const otherExpenseCost = filteredExpenses.filter((entry) => entry.type !== 'MACHINE').reduce((sum, entry) => sum + entry.amount, 0);
  const otherCost = machineCost + otherExpenseCost;
  const totalCost = materialCost + laborCost + otherCost;
  const formatMoney = (value) => `${Number(value).toLocaleString('vi-VN')}đ`;
  const formatCompactMoney = (value) => value >= 1000000 ? `${(value / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu` : formatMoney(value);
  const expenseLabels = { MACHINE: 'Máy móc / thiết bị', TRANSPORT: 'Vận chuyển', UTILITIES: 'Điện nước', OTHER: 'Khác' };

  function saveMaterialImport(event) {
    event.preventDefault();
    if (!materialImport.quantity || materialImport.quantity <= 0 || materialImport.unitPrice < 0) {
      setMaterialError('Số lượng và đơn giá phải hợp lệ.');
      return;
    }
    setMaterialTransactions((current) => [...current, { id: Date.now(), projectId: 'current-project', material: materialImport.material, type: 'IMPORT', quantity: Number(materialImport.quantity), unitPrice: Number(materialImport.unitPrice), category: materialImport.category || 'Móng', supplier: materialImport.supplier, date: materialImport.date, note: materialImport.note || '' }]);
    if (materialImport.requestId) setPurchaseRequests((current) => current.map((request) => request.id === materialImport.requestId ? { ...request, status: 'RECEIVED' } : request));
    setMaterialError('');
    setShowMaterialImport(false);
  }

  function saveMaterialExport(event) {
    event.preventDefault();
    const material = materials.find((item) => item.name === materialExport.material);
    if (!materialExport.quantity || materialExport.quantity <= 0) {
      setMaterialError('Số lượng xuất phải lớn hơn 0.');
      return;
    }
    if (materialExport.quantity > material.remaining) {
      setMaterialError(`Không thể xuất quá tồn kho hiện tại (${material.remaining.toLocaleString('vi-VN')} ${material.unit}).`);
      return;
    }
    setMaterialTransactions((current) => [...current, { id: Date.now(), projectId: 'current-project', material: materialExport.material, type: 'EXPORT', quantity: Number(materialExport.quantity), unitPrice: 0, category: materialExport.category, supplier: '', date: materialExport.date, note: materialExport.note }]);
    setMaterialError('');
    setShowMaterialExport(false);
    setSelectedMaterial(null);
  }

  function saveExpense(event) {
    event.preventDefault();
    if (!expenseForm.description.trim() || !Number(expenseForm.amount) || Number(expenseForm.amount) <= 0) return;
    setExpenses((current) => [...current, { ...expenseForm, id: Date.now(), projectId: 'current-project', amount: Number(expenseForm.amount) }]);
    setExpenseForm({ type: 'MACHINE', description: '', amount: '', category: 'Móng', date: '18/08/2026', note: '' });
    setShowExpenseModal(false);
  }

  return (
    <main className="app-shell">
      <div className="app-layout">
        <aside className="left-sidebar" aria-label="Thanh menu">
          <div className="sidebar-brand">
            <div className="brand-mark"><Building2 size={20} /></div>
            <div><span>TN Ideal</span><strong>Công trình</strong></div>
          </div>

          <nav className="sidebar-nav" aria-label="Chuyển trang">
            {visibleNavigation.map((item) => {
              const NavIcon = item.icon;
              return (
                <button
                  className={activeNavigationId === item.id ? 'active' : ''}
                  key={item.id}
                  type="button"
                  onClick={() => setActivePage(item.id)}
                >
                  <NavIcon size={18} /><span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="sidebar-user">
            <span>{session.user.displayName || session.user.username}</span>
            <strong>{currentRole.label}</strong>
          </div>
          <button className="logout-button sidebar-logout" type="button" onClick={logout}>
            <LogOut size={18} />Đăng xuất
          </button>
        </aside>

        <section className="main-content">
          <header className="page-header"><h1>{activeNavigation.title}</h1><p>{activeNavigation.description}</p></header>

          {activeNavigationId === 'overview' && (
            <section className="overview-grid">
              <article className="overview-card"><span>Tổng công việc</span><strong>{stats.total}</strong><p>Tất cả công việc đang có trong hệ thống.</p></article>
              <article className="overview-card"><span>Đang làm</span><strong>{stats.active}</strong><p>Các hạng mục đang được đội thi công xử lý.</p></article>
              <article className="overview-card"><span>Hoàn thành</span><strong>{stats.done}</strong><p>Các công việc đã được cập nhật hoàn tất.</p></article>
            </section>
          )}

          {activeNavigationId === 'jobs' && (
            <section className="workspace">
              <form className="project-form" onSubmit={handleSubmit}>
                <div className="section-title"><FolderKanban size={22} /><h2>Thêm công việc thi công</h2></div>
                <label>Tên công trình<input disabled={!permissions.create} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ví dụ: Sửa nhà phố Quận 7" required minLength={3} /></label>
                <div className="field-grid">
                  <label>Người phụ trách<input disabled={!permissions.create} value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Tên thầu hoặc đội trưởng" required /></label>
                  <label>Hạng mục<input disabled={!permissions.create} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Móng, mái, điện nước..." required /></label>
                </div>
                <div className="field-grid">
                  <label>Mức ưu tiên<select disabled={!permissions.create} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Thấp</option><option value="medium">Vừa</option><option value="high">Cao</option></select></label>
                  <label>Trạng thái<select disabled={!permissions.create} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="planning">Lên kế hoạch</option><option value="active">Đang làm</option><option value="done">Hoàn thành</option></select></label>
                </div>
                <label>Mô tả<textarea disabled={!permissions.create} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Phạm vi việc, vật tư, hạn hoàn thành, ghi chú công trường" rows="4" /></label>
                <button className="primary-button" type="submit" disabled={saving || !permissions.create}>{saving ? <Loader2 className="spin" size={18} /> : <CirclePlus size={18} />}{saving ? 'Đang lưu' : 'Thêm công việc'}</button>
                {message && <p className="message">{message}</p>}
              </form>

              <section className="project-list">
                <div className="list-header">
                  <div><span className="eyebrow">Bảng điều khiển</span><h2>Công việc thi công</h2></div>
                  <div className="inline-filter" aria-label="Lọc trạng thái">
                    {Object.entries(statusLabels).map(([value, label]) => <button className={statusFilter === value ? 'active' : ''} key={value} type="button" onClick={() => handleFilterChange(value)}>{label}</button>)}
                  </div>
                </div>
                {loading ? (
                  <div className="empty-state"><Loader2 className="spin" /><span>Đang tải dữ liệu</span></div>
                ) : projects.length === 0 ? (
                  <div className="empty-state"><FolderKanban /><span>Chưa có công việc nào trong bộ lọc này.</span></div>
                ) : (
                  <div className="cards-grid">
                    {projects.map((project) => {
                      const StatusIcon = statusIcons[project.status];
                      return (
                        <article className="project-card" key={project._id}>
                          <div className="card-topline"><span className={`status-pill ${project.status}`}><StatusIcon size={15} />{statusLabels[project.status]}</span><span className={`priority ${project.priority}`}>{priorityLabels[project.priority]}</span></div>
                          <h3>{project.title}</h3><p>{project.description || 'Chưa có mô tả chi tiết.'}</p>
                          <dl><div><dt>Phụ trách</dt><dd>{project.owner}</dd></div><div><dt>Hạng mục</dt><dd>{project.category}</dd></div></dl>
                          <div className="card-actions">
                            <select disabled={!permissions.updateStatus} value={project.status} onChange={(event) => updateStatus(project, event.target.value)}><option value="planning">Lên kế hoạch</option><option value="active">Đang làm</option><option value="done">Hoàn thành</option></select>
                            {permissions.delete && <button type="button" onClick={() => deleteProject(project._id)} aria-label={`Xóa ${project.title}`}><Trash2 size={17} /></button>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            </section>
          )}

          {activeNavigationId === 'projects' && completedProjectSetup && (
            <section className="saved-project-panel">
              <div className="saved-project-heading">
                <div className="saved-project-title">
                  <span className="saved-project-icon"><Building2 size={26} /></span>
                  <div>
                    <span className="eyebrow">Công trình phần thô</span>
                    <h2>{completedProjectSetup.name}</h2>
                    <p><MapPin size={17} />{completedProjectSetup.fullAddress || completedProjectSetup.location}</p>
                  </div>
                </div>
                <span className={`status-pill ${constructionStatusClass}`}>{constructionStatus}</span>
              </div>

              <div className="saved-project-details">
                <div><span className="detail-icon"><UserRound size={19} /></span><span>Chủ đầu tư</span><strong>{completedProjectSetup.investorName}</strong><small>{completedProjectSetup.investorPhone}</small></div>
                <div><span className="detail-icon"><Ruler size={19} /></span><span>Quy mô</span><strong>{completedProjectSetup.landLength}m × {completedProjectSetup.landWidth}m</strong><small>Trệt, {completedProjectSetup.upperFloors || 0} lầu · {completedProjectSetup.hasBasement ? 'Có tầng hầm' : 'Không tầng hầm'}</small></div>
                <div><span className="detail-icon"><CalendarDays size={19} /></span><span>Khởi công</span><strong>{completedProjectSetup.startDate}</strong><small>Dự kiến {completedProjectSetup.duration} tháng</small></div>
              </div>

              <div className="project-progress-block">
                <div><span>Tiến độ tổng thể</span><strong>{overallProgress}%</strong></div>
                <span className="project-progress-track"><span style={{ width: `${overallProgress}%` }} /></span>
              </div>

              <div className="project-quick-stats">
                <span><strong>{completedJobs}/7</strong> Hạng mục</span>
                <span><strong>0</strong> Nhân công</span>
                <span><strong>0đ</strong> Chi phí</span>
              </div>

              <div className="saved-project-actions">
                <p>Quản lý hạng mục, công việc và hồ sơ của công trình.</p>
                <button className="primary-button" type="button" onClick={() => { setProjectDetailTab('overview'); setShowProjectDetail(true); }}>
                  Xem chi tiết dự án<ChevronRight size={18} />
                </button>
              </div>
            </section>
          )}

          {activeNavigationId === 'workers' && (
            <section className="workers-page">
              <div className="worker-stats">
                <article><span><UsersRound size={20} /></span><div><strong>4</strong><small>Đội thi công</small></div></article>
                <article><span><UserRound size={20} /></span><div><strong>26</strong><small>Nhân sự</small></div></article>
                <article><span><UserCheck size={20} /></span><div><strong>23</strong><small>Có mặt hôm nay</small></div></article>
                <article><span><ClipboardList size={20} /></span><div><strong>312</strong><small>Tổng ngày công</small></div></article>
              </div>

              <div className="workers-toolbar">
                <label className="worker-search"><Search size={18} /><input value={workerSearch} onChange={(event) => setWorkerSearch(event.target.value)} placeholder="Tìm đội, đội trưởng, hạng mục..." /></label>
                <select aria-label="Lọc công trình"><option>{completedProjectSetup?.name || 'Tất cả công trình'}</option></select>
                <select aria-label="Lọc trạng thái" value={workerStatus} onChange={(event) => setWorkerStatus(event.target.value)}><option value="all">Tất cả trạng thái</option><option value="active">Đang thi công</option><option value="waiting">Chờ việc</option><option value="paused">Tạm dừng</option></select>
                <button className="primary-button" type="button"><CirclePlus size={18} />Thêm đội</button>
              </div>

              <div className="teams-heading"><div><span className="eyebrow">Nhân lực công trường</span><h2>Đội thi công</h2></div><span>{filteredTeams.length} đội</span></div>
              <div className="team-grid">
                {filteredTeams.map((team) => <article className="team-card" key={team.id}><div className="team-card-head"><div><h3>{team.name}</h3><p>{team.leader} · {team.phone}</p></div><span className={`team-status ${team.status}`}>{team.status === 'active' ? 'Đang thi công' : team.status === 'waiting' ? 'Chờ việc' : 'Tạm dừng'}</span></div><div className="team-meta"><span><UsersRound size={17} /><strong>{team.members}</strong> người</span><span><Building2 size={17} />{team.project}</span><span><ClipboardList size={17} />{team.category}</span></div><div className="team-current-work"><span>Công việc hiện tại</span><strong>{team.task}</strong><small>Hôm nay: <b>{team.present}/{team.members}</b> người có mặt</small></div><div className="team-actions"><button type="button">Xem đội</button><button type="button">Chấm công</button><button className="primary-button" type="button">Phân công</button></div></article>)}
                {filteredTeams.length === 0 && <div className="empty-state"><UsersRound /><span>Không tìm thấy đội thi công phù hợp.</span></div>}
              </div>
            </section>
          )}

          {activeNavigationId === 'materials' && (
            <section className="materials-page">
              <div className="material-stats"><article><span><Package size={20} /></span><div><strong>{materials.length}</strong><small>Vật tư đang quản lý</small></div></article><article><span><ClipboardList size={20} /></span><div><strong>{purchaseRequests.filter((request) => !['RECEIVED', 'CANCELLED'].includes(request.status)).length}</strong><small>Cần mua</small></div></article><article><span><Package size={20} /></span><div><strong>{materials.filter((material) => material.used > 0).length}</strong><small>Đã sử dụng</small></div></article><article><span><DollarSign size={20} /></span><div><strong>{(totalImportValue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr</strong><small>Giá trị đã nhập</small></div></article></div>
              <div className="materials-toolbar"><label className="worker-search"><Search size={18} /><input value={materialSearch} onChange={(event) => setMaterialSearch(event.target.value)} placeholder="Tìm vật tư..." /></label><select><option>{completedProjectSetup?.name || 'Tất cả công trình'}</option></select><select><option>Tất cả hạng mục</option><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select><select><option>Tất cả trạng thái</option><option>Sắp hết</option><option>Còn</option></select><button className="primary-button" type="button" onClick={() => setShowMaterialImport(true)}><CirclePlus size={18} />Nhập vật tư</button></div>
              <div className="material-tabs"><button className={materialTab === 'overview' ? 'active' : ''} type="button" onClick={() => setMaterialTab('overview')}>Vật tư hiện có</button><button className={materialTab === 'buy' ? 'active' : ''} type="button" onClick={() => setMaterialTab('buy')}>Cần mua</button><button className={materialTab === 'history' ? 'active' : ''} type="button" onClick={() => setMaterialTab('history')}>Lịch sử nhập/xuất</button></div>
              {materialTab === 'overview' && <div className="material-table"><div className="material-table-head"><span>Vật tư</span><span>ĐVT</span><span>Đã nhập</span><span>Đã dùng</span><span>Tồn kho</span><span>Trạng thái</span><span>Thao tác</span></div>{filteredMaterials.map((material) => <div className="material-table-row" key={material.name}><strong>{material.name}</strong><span>{material.unit}</span><span>{material.imported.toLocaleString('vi-VN')}</span><span>{material.used.toLocaleString('vi-VN')}</span><b>{material.remaining.toLocaleString('vi-VN')}</b><span className={`material-status ${material.status}`}>{material.status === 'enough' ? 'Còn' : material.status === 'low' ? 'Sắp hết' : 'Hết'}</span><button type="button" onClick={() => setSelectedMaterial(material)}>Xem</button></div>)}</div>}
              {materialTab === 'buy' && <div className="purchase-section"><div className="purchase-heading"><span>{purchaseRequests.length} yêu cầu vật tư</span><button className="primary-button" type="button"><CirclePlus size={18} />Thêm vật tư cần mua</button></div><div className="purchase-grid">{purchaseRequests.map((request) => { const material = materials.find((item) => item.name === request.material); const statusLabels = { PENDING: 'Chưa mua', ORDERED: 'Đã đặt', RECEIVED: 'Đã nhập', CANCELLED: 'Hủy' }; return <article key={request.id}><div><span className={`request-status ${request.status.toLowerCase()}`}>{statusLabels[request.status]}</span><h3>{request.material}</h3><p>{completedProjectSetup?.name || 'Nhà A Tín'} → {request.category}</p></div><dl><div><dt>Số lượng</dt><dd>{request.quantity.toLocaleString('vi-VN')} {request.unit}</dd></div><div><dt>Ngày cần</dt><dd>{request.neededDate}</dd></div><div><dt>Tồn hiện tại</dt><dd>{material.remaining.toLocaleString('vi-VN')} {request.unit}</dd></div></dl>{request.status !== 'RECEIVED' && request.status !== 'CANCELLED' && <button className="primary-button" type="button" onClick={() => { setMaterialImport({ ...materialImport, requestId: request.id, material: material.name, quantity: request.quantity, unit: material.unit, unitPrice: material.price, category: request.category }); setShowMaterialImport(true); }}>Ghi nhận đã nhập</button>}</article>; })}</div></div>}
              {materialTab === 'history' && <div className="history-table"><div className="history-table-head"><span>Ngày</span><span>Loại</span><span>Vật tư</span><span>Số lượng</span><span>ĐVT</span><span>Hạng mục</span><span>Đơn giá</span><span>Thành tiền</span><span>Ghi chú</span></div>{[...materialTransactions].reverse().map((entry) => { const material = materials.find((item) => item.name === entry.material); return <div className="history-table-row" key={entry.id}><span>{entry.date}</span><span className={`movement ${entry.type === 'IMPORT' ? 'import' : 'export'}`}>{entry.type === 'IMPORT' ? 'Nhập' : 'Xuất'}</span><strong>{entry.material}</strong><b>{entry.type === 'IMPORT' ? '+' : '-'}{entry.quantity.toLocaleString('vi-VN')}</b><span>{material.unit}</span><span>{entry.category}</span><span>{entry.unitPrice ? entry.unitPrice.toLocaleString('vi-VN') : '—'}</span><strong>{entry.unitPrice ? (entry.quantity * entry.unitPrice).toLocaleString('vi-VN') : '—'}</strong><span>{entry.note || entry.supplier || '—'}</span></div>; })}</div>}
            </section>
          )}

          {selectedMaterial && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selectedMaterial.name}`}><div className="jobs-modal-card material-detail-modal"><div className="jobs-modal-header"><div><span className="eyebrow">Chi tiết vật tư</span><h2>{selectedMaterial.name}</h2><p>{completedProjectSetup?.name || 'Nhà A Tín'} · ĐVT: {selectedMaterial.unit} · Tồn tối thiểu: {selectedMaterial.minStock.toLocaleString('vi-VN')}</p></div><button type="button" onClick={() => setSelectedMaterial(null)} aria-label="Đóng"><X size={22} /></button></div><div className="material-detail-content"><div className="material-detail-summary"><article><span>Tổng đã nhập</span><strong>{selectedMaterial.imported.toLocaleString('vi-VN')}</strong><small>{selectedMaterial.unit}</small></article><article><span>Tổng đã dùng</span><strong>{selectedMaterial.used.toLocaleString('vi-VN')}</strong><small>{selectedMaterial.unit}</small></article><article className="remaining"><span>Tồn hiện tại</span><strong>{selectedMaterial.remaining.toLocaleString('vi-VN')}</strong><small>{selectedMaterial.unit}</small></article></div><div className="material-detail-actions"><button className="primary-button" type="button" onClick={() => { setMaterialExport({ ...materialExport, material: selectedMaterial.name }); setMaterialError(''); setShowMaterialExport(true); }}>Xuất sử dụng</button></div><section><h3>Sử dụng theo hạng mục</h3><div className="usage-list">{Array.from(new Set(materialTransactions.filter((entry) => entry.material === selectedMaterial.name && entry.type === 'EXPORT').map((entry) => entry.category))).map((category) => <div key={category}><span>{category}</span><strong>{materialTransactions.filter((entry) => entry.material === selectedMaterial.name && entry.type === 'EXPORT' && entry.category === category).reduce((sum, entry) => sum + entry.quantity, 0).toLocaleString('vi-VN')} {selectedMaterial.unit}</strong></div>)}</div></section><section><h3>Lịch sử nhập/xuất</h3><div className="usage-list">{materialTransactions.filter((entry) => entry.material === selectedMaterial.name).map((entry) => <div key={entry.id}><span>{entry.date} · {entry.type === 'IMPORT' ? 'Nhập' : 'Xuất'} · {entry.category}</span><strong>{entry.type === 'IMPORT' ? '+' : '-'}{entry.quantity.toLocaleString('vi-VN')} {selectedMaterial.unit}</strong></div>)}</div></section></div></div></section>}

          {showMaterialImport && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Nhập vật tư"><form className="jobs-modal-card material-import-modal" onSubmit={saveMaterialImport}><div className="jobs-modal-header"><div><span className="eyebrow">Kho công trình</span><h2>Nhập vật tư</h2></div><button type="button" onClick={() => setShowMaterialImport(false)} aria-label="Đóng"><X size={22} /></button></div><div className="material-import-form"><label>Công trình *<select><option>{completedProjectSetup?.name || 'Nhà A Tín'}</option></select></label><label>Hạng mục<select value={materialImport.category || 'Móng'} onChange={(event) => setMaterialImport({ ...materialImport, category: event.target.value })}><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select></label><label>Vật tư *<select value={materialImport.material} onChange={(event) => { const material = materials.find((item) => item.name === event.target.value); setMaterialImport({ ...materialImport, material: event.target.value, unit: material.unit, unitPrice: material.price }); }}>{materials.map((material) => <option key={material.name}>{material.name}</option>)}</select></label><div className="field-grid"><label>Số lượng *<input min="1" type="number" value={materialImport.quantity} onChange={(event) => setMaterialImport({ ...materialImport, quantity: Number(event.target.value) })} /></label><label>Đơn vị *<input readOnly value={materialImport.unit} /></label></div><label>Đơn giá *<input min="0" type="number" value={materialImport.unitPrice} onChange={(event) => setMaterialImport({ ...materialImport, unitPrice: Number(event.target.value) })} /></label><label>Nhà cung cấp<input value={materialImport.supplier} onChange={(event) => setMaterialImport({ ...materialImport, supplier: event.target.value })} /></label><label>Ngày nhập *<input value={materialImport.date} onChange={(event) => setMaterialImport({ ...materialImport, date: event.target.value })} /></label><label>Ghi chú<textarea rows="2" value={materialImport.note || ''} onChange={(event) => setMaterialImport({ ...materialImport, note: event.target.value })} /></label>{materialError && <p className="setup-error">{materialError}</p>}<div className="import-total"><span>Thành tiền</span><strong>{(materialImport.quantity * materialImport.unitPrice).toLocaleString('vi-VN')}đ</strong></div><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowMaterialImport(false)}>Hủy</button><button className="primary-button" type="submit">Xác nhận nhập</button></div></div></form></section>}

          {showMaterialExport && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Xuất sử dụng vật tư"><form className="jobs-modal-card material-import-modal" onSubmit={saveMaterialExport}><div className="jobs-modal-header"><div><span className="eyebrow">Kho công trình</span><h2>Xuất sử dụng vật tư</h2></div><button type="button" onClick={() => setShowMaterialExport(false)} aria-label="Đóng"><X size={22} /></button></div><div className="material-import-form"><label>Công trình<select><option>{completedProjectSetup?.name || 'Nhà A Tín'}</option></select></label><label>Vật tư<select value={materialExport.material} onChange={(event) => setMaterialExport({ ...materialExport, material: event.target.value })}>{materials.map((material) => <option key={material.name}>{material.name}</option>)}</select></label><label>Số lượng xuất *<input min="1" type="number" value={materialExport.quantity} onChange={(event) => setMaterialExport({ ...materialExport, quantity: Number(event.target.value) })} /></label><label>Hạng mục sử dụng<select value={materialExport.category} onChange={(event) => setMaterialExport({ ...materialExport, category: event.target.value })}><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select></label><label>Ngày sử dụng<input value={materialExport.date} onChange={(event) => setMaterialExport({ ...materialExport, date: event.target.value })} /></label><label>Ghi chú<textarea rows="3" placeholder="Ví dụ: Đổ bê tông móng" value={materialExport.note} onChange={(event) => setMaterialExport({ ...materialExport, note: event.target.value })} /></label>{materialError && <p className="setup-error">{materialError}</p>}<div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowMaterialExport(false)}>Hủy</button><button className="primary-button" type="submit">Xác nhận xuất</button></div></div></form></section>}

          {activeNavigationId === 'costs' && (
            <section className="cost-page">
              <div className="cost-toolbar"><label>Dự án<select><option>{completedProjectSetup?.name || 'Chọn một dự án'}</option></select></label><label>Từ ngày<input type="date" value={costFromDate} onChange={(event) => setCostFromDate(event.target.value)} /></label><label>Đến ngày<input type="date" value={costToDate} onChange={(event) => setCostToDate(event.target.value)} /></label><button className="primary-button" type="button" onClick={() => setShowExpenseModal(true)}><CirclePlus size={18} />Thêm chi phí</button></div>
              <div className="cost-summary-cards"><article><span><DollarSign size={20} /></span><div><small>Tổng chi phí</small><strong>{formatCompactMoney(totalCost)}</strong></div></article><article><span><Package size={20} /></span><div><small>Chi phí vật tư</small><strong>{formatCompactMoney(materialCost)}</strong></div></article><article><span><UsersRound size={20} /></span><div><small>Chi phí nhân công</small><strong>{formatCompactMoney(laborCost)}</strong></div></article><article><span><ClipboardList size={20} /></span><div><small>Chi phí khác</small><strong>{formatCompactMoney(otherCost)}</strong></div></article></div>
              <div className="material-tabs"><button className={costTab === 'overview' ? 'active' : ''} type="button" onClick={() => setCostTab('overview')}>Tổng quan</button><button className={costTab === 'materials' ? 'active' : ''} type="button" onClick={() => setCostTab('materials')}>Vật tư</button><button className={costTab === 'labor' ? 'active' : ''} type="button" onClick={() => setCostTab('labor')}>Nhân công</button><button className={costTab === 'expenses' ? 'active' : ''} type="button" onClick={() => setCostTab('expenses')}>Phát sinh</button></div>
              {costTab === 'overview' && <div className="cost-overview"><section><div className="cost-section-heading"><span className="eyebrow">Tổng hợp</span><h2>Cơ cấu chi phí</h2></div><div className="cost-breakdown"><div className="cost-table-head"><span>Loại chi phí</span><span>Số tiền</span><span>Tỷ trọng</span></div>{[['Vật tư', materialCost], ['Nhân công', laborCost], ['Máy móc / thiết bị', machineCost], ['Phát sinh khác', otherExpenseCost]].map(([label, amount]) => <div key={label}><strong>{label}</strong><span>{formatMoney(amount)}</span><span><b>{totalCost ? Math.round(amount / totalCost * 100) : 0}%</b><i><i style={{ width: `${totalCost ? amount / totalCost * 100 : 0}%` }} /></i></span></div>)}</div></section><section><div className="cost-section-heading"><span className="eyebrow">Theo công việc</span><h2>Chi phí theo hạng mục</h2></div><div className="category-cost-table"><div><span>Hạng mục</span><span>Vật tư</span><span>Nhân công</span><span>Khác</span><span>Tổng</span></div>{['Chuẩn bị & mặt bằng', 'Móng', 'Khung BTCT', 'Xây tường'].map((category) => { const materialAmount = costMaterialTransactions.filter((entry) => entry.category === category).reduce((sum, entry) => sum + entry.quantity * entry.unitPrice, 0); const laborAmount = filteredLaborCosts.filter((entry) => entry.category === category).reduce((sum, entry) => sum + (entry.paymentType === 'DAILY' ? entry.workUnits * entry.dailyRate : entry.contractAmount), 0); const expenseAmount = filteredExpenses.filter((entry) => entry.category === category).reduce((sum, entry) => sum + entry.amount, 0); return <div key={category}><strong>{category}</strong><span>{formatMoney(materialAmount)}</span><span>{formatMoney(laborAmount)}</span><span>{formatMoney(expenseAmount)}</span><b>{formatMoney(materialAmount + laborAmount + expenseAmount)}</b></div>; })}</div></section></div>}
              {costTab === 'materials' && <div className="cost-data-table material-cost-table"><div><span>Ngày</span><span>Vật tư</span><span>Hạng mục</span><span>Số lượng</span><span>Đơn giá</span><span>Thành tiền</span><span>Nhà cung cấp</span></div>{costMaterialTransactions.map((entry) => { const material = materials.find((item) => item.name === entry.material); return <div key={entry.id}><span>{entry.date}</span><strong>{entry.material}</strong><span>{entry.category}</span><span>{entry.quantity.toLocaleString('vi-VN')} {material.unit}</span><span>{formatMoney(entry.unitPrice)}</span><b>{formatMoney(entry.quantity * entry.unitPrice)}</b><span>{entry.supplier || '—'}</span></div>; })}</div>}
              {costTab === 'labor' && <div className="cost-data-table labor-cost-table"><div><span>Đội / Nhân công</span><span>Hạng mục</span><span>Hình thức</span><span>Số công</span><span>Đơn giá</span><span>Thành tiền</span></div>{filteredLaborCosts.map((entry) => <div key={entry.id}><strong>{entry.name}</strong><span>{entry.category}</span><span className="payment-type">{entry.paymentType === 'DAILY' ? 'Theo công' : 'Khoán'}</span><span>{entry.paymentType === 'DAILY' ? entry.workUnits : '—'}</span><span>{entry.paymentType === 'DAILY' ? formatMoney(entry.dailyRate) : '—'}</span><b>{formatMoney(entry.paymentType === 'DAILY' ? entry.workUnits * entry.dailyRate : entry.contractAmount)}</b></div>)}</div>}
              {costTab === 'expenses' && <div className="cost-data-table expense-table"><div><span>Ngày</span><span>Loại</span><span>Nội dung</span><span>Hạng mục</span><span>Số tiền</span><span>Ghi chú</span><span>Thao tác</span></div>{filteredExpenses.map((entry) => <div key={entry.id}><span>{entry.date}</span><span className="expense-type">{expenseLabels[entry.type]}</span><strong>{entry.description}</strong><span>{entry.category}</span><b>{formatMoney(entry.amount)}</b><span>{entry.note || '—'}</span><button type="button" onClick={() => setExpenses((current) => current.filter((expense) => expense.id !== entry.id))}><Trash2 size={17} /></button></div>)}</div>}
            </section>
          )}

          {activeNavigationId === 'diary' && <DiaryPage project={completedProjectSetup} />}

          {showExpenseModal && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Thêm chi phí"><form className="jobs-modal-card material-import-modal" onSubmit={saveExpense}><div className="jobs-modal-header"><div><span className="eyebrow">Chi phí phát sinh</span><h2>Thêm chi phí</h2></div><button type="button" onClick={() => setShowExpenseModal(false)} aria-label="Đóng"><X size={22} /></button></div><div className="material-import-form"><label>Dự án *<select><option>{completedProjectSetup?.name || 'Nhà A Tín'}</option></select></label><label>Hạng mục<select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}><option>Chuẩn bị & mặt bằng</option><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select></label><label>Loại chi phí *<select value={expenseForm.type} onChange={(event) => setExpenseForm({ ...expenseForm, type: event.target.value })}>{Object.entries(expenseLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Nội dung *<input required value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} placeholder="Ví dụ: Thuê máy xúc 1 ngày" /></label><label>Số tiền *<input required min="1" type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} /></label><label>Ngày *<input required value={expenseForm.date} onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })} /></label><label>Ghi chú<textarea rows="3" value={expenseForm.note} onChange={(event) => setExpenseForm({ ...expenseForm, note: event.target.value })} /></label><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowExpenseModal(false)}>Hủy</button><button className="primary-button" type="submit">Lưu chi phí</button></div></div></form></section>}

          {showProjectDetail && (
            <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Chi tiết dự án">
              <div className="jobs-modal-card project-detail-modal">
                <div className="jobs-modal-header">
                  <div className="project-detail-header-copy"><span className="eyebrow">Chi tiết dự án</span><h2>{completedProjectSetup?.name}</h2><p><MapPin size={15} />{completedProjectSetup.provinceCity || completedProjectSetup.location}<span className={`status-pill ${constructionStatusClass}`}>{constructionStatus}</span><strong>{overallProgress}% hoàn thành</strong></p></div>
                  <button type="button" onClick={() => setShowProjectDetail(false)} aria-label="Đóng"><X size={22} /></button>
                </div>
                <div className="project-detail-tabs" role="tablist">
                  <button className={projectDetailTab === 'overview' ? 'active' : ''} type="button" onClick={() => setProjectDetailTab('overview')}>Tổng quan</button>
                  <button className={projectDetailTab === 'categories' ? 'active' : ''} type="button" onClick={() => setProjectDetailTab('categories')}>Hạng mục</button>
                  <button className={projectDetailTab === 'files' ? 'active' : ''} type="button" onClick={() => setProjectDetailTab('files')}>Hồ sơ</button>
                </div>
                <div className="project-detail-content">
                  {projectDetailTab === 'overview' && <div className="detail-overview"><div className="detail-overview-grid"><article><MapPin /><span>Địa chỉ công trình</span><strong>{completedProjectSetup.fullAddress || completedProjectSetup.location}</strong></article><article><UserRound /><span>Chủ đầu tư</span><strong>{completedProjectSetup.investorName}</strong><small>{completedProjectSetup.investorPhone}</small></article><article><Ruler /><span>Quy mô</span><strong>{completedProjectSetup.landLength}m × {completedProjectSetup.landWidth}m</strong><small>Trệt, {completedProjectSetup.upperFloors || 0} lầu · {completedProjectSetup.hasBasement ? 'Có hầm' : 'Không hầm'}</small></article><article><CalendarDays /><span>Thời gian</span><strong>{completedProjectSetup.startDate}</strong><small>Dự kiến {completedProjectSetup.duration} tháng</small></article></div><div className="detail-project-status"><div><span>Tình trạng dự án</span><strong className={`status-text ${constructionStatusClass}`}>{constructionStatus}</strong></div><div><span>Tiến độ</span><strong>{overallProgress}%</strong></div><div><span>Hạng mục</span><strong>{completedJobs}/7 hoàn thành</strong></div><span className="project-progress-track"><span style={{ width: `${overallProgress}%` }} /></span><button className="ghost-button" type="button"><Pencil size={17} />Chỉnh sửa thông tin dự án</button></div></div>}
                  {projectDetailTab === 'categories' && <div className="category-panel"><div className="category-panel-heading"><div><span className="eyebrow">Hạng mục thi công phần thô</span><h3>{completedJobs}/7 hạng mục hoàn thành</h3></div><button className="primary-button" type="button" onClick={() => { setShowProjectDetail(false); setShowJobs(true); }}><CirclePlus size={18} />Thêm hạng mục</button></div><div className="category-table"><div className="category-table-head"><span>Hạng mục</span><span>Trạng thái</span><span>Tiến độ</span><span /></div>{roughCategories.map((category, index) => <div className="category-table-group" key={category}><button className="category-table-row" type="button" onClick={() => setExpandedCategory(expandedCategory === index ? null : index)}><strong><span>{String(index + 1).padStart(2, '0')}.</span>{category}</strong><span className={`category-state ${index < completedJobs ? 'done' : index === completedJobs && projects.length ? 'active' : ''}`}>{index < completedJobs ? 'Hoàn thành' : index === completedJobs && projects.length ? 'Đang thực hiện' : 'Chưa bắt đầu'}</span><b>{index < completedJobs ? '100%' : '0%'}</b><ChevronRight className={expandedCategory === index ? 'expanded' : ''} size={18} /></button>{expandedCategory === index && <div className="category-tasks"><div className="category-task-title"><strong>{category} — {index < completedJobs ? '100%' : '0%'}</strong><button type="button" onClick={() => { setShowProjectDetail(false); setShowJobs(true); }}><CirclePlus size={16} />Thêm công việc</button></div>{(index === 1 ? foundationTasks : ['Chưa có công việc. Bấm “Thêm công việc” để tạo.']).map((task) => <label key={task}><input type="checkbox" disabled={!index || index >= completedJobs} defaultChecked={index < completedJobs} /><span>{task}</span></label>)}</div>}</div>)}</div></div>}
                  {projectDetailTab === 'files' && <div className="project-files"><div className="project-files-heading"><div><span className="eyebrow">Hồ sơ dự án</span><h3>Tài liệu công trình</h3></div><button className="primary-button" type="button"><CirclePlus size={18} />Tải hồ sơ lên</button></div>{[['Bản vẽ', ['Bản vẽ kiến trúc.pdf', 'Bản vẽ kết cấu.pdf']], ['Hợp đồng', ['Hợp đồng thi công.pdf']], ['Pháp lý / tài liệu khác', ['Giấy phép xây dựng.pdf']]].map(([group, files]) => <section className="file-group" key={group}><h4>{group}</h4>{files.map((file) => <div className="file-row" key={file}><FileText size={20} /><strong>{file}</strong><span>PDF</span><button type="button">Xem</button><button type="button">Tải xuống</button><button className="delete-file" type="button" aria-label={`Xóa ${file}`}><Trash2 size={17} /></button></div>)}</section>)}</div>}
                </div>
              </div>
            </section>
          )}

          {showJobs && (
            <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Công việc thi công">
              <div className="jobs-modal-card">
                <div className="jobs-modal-header">
                  <div><span className="eyebrow">{completedProjectSetup?.name}</span><h2>Công việc thi công</h2></div>
                  <button type="button" onClick={() => setShowJobs(false)} aria-label="Đóng"><X size={22} /></button>
                </div>
                <section className="workspace">
                  <form className="project-form" onSubmit={handleSubmit}>
                    <div className="section-title"><FolderKanban size={22} /><h2>Thêm công việc thi công</h2></div>
                    <label>Tên công trình<input disabled={!permissions.create} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required minLength={3} /></label>
                    <div className="field-grid">
                      <label>Người phụ trách<input disabled={!permissions.create} value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Tên thầu hoặc đội trưởng" required /></label>
                      <label>Hạng mục<input disabled={!permissions.create} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Móng, cột, dầm, sàn..." required /></label>
                    </div>
                    <div className="field-grid">
                      <label>Mức ưu tiên<select disabled={!permissions.create} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}><option value="low">Thấp</option><option value="medium">Vừa</option><option value="high">Cao</option></select></label>
                      <label>Trạng thái<select disabled={!permissions.create} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="planning">Lên kế hoạch</option><option value="active">Đang làm</option><option value="done">Hoàn thành</option></select></label>
                    </div>
                    <label>Mô tả<textarea disabled={!permissions.create} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows="4" /></label>
                    <button className="primary-button" type="submit" disabled={saving || !permissions.create}>{saving ? <Loader2 className="spin" size={18} /> : <CirclePlus size={18} />}{saving ? 'Đang lưu' : 'Thêm công việc'}</button>
                    {message && <p className="message">{message}</p>}
                  </form>

                  <section className="project-list">
                    <div className="list-header"><div><span className="eyebrow">Danh sách</span><h2>Công việc thi công</h2></div></div>
                    {loading ? <div className="empty-state"><Loader2 className="spin" /><span>Đang tải dữ liệu</span></div> : projects.length === 0 ? <div className="empty-state"><FolderKanban /><span>Chưa có công việc nào.</span></div> : (
                      <div className="cards-grid">{projects.map((project) => { const StatusIcon = statusIcons[project.status]; return <article className="project-card" key={project._id}><div className="card-topline"><span className={`status-pill ${project.status}`}><StatusIcon size={15} />{statusLabels[project.status]}</span><span className={`priority ${project.priority}`}>{priorityLabels[project.priority]}</span></div><h3>{project.title}</h3><p>{project.description || 'Chưa có mô tả chi tiết.'}</p><dl><div><dt>Phụ trách</dt><dd>{project.owner}</dd></div><div><dt>Hạng mục</dt><dd>{project.category}</dd></div></dl><div className="card-actions"><select disabled={!permissions.updateStatus} value={project.status} onChange={(event) => updateStatus(project, event.target.value)}><option value="planning">Lên kế hoạch</option><option value="active">Đang làm</option><option value="done">Hoàn thành</option></select>{permissions.delete && <button type="button" onClick={() => deleteProject(project._id)}><Trash2 size={17} /></button>}</div></article>; })}</div>
                    )}
                  </section>
                </section>
              </div>
            </section>
          )}

          {activeNavigationId !== 'overview' && activeNavigationId !== 'jobs' && activeNavigationId !== 'projects' && activeNavigationId !== 'workers' && activeNavigationId !== 'materials' && activeNavigationId !== 'costs' && activeNavigationId !== 'diary' && (
            <section className="placeholder-panel">
              <div className="section-title"><ActivePageIcon size={22} /><h2>{activeNavigation.title}</h2></div>
              <p>{activeNavigation.description}</p>
              <div className="permission-list">
                {(placeholderItems[activeNavigationId] || []).map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
