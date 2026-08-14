import {
  Activity,
  BarChart3,
  Building2,
  Camera,
  CheckCircle2,
  CirclePlus,
  Clock3,
  DollarSign,
  FolderKanban,
  HardHat,
  LogOut,
  Loader2,
  Package,
  Settings,
  ShieldCheck,
  Trash2,
  UserCog,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ProjectSetupModal from './components/project-setup/ProjectSetupModal';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import UserPage from './pages/UserPage';
import { createConstruction, getConstructions } from './services/constructionApi';
import { createProgressTask, deleteProgressTask as removeProgressTask, getProgressTasks, updateProgressStatus } from './services/progressApi';

const emptyForm = {
  title: '',
  owner: '',
  category: '',
  priority: 'medium',
  status: 'planning',
  description: ''
};

const statusLabels = {
  all: 'Tất cả',
  planning: 'Lên kế hoạch',
  active: 'Đang làm',
  done: 'Hoàn thành'
};

const priorityLabels = {
  low: 'Thấp',
  medium: 'Vừa',
  high: 'Cao'
};

const statusIcons = {
  planning: Clock3,
  active: Activity,
  done: CheckCircle2
};

const roles = {
  admin: {
    label: 'Admin',
    description: 'Quản lý user, phân quyền và xử lý lỗi hệ thống',
    icon: ShieldCheck,
    permissions: {
      create: false,
      updateStatus: true,
      delete: true
    }
  },
  contractor: {
    label: 'Thầu',
    description: 'Quản lý công trình và công việc được giao',
    icon: HardHat,
    permissions: {
      create: true,
      updateStatus: true,
      delete: false
    }
  }
};

const emptyProjectSetupForm = {
  name: '',
  investorName: '',
  investorPhone: '',
  type: 'house',
  upperFloors: '',
  hasBasement: false,
  startDate: '',
  duration: '',
  location: '',
  fullAddress: '',
  provinceCity: '',
  wardCommune: '',
  accessType: 'frontage',
  alleyWidth: '',
  truckAccess: 'yes',
  landLength: '',
  landWidth: '',
  roughUnitPrice: '3.500.000'
};

const projectTypeLabels = {
  house: 'Nhà phố',
  apartment: 'Căn hộ cao tầng',
  villa: 'Biệt thự',
  office: 'Văn phòng',
  factory: 'Nhà xưởng',
  repair: 'Sửa chữa cải tạo',
  shop: 'Cửa hàng',
  restaurant: 'Nhà hàng',
  hotel: 'Khách sạn',
  warehouse: 'Kho bãi',
  school: 'Trường học',
  clinic: 'Phòng khám',
  townhouse: 'Nhà liền kề',
  interior: 'Thi công nội thất',
  landscape: 'Sân vườn cảnh quan',
  infrastructure: 'Hạ tầng',
  other: 'Khác'
};

const navigationItems = [
  {
    id: 'overview',
    label: 'Tổng quan',
    icon: BarChart3,
    roles: ['admin'],
    title: 'Tổng quan',
    description: 'Xem nhanh trạng thái hệ thống và các tác vụ cần chú ý.'
  },
  {
    id: 'projects',
    label: 'Dự án',
    icon: Building2,
    roles: ['contractor'],
    title: 'Dự án',
    description: 'Quản lý hồ sơ dự án phần thô, thông tin chủ đầu tư, địa điểm và quy mô công trình.'
  },
  {
    id: 'users',
    label: 'Tài khoản thầu',
    icon: UserCog,
    roles: ['admin'],
    title: 'Tài khoản thầu',
    description: 'Quản lý những nhà thầu được phép sử dụng hệ thống.'
  },
  {
    id: 'admin-projects',
    label: 'Công trình',
    icon: Building2,
    roles: ['admin'],
    title: 'Quản lý công trình',
    description: 'Theo dõi toàn bộ công trình và nhà thầu phụ trách.'
  },
  {
    id: 'activity-log',
    label: 'Nhật ký hoạt động',
    icon: Clock3,
    roles: ['admin'],
    title: 'Nhật ký hoạt động',
    description: 'Theo dõi tài khoản nào đã thực hiện thay đổi trên hệ thống.'
  },
  {
    id: 'workers',
    label: 'Nhân công',
    icon: UsersRound,
    roles: ['contractor'],
    title: 'Nhân công',
    description: 'Quản lý đội thi công, phân công công việc, số công và chấm công.'
  },
  {
    id: 'materials',
    label: 'Vật tư',
    icon: Package,
    roles: ['contractor'],
    title: 'Quản lý vật tư',
    description: 'Theo dõi vật tư nhập, sử dụng và tồn kho theo từng công trình.'
  },
  {
    id: 'costs',
    label: 'Chi phí',
    icon: DollarSign,
    roles: ['contractor'],
    title: 'Chi phí',
    description: 'Theo dõi và tổng hợp chi phí thực tế theo từng công trình.'
  },
  {
    id: 'diary',
    label: 'Nhật ký công trình',
    icon: Camera,
    roles: ['contractor'],
    title: 'Nhật ký công trình',
    description: 'Ghi nhận diễn biến thi công, nhân công và hình ảnh hiện trường theo từng ngày.'
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    icon: Settings,
    roles: ['admin'],
    title: 'Cài đặt hệ thống',
    description: 'Quản lý thông tin Admin và cấu hình chung.'
  }
];

function formatCurrencyInput(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function parseCurrencyInput(value) {
  return Number(String(value).replace(/\D/g, ''));
}

function isValidVietnamDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function formatVietnamDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function parseLocationFromText(query, current = {}) {
  const cleanQuery = query.replace(/\s+/g, ' ').trim();
  const wardMatch = cleanQuery.match(/(?:phường|xã|thị trấn|p\.|x\.)\s*[^,]+/i);
  const provinceMatch = cleanQuery.match(/(?:tp\.?|thành phố|tỉnh)\s*[^,]+/i);
  const hasHoChiMinh = /hồ chí minh|ho chi minh|hcm|sài gòn|sai gon/i.test(cleanQuery);

  return {
    fullAddress: cleanQuery,
    provinceCity: provinceMatch?.[0] || (hasHoChiMinh ? 'TP. Hồ Chí Minh' : current.provinceCity || 'TP. Hồ Chí Minh'),
    wardCommune: wardMatch?.[0] || current.wardCommune || ''
  };
}

async function resolveLocationFields(query, current = {}) {
  const fallback = parseLocationFromText(query, current);

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&accept-language=vi&q=${encodeURIComponent(
        `${query}, Việt Nam`
      )}`
    );
    const [result] = await response.json();
    const address = result?.address || {};

    return {
      fullAddress: result?.display_name || fallback.fullAddress,
      provinceCity: address.city || address.state || address.province || fallback.provinceCity,
      wardCommune:
        address.suburb ||
        address.quarter ||
        address.neighbourhood ||
        address.village ||
        address.town ||
        address.municipality ||
        fallback.wardCommune
    };
  } catch {
    return fallback;
  }
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

const monthNames = [
  'Tháng 1',
  'Tháng 2',
  'Tháng 3',
  'Tháng 4',
  'Tháng 5',
  'Tháng 6',
  'Tháng 7',
  'Tháng 8',
  'Tháng 9',
  'Tháng 10',
  'Tháng 11',
  'Tháng 12'
];

function getProjectSetupStorageKey(userId) {
  return `tnideal_project_setup_${userId}`;
}

function readSavedProjectSetup(userId) {
  if (!userId) return null;

  try {
    return JSON.parse(localStorage.getItem(getProjectSetupStorageKey(userId))) || null;
  } catch {
    localStorage.removeItem(getProjectSetupStorageKey(userId));
    return null;
  }
}

function App() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem('tnideal_session');
    if (!savedSession) return null;

    try {
      const parsedSession = JSON.parse(savedSession);
      if (roles[parsedSession?.user?.role]) return parsedSession;
      localStorage.removeItem('tnideal_session');
      return null;
    } catch {
      localStorage.removeItem('tnideal_session');
      return null;
    }
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const [activePage, setActivePage] = useState('overview');
  const [showProjectSetup, setShowProjectSetup] = useState(false);
  const [completedProjectSetup, setCompletedProjectSetup] = useState(null);
  const [projectSetupStep, setProjectSetupStep] = useState('details');
  const [projectSetupForm, setProjectSetupForm] = useState(emptyProjectSetupForm);
  const [projectSetupError, setProjectSetupError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [mapQuery, setMapQuery] = useState('Việt Nam');
  const [mapPinPosition, setMapPinPosition] = useState({ x: 50, y: 50 });
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);
  const [constructionLoading, setConstructionLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const currentRole = roles[session?.user.role || 'contractor'];
  const permissions = currentRole.permissions;
  const visibleNavigation = session ? navigationItems.filter((item) => item.roles.includes(session.user.role)) : [];
  const activeNavigation = visibleNavigation.find((item) => item.id === activePage) || visibleNavigation[0];
  const ActivePageIcon = activeNavigation?.icon || BarChart3;
  const activeNavigationId = activeNavigation?.id || 'overview';
  const isCheckingFirstProject = session?.user.role === 'contractor' && activeNavigationId === 'projects' && (loading || constructionLoading);
  const shouldShowFirstProjectPrompt =
    session?.user.role === 'contractor' && activeNavigationId === 'projects' && !loading && !constructionLoading && !completedProjectSetup;
  const calendarDays = getCalendarDays(calendarMonth);
  const selectedStartDate = projectSetupForm.startDate;
  const cleanMapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const landLength = Number(projectSetupForm.landLength);
  const landWidth = Number(projectSetupForm.landWidth);
  const landScale =
    landLength && landWidth ? Math.min(260 / landWidth, 230 / landLength) : Math.min(260 / 12, 230 / 20);
  const landPreviewWidth = landWidth ? Math.max(58, landWidth * landScale) : 138;
  const landPreviewHeight = landLength ? Math.max(90, landLength * landScale) : 230;
  const landArea = landLength && landWidth ? landLength * landWidth : 0;
  const roughUnitPrice = parseCurrencyInput(projectSetupForm.roughUnitPrice);
  const projectUpperFloors = Number(projectSetupForm.upperFloors || 0);
  const projectTotalFloors = 1 + projectUpperFloors + (projectSetupForm.hasBasement ? 1 : 0);
  const estimatedFloorArea = landArea * projectTotalFloors;
  const estimatedRoughCost = estimatedFloorArea * roughUnitPrice;

  const stats = useMemo(() => {
    return projects.reduce(
      (summary, project) => {
        summary.total += 1;
        summary[project.status] += 1;
        return summary;
      },
      { total: 0, planning: 0, active: 0, done: 0 }
    );
  }, [projects]);

  const loadProjects = useCallback(async () => {
    if (!session?.token) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const data = await getProgressTasks(session.token, { status: statusFilter, constructionId: completedProjectSetup?._id });
      setProjects(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [completedProjectSetup?._id, session?.token, statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    if (session?.user?.role !== 'contractor' || !session.token) { setConstructionLoading(false); return; }
    let cancelled = false;
    setConstructionLoading(true);
    const legacySetup = readSavedProjectSetup(session.user.id);
    const migrate = legacySetup && !legacySetup.id
      ? createConstruction(session.token, legacySetup)
      : Promise.resolve(null);
    migrate.then(() => getConstructions(session.token)).then((constructions) => {
      if (cancelled) return;
      const current = constructions[0] || null;
      setCompletedProjectSetup(current);
      if (current) {
        setForm((value) => ({ ...value, title: current.name, category: projectTypeLabels[current.type] || value.category }));
        setActivePage('projects');
      }
      localStorage.removeItem(getProjectSetupStorageKey(session.user.id));
    }).catch((error) => { if (!cancelled) setMessage(error.message); }).finally(() => { if (!cancelled) setConstructionLoading(false); });
    return () => { cancelled = true; };
  }, [session?.token, session?.user?.id, session?.user?.role]);

  useEffect(() => {
    if (session && activeNavigationId !== activePage) {
      setActivePage(activeNavigationId);
    }
  }, [activeNavigationId, activePage, session]);

  function handleAuthenticated(data) {
    localStorage.setItem('tnideal_session', JSON.stringify(data));
    setSession(data);
    setMessage('');
  }

  function logout() {
    localStorage.removeItem('tnideal_session');
    setSession(null);
    setProjects([]);
    setActivePage('overview');
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!permissions.create) {
      setMessage('Bạn không có quyền tạo công việc mới.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await createProgressTask(session.token, { ...form, constructionId: completedProjectSetup?._id });
      setForm(emptyForm);
      await loadProjects();
      setMessage('Đã thêm công việc mới.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(project, status) {
    if (!permissions.updateStatus) {
      setMessage(`${currentRole.label} không thể cập nhật trạng thái.`);
      return;
    }

    try {
      await updateProgressStatus(session.token, project._id, status);
      await loadProjects();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteProject(projectId) {
    if (!permissions.delete) {
      setMessage(`${currentRole.label} không thể xóa công trình.`);
      return;
    }

    try {
      await removeProgressTask(session.token, projectId);
      await loadProjects();
      setMessage('Đã xóa công việc.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleFilterChange(nextFilter) {
    setStatusFilter(nextFilter);
  }

  function handleProjectSetupSubmit(event) {
    event.preventDefault();
    const duration = Number(projectSetupForm.duration);
    const upperFloors = Number(projectSetupForm.upperFloors || 0);

    if (projectSetupForm.name.trim().length < 3) {
      setProjectSetupError('Tên dự án phải có ít nhất 3 ký tự.');
      return;
    }

    if (projectSetupForm.investorName.trim().length < 2) {
      setProjectSetupError('Tên chủ đầu tư phải có ít nhất 2 ký tự.');
      return;
    }

    if (!/^(0|\+84)[0-9]{8,10}$/.test(projectSetupForm.investorPhone.replace(/[^\d+]/g, ''))) {
      setProjectSetupError('Số điện thoại chủ đầu tư chưa đúng định dạng.');
      return;
    }

    if (upperFloors < 0) {
      setProjectSetupError('Số lầu không được âm.');
      return;
    }

    if (!isValidVietnamDate(projectSetupForm.startDate)) {
      setProjectSetupError('Ngày khởi công phải đúng định dạng dd/mm/yyyy.');
      return;
    }

    if (!duration || duration < 1) {
      setProjectSetupError('Thời gian thi công phải lớn hơn 0.');
      return;
    }

    setProjectSetupError('');
    setProjectSetupStep('location');
  }

  function handleProjectLocationSubmit(event) {
    event.preventDefault();

    if (projectSetupForm.location.trim().length < 5) {
      setProjectSetupError('Vui lòng nhập hoặc chọn địa điểm công trình.');
      return;
    }

    if (projectSetupForm.fullAddress.trim().length < 5) {
      setProjectSetupError('Vui lòng nhập địa chỉ đầy đủ của công trình.');
      return;
    }

    if (projectSetupForm.provinceCity.trim().length < 2) {
      setProjectSetupError('Vui lòng nhập tỉnh hoặc thành phố.');
      return;
    }

    if (projectSetupForm.wardCommune.trim().length < 2) {
      setProjectSetupError('Vui lòng nhập phường hoặc xã.');
      return;
    }

    setProjectSetupError('');
    setProjectSetupStep('access');
  }

  function handleProjectAccessSubmit(event) {
    event.preventDefault();

    if (
      projectSetupForm.accessType === 'alley' &&
      (!Number(projectSetupForm.alleyWidth) || Number(projectSetupForm.alleyWidth) <= 0)
    ) {
      setProjectSetupError('Vui lòng nhập chiều rộng hẻm.');
      return;
    }

    setProjectSetupError('');
    setProjectSetupStep('land');
  }

  function handleProjectLandSubmit(event) {
    event.preventDefault();
    const length = Number(projectSetupForm.landLength);
    const width = Number(projectSetupForm.landWidth);

    if (!length || length < 1) {
      setProjectSetupError('Chiều dài miếng đất phải lớn hơn 0.');
      return;
    }

    if (!width || width < 1) {
      setProjectSetupError('Chiều rộng miếng đất phải lớn hơn 0.');
      return;
    }

    setProjectSetupError('');
    setProjectSetupStep('cost');
  }

  async function handleProjectCostSubmit(event) {
    event.preventDefault();
    const duration = Number(projectSetupForm.duration);
    const upperFloors = Number(projectSetupForm.upperFloors || 0);
    const totalFloors = 1 + upperFloors + (projectSetupForm.hasBasement ? 1 : 0);
    const length = Number(projectSetupForm.landLength);
    const width = Number(projectSetupForm.landWidth);
    const unitPrice = parseCurrencyInput(projectSetupForm.roughUnitPrice);
    const floorArea = length * width * totalFloors;
    const roughCost = floorArea * unitPrice;

    if (!unitPrice || unitPrice < 1) {
      setProjectSetupError('Vui lòng nhập đơn giá phần thô hợp lệ.');
      return;
    }

    const preparedJob = {
      ...emptyForm,
      title: projectSetupForm.name.trim(),
      category: projectTypeLabels[projectSetupForm.type],
      description: [
        `Loại dự án: ${projectTypeLabels[projectSetupForm.type]}`,
        `Chủ đầu tư: ${projectSetupForm.investorName.trim()}`,
        `SĐT: ${projectSetupForm.investorPhone.trim()}`,
        `Gói thầu: Thi công phần thô`,
        `Địa điểm: ${projectSetupForm.location.trim()}`,
        `Địa chỉ đầy đủ: ${projectSetupForm.fullAddress.trim()}`,
        `Tỉnh/thành: ${projectSetupForm.provinceCity.trim()}`,
        `Phường/xã: ${projectSetupForm.wardCommune.trim()}`,
        `Đường vào: ${
          projectSetupForm.accessType === 'frontage'
            ? 'Mặt tiền đường'
            : `Hẻm rộng ${projectSetupForm.alleyWidth}m`
        }, ${projectSetupForm.truckAccess === 'yes' ? 'xe tải vào được' : 'xe tải không vào được'}`,
        `Vị trí ghim bản đồ: ${Math.round(mapPinPosition.x)}%, ${Math.round(mapPinPosition.y)}%`,
        `Kích thước đất: ${length}m x ${width}m`,
        `Diện tích đất: ${(length * width).toLocaleString('vi-VN')} m2`,
        `Cấu trúc tầng: Trệt, ${upperFloors} lầu, ${
          projectSetupForm.hasBasement ? 'có tầng hầm' : 'không tầng hầm'
        } (${totalFloors} phần tầng)`,
        `Ngày khởi công dự kiến: ${projectSetupForm.startDate}`,
        `Thời gian thi công: ${duration} tháng`,
        `Diện tích sàn tạm tính: ${floorArea.toLocaleString('vi-VN')} m2`,
        `Đơn giá phần thô: ${unitPrice.toLocaleString('vi-VN')} VND/m2`,
        `Chi phí phần thô tạm tính: ${roughCost.toLocaleString('vi-VN')} VND`
      ].join('. ')
    };
    const savedSetup = {
      ...projectSetupForm,
      jobDraft: preparedJob,
      completedAt: new Date().toISOString()
    };

    try {
      const savedConstruction = await createConstruction(session.token, projectSetupForm);
      savedSetup.id = savedConstruction._id;
      savedSetup.code = savedConstruction.code;
    } catch (error) {
      setProjectSetupError(error.message);
      return;
    }

    setCompletedProjectSetup(savedSetup);
    setForm(preparedJob);
    setStatusFilter('all');
    setMessage('Đã tạo dự án thành công.');
    setProjectSetupError('');
    setShowProjectSetup(false);
    setProjectSetupStep('details');
    setActivePage('projects');
  }

  async function searchProjectLocation() {
    const query = projectSetupForm.location.trim();

    if (query.length < 3) {
      setProjectSetupError('Vui lòng nhập ít nhất 3 ký tự để tìm địa điểm.');
      return;
    }

    const locationFields = await resolveLocationFields(query, projectSetupForm);

    setProjectSetupError('');
    setProjectSetupForm({
      ...projectSetupForm,
      ...locationFields
    });
    setMapQuery(query);
  }

  function moveMapPin(event) {
    const mapBox = event.currentTarget.parentElement;
    if (!mapBox) {
      return;
    }

    const rect = mapBox.getBoundingClientRect();
    const x = Math.min(95, Math.max(5, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(95, Math.max(5, ((event.clientY - rect.top) / rect.height) * 100));
    setMapPinPosition({ x, y });
  }

  function handleMapPinPointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    moveMapPin(event);
  }

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setProjectSetupError('Trình duyệt hiện không hỗ trợ lấy vị trí hiện tại.');
      return;
    }

    setProjectSetupError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setProjectSetupForm((current) => ({
          ...current,
          location: coords,
          fullAddress: current.fullAddress || coords
        }));
        setMapQuery(coords);
        setMapPinPosition({ x: 50, y: 50 });
      },
      () => {
        setProjectSetupError('Không lấy được vị trí hiện tại. Vui lòng cho phép quyền vị trí trong trình duyệt.');
      }
    );
  }

  function openNewProjectSetup() {
    setProjectSetupForm(emptyProjectSetupForm);
    setProjectSetupError('');
    setProjectSetupStep('details');
    setShowDatePicker(false);
    setMapQuery('Việt Nam');
    setMapPinPosition({ x: 50, y: 50 });
    setShowProjectSetup(true);
  }

  if (!session) return <AuthPage onAuthenticated={handleAuthenticated} />;

  if (shouldShowFirstProjectPrompt || showProjectSetup) {
    return (
      <main className="first-project-shell">
        <button className="first-project-logout" type="button" onClick={logout}>
          <LogOut size={18} />
          Đăng xuất
        </button>

        <section className="first-project-panel popup">
          <div className="first-project-icon">
            <Building2 size={30} />
          </div>
          <h2>Chưa có dự án nào</h2>
          <p>Tạo công trình phần thô đầu tiên để quản lý móng, kết cấu, vật tư và tiến độ thi công.</p>
          <button
            className="primary-button"
            type="button"
            onClick={openNewProjectSetup}
          >
            <CirclePlus size={18} />
            Tạo công trình phần thô
          </button>
        </section>

        {showProjectSetup && <ProjectSetupModal
          step={projectSetupStep}
          setStep={setProjectSetupStep}
          form={projectSetupForm}
          setForm={setProjectSetupForm}
          error={projectSetupError}
          setError={setProjectSetupError}
          close={() => setShowProjectSetup(false)}
          submitHandlers={{ details: handleProjectSetupSubmit, location: handleProjectLocationSubmit, access: handleProjectAccessSubmit, land: handleProjectLandSubmit, cost: handleProjectCostSubmit }}
          projectTypeLabels={projectTypeLabels}
          showDatePicker={showDatePicker}
          setShowDatePicker={setShowDatePicker}
          calendarMonth={calendarMonth}
          setCalendarMonth={setCalendarMonth}
          calendarDays={calendarDays}
          selectedStartDate={selectedStartDate}
          monthNames={monthNames}
          formatVietnamDate={formatVietnamDate}
          cleanMapUrl={cleanMapUrl}
          mapPinPosition={mapPinPosition}
          searchProjectLocation={searchProjectLocation}
          useCurrentLocation={useCurrentLocation}
          handleMapPinPointerDown={handleMapPinPointerDown}
          moveMapPin={moveMapPin}
          landLength={landLength}
          landWidth={landWidth}
          landPreviewWidth={landPreviewWidth}
          landPreviewHeight={landPreviewHeight}
          landArea={landArea}
          totalFloors={projectTotalFloors}
          estimatedFloorArea={estimatedFloorArea}
          estimatedRoughCost={estimatedRoughCost}
          formatCurrencyInput={formatCurrencyInput}
        />}
      </main>
    );
  }

  if (isCheckingFirstProject) {
    return (
      <main className="first-project-shell">
        <section className="first-project-panel popup checking">
          <Loader2 className="spin" size={30} />
          <h2>Đang kiểm tra dự án</h2>
        </section>
      </main>
    );
  }

  const RolePage = session.user.role === 'admin' ? AdminPage : UserPage;

  return (
    <RolePage
      activeNavigation={activeNavigation}
      activeNavigationId={activeNavigationId}
      currentRole={currentRole}
      completedProjectSetup={completedProjectSetup}
      deleteProject={deleteProject}
      form={form}
      handleFilterChange={handleFilterChange}
      handleSubmit={handleSubmit}
      loading={loading}
      logout={logout}
      message={message}
      openNewProjectSetup={openNewProjectSetup}
      permissions={permissions}
      priorityLabels={priorityLabels}
      projects={projects}
      saving={saving}
      session={session}
      setActivePage={setActivePage}
      setForm={setForm}
      stats={stats}
      statusFilter={statusFilter}
      statusIcons={statusIcons}
      statusLabels={statusLabels}
      updateStatus={updateStatus}
      visibleNavigation={visibleNavigation}
    />
  );
}

export default App;
