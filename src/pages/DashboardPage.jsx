import {
  Building2,
  CalendarDays,
  ChevronRight,
  CirclePlus,
  ClipboardList,
  FileText,
  LogOut,
  MapPin,
  Pencil,
  Ruler,
  Search,
  Trash2,
  UserRound,
  UserCheck,
  UsersRound,
  X
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import DiaryPage from './DiaryPage';
import MaterialManagement from './MaterialManagement';
import ProjectCostPage from './ProjectCostPage';
import ConstructionProgressUpdate from '../components/progress/ConstructionProgressUpdate';
import { DEFAULT_MATERIAL_DEFINITIONS, getMaterialData, saveMaterialData } from '../services/materialApi';

async function workspaceRequest(token, options = {}) {
  const response = await fetch('/api/workspace', { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thể đồng bộ dữ liệu MongoDB');
  return data;
}

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
  openNewProjectSetup,
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
  const [materialDefinitions, setMaterialDefinitions] = useState(DEFAULT_MATERIAL_DEFINITIONS);
  const [materialTransactions, setMaterialTransactions] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [materialsReady, setMaterialsReady] = useState(false);
  const [diaries, setDiaries] = useState([]);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const completedJobs = Math.min(7, projects.filter((project) => project.status === 'done').length);
  const overallProgress = projects.length ? Math.round((completedJobs / projects.length) * 100) : 0;
  const constructionStatus = overallProgress === 100 ? 'Hoàn thành' : projects.some((project) => project.status === 'active') ? 'Đang thi công' : 'Chuẩn bị thi công';
  const constructionStatusClass = overallProgress === 100 ? 'done' : projects.some((project) => project.status === 'active') ? 'active' : 'planning';
  const roughCategories = ['Chuẩn bị & mặt bằng', 'Móng', 'Khung BTCT', 'Xây tường', 'Cầu thang', 'Mái', 'Tô/trát'];
  const foundationTasks = ['Đào đất móng', 'Đổ bê tông lót', 'Gia công cốt thép móng', 'Lắp dựng cốp pha', 'Đổ bê tông móng', 'Tháo cốp pha', 'Lấp đất'];
  const [constructionTeams, setConstructionTeams] = useState([
    { id: 1, name: 'Đội thi công 01', leader: 'Nguyễn Văn Hùng', phone: '0901 234 567', members: 8, present: 7, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Móng', task: 'Gia công cốt thép móng', status: 'active' },
    { id: 2, name: 'Đội thi công 02', leader: 'Trần Minh Đức', phone: '0902 345 678', members: 7, present: 7, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Khung BTCT', task: 'Lắp dựng cốp pha cột', status: 'active' },
    { id: 3, name: 'Đội thi công 03', leader: 'Lê Quốc Nam', phone: '0903 456 789', members: 6, present: 5, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Xây tường', task: 'Chuẩn bị vật tư', status: 'waiting' },
    { id: 4, name: 'Đội thi công 04', leader: 'Phạm Anh Tuấn', phone: '0904 567 890', members: 5, present: 4, project: completedProjectSetup?.name || 'Nhà A Tín', category: 'Mái', task: 'Chờ phân công', status: 'paused' }
  ]);
  const filteredTeams = constructionTeams.filter((team) => {
    const query = workerSearch.trim().toLocaleLowerCase('vi');
    const matchesSearch = !query || [team.name, team.leader, team.project, team.category].some((value) => value.toLocaleLowerCase('vi').includes(query));
    return matchesSearch && (workerStatus === 'all' || team.status === workerStatus);
  });
  const [projectFiles, setProjectFiles] = useState([
    { group: 'Bản vẽ', files: ['Bản vẽ kiến trúc.pdf', 'Bản vẽ kết cấu.pdf'] },
    { group: 'Hợp đồng', files: ['Hợp đồng thi công.pdf'] },
    { group: 'Pháp lý / tài liệu khác', files: ['Giấy phép xây dựng.pdf'] }
  ]);
  const initialWorkspace = useRef({ diaries, constructionTeams, projectFiles });

  useEffect(() => {
    if (session.user.role !== 'contractor') return;
    let cancelled = false;
    workspaceRequest(session.token).then(async (data) => {
      if (cancelled) return;
      if (data._id) {
        setDiaries(data.diaries || []);
        setConstructionTeams(data.constructionTeams?.length ? data.constructionTeams : initialWorkspace.current.constructionTeams);
        setProjectFiles(data.projectFiles?.length ? data.projectFiles : initialWorkspace.current.projectFiles);
      } else {
        await workspaceRequest(session.token, { method: 'PUT', body: JSON.stringify(initialWorkspace.current) });
      }
      if (!cancelled) setWorkspaceReady(true);
    }).catch(() => { if (!cancelled) setWorkspaceReady(true); });
    return () => { cancelled = true; };
  }, [session.token, session.user.role]);

  useEffect(() => {
    if (!workspaceReady || session.user.role !== 'contractor') return undefined;
    const timeout = window.setTimeout(() => {
      workspaceRequest(session.token, { method: 'PUT', body: JSON.stringify({ diaries, constructionTeams, projectFiles }) });
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [constructionTeams, diaries, projectFiles, session.token, session.user.role, workspaceReady]);

  useEffect(() => {
    if (session.user.role !== 'contractor') return undefined;
    let cancelled = false;
    getMaterialData(session.token).then((data) => {
      if (cancelled) return;
      setMaterialDefinitions(data.materialDefinitions?.length ? data.materialDefinitions : DEFAULT_MATERIAL_DEFINITIONS);
      setMaterialTransactions(data.materialTransactions || []);
      setPurchaseRequests(data.purchaseRequests || []);
      setMaterialsReady(true);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [session.token, session.user.role]);

  useEffect(() => {
    if (!materialsReady || session.user.role !== 'contractor') return undefined;
    const timeout = window.setTimeout(() => {
      saveMaterialData(session.token, { materialDefinitions, materialTransactions, purchaseRequests }).catch(() => {});
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [materialDefinitions, materialTransactions, materialsReady, purchaseRequests, session.token, session.user.role]);

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

          {activeNavigationId === 'jobs' && <ConstructionProgressUpdate
            deleteTask={deleteProject}
            form={form}
            handleFilterChange={handleFilterChange}
            handleSubmit={handleSubmit}
            loading={loading}
            message={message}
            permissions={permissions}
            priorityLabels={priorityLabels}
            projects={projects}
            saving={saving}
            setForm={setForm}
            statusFilter={statusFilter}
            statusIcons={statusIcons}
            statusLabels={statusLabels}
            updateStatus={updateStatus}
          />}

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
                <div className="saved-project-heading-actions">
                  <span className={`status-pill ${constructionStatusClass}`}>{constructionStatus}</span>
                  <button className="primary-button" type="button" onClick={openNewProjectSetup}>
                    <CirclePlus size={18} />Tạo công trình mới
                  </button>
                </div>
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

          {activeNavigationId === 'materials' && <MaterialManagement
            project={completedProjectSetup}
            materialDefinitions={materialDefinitions}
            materialTransactions={materialTransactions}
            purchaseRequests={purchaseRequests}
            setMaterialTransactions={setMaterialTransactions}
            setPurchaseRequests={setPurchaseRequests}
          />}

          {activeNavigationId === 'costs' && <ProjectCostPage
            project={completedProjectSetup}
            session={session}
            materialDefinitions={materialDefinitions}
            materialTransactions={materialTransactions}
          />}

          {activeNavigationId === 'diary' && <DiaryPage project={completedProjectSetup} diaries={diaries} setDiaries={setDiaries} />}

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

          {showJobs && <ConstructionProgressUpdate
            modal
            construction={completedProjectSetup}
            onClose={() => setShowJobs(false)}
            deleteTask={deleteProject}
            form={form}
            handleFilterChange={handleFilterChange}
            handleSubmit={handleSubmit}
            loading={loading}
            message={message}
            permissions={permissions}
            priorityLabels={priorityLabels}
            projects={projects}
            saving={saving}
            setForm={setForm}
            statusFilter={statusFilter}
            statusIcons={statusIcons}
            statusLabels={statusLabels}
            updateStatus={updateStatus}
          />}

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
