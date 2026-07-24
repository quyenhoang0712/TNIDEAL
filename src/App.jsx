import { Activity, CheckCircle2, CirclePlus, Clock3, FolderKanban, Loader2, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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

async function request(path, options) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Có lỗi xảy ra');
  }

  return data;
}

function App() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

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
    setLoading(true);
    setMessage('');

    try {
      const query = statusFilter === 'all' ? '' : `?status=${statusFilter}`;
      const data = await request(`/api/projects${query}`);
      setProjects(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await request('/api/projects', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setForm(emptyForm);
      await loadProjects();
      setMessage('Đã thêm ý tưởng mới.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(project, status) {
    try {
      await request(`/api/projects/${project._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await loadProjects();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteProject(projectId) {
    try {
      await request(`/api/projects/${projectId}`, { method: 'DELETE' });
      await loadProjects();
      setMessage('Đã xóa dự án.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleFilterChange(nextFilter) {
    setStatusFilter(nextFilter);
  }

  return (
    <main className="app-shell">
      <section className="hero-band">
        <div className="hero-copy">
          <span className="eyebrow">React + Node.js + MongoDB Atlas</span>
          <h1>TN Ideal</h1>
          <p>Không gian quản lý ý tưởng đồ án, theo dõi tiến độ và lưu dữ liệu trực tiếp lên MongoDB Atlas.</p>
        </div>
        <div className="hero-panel" aria-label="Tổng quan dự án">
          <div>
            <span>Tổng ý tưởng</span>
            <strong>{stats.total}</strong>
          </div>
          <div>
            <span>Đang làm</span>
            <strong>{stats.active}</strong>
          </div>
          <div>
            <span>Hoàn thành</span>
            <strong>{stats.done}</strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <form className="project-form" onSubmit={handleSubmit}>
          <div className="section-title">
            <FolderKanban size={22} />
            <h2>Thêm ý tưởng</h2>
          </div>

          <label>
            Tên dự án
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Ví dụ: Website đặt lịch khám"
              required
              minLength={3}
            />
          </label>

          <div className="field-grid">
            <label>
              Người phụ trách
              <input
                value={form.owner}
                onChange={(event) => setForm({ ...form, owner: event.target.value })}
                placeholder="Tên thành viên"
                required
              />
            </label>
            <label>
              Nhóm chức năng
              <input
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                placeholder="Frontend, API, UI..."
                required
              />
            </label>
          </div>

          <div className="field-grid">
            <label>
              Độ ưu tiên
              <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                <option value="low">Thấp</option>
                <option value="medium">Vừa</option>
                <option value="high">Cao</option>
              </select>
            </label>
            <label>
              Trạng thái
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <option value="planning">Lên kế hoạch</option>
                <option value="active">Đang làm</option>
                <option value="done">Hoàn thành</option>
              </select>
            </label>
          </div>

          <label>
            Mô tả
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Ghi chú mục tiêu, công nghệ hoặc tính năng chính"
              rows="4"
            />
          </label>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? <Loader2 className="spin" size={18} /> : <CirclePlus size={18} />}
            {saving ? 'Đang lưu' : 'Thêm dự án'}
          </button>

          {message && <p className="message">{message}</p>}
        </form>

        <section className="project-list">
          <div className="list-header">
            <div>
              <span className="eyebrow">Dashboard</span>
              <h2>Danh sách ý tưởng</h2>
            </div>
            <div className="segmented-control" aria-label="Lọc trạng thái">
              {Object.entries(statusLabels).map(([value, label]) => (
                <button
                  className={statusFilter === value ? 'active' : ''}
                  key={value}
                  type="button"
                  onClick={() => handleFilterChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <Loader2 className="spin" />
              <span>Đang tải dữ liệu</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <FolderKanban />
              <span>Chưa có ý tưởng nào trong bộ lọc này.</span>
            </div>
          ) : (
            <div className="cards-grid">
              {projects.map((project) => {
                const StatusIcon = statusIcons[project.status];

                return (
                  <article className="project-card" key={project._id}>
                    <div className="card-topline">
                      <span className={`status-pill ${project.status}`}>
                        <StatusIcon size={15} />
                        {statusLabels[project.status]}
                      </span>
                      <span className={`priority ${project.priority}`}>{priorityLabels[project.priority]}</span>
                    </div>

                    <h3>{project.title}</h3>
                    <p>{project.description || 'Chưa có mô tả chi tiết.'}</p>

                    <dl>
                      <div>
                        <dt>Phụ trách</dt>
                        <dd>{project.owner}</dd>
                      </div>
                      <div>
                        <dt>Nhóm</dt>
                        <dd>{project.category}</dd>
                      </div>
                    </dl>

                    <div className="card-actions">
                      <select value={project.status} onChange={(event) => updateStatus(project, event.target.value)}>
                        <option value="planning">Lên kế hoạch</option>
                        <option value="active">Đang làm</option>
                        <option value="done">Hoàn thành</option>
                      </select>
                      <button type="button" onClick={() => deleteProject(project._id)} aria-label={`Xóa ${project.title}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
