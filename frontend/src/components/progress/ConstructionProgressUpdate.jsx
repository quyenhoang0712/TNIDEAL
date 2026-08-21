import { CirclePlus, FolderKanban, Loader2, Trash2, X } from 'lucide-react';

function ProgressContent({
  compact,
  deleteTask,
  form,
  handleFilterChange,
  handleSubmit,
  loading,
  message,
  permissions,
  priorityLabels,
  projects,
  saving,
  setForm,
  statusFilter,
  statusIcons,
  statusLabels,
  updateStatus
}) {
  return <section className="workspace">
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="section-title"><FolderKanban size={22} /><h2>Thêm công việc thi công</h2></div>
      <label>Tên công việc<input disabled={!permissions.create} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Ví dụ: Đổ bê tông móng" required minLength={3} /></label>
      <div className="field-grid">
        <label>Người phụ trách<input disabled={!permissions.create} value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} placeholder="Tên thầu hoặc đội trưởng" required /></label>
        <label>Hạng mục<input disabled={!permissions.create} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Móng, cột, dầm, sàn..." required /></label>
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
      <div className="list-header"><div><span className="eyebrow">{compact ? 'Danh sách' : 'Bảng điều khiển'}</span><h2>Công việc thi công</h2></div>{!compact && <div className="inline-filter" aria-label="Lọc trạng thái">{Object.entries(statusLabels).map(([value, label]) => <button className={statusFilter === value ? 'active' : ''} key={value} type="button" onClick={() => handleFilterChange(value)}>{label}</button>)}</div>}</div>
      {loading ? <div className="empty-state"><Loader2 className="spin" /><span>Đang tải dữ liệu</span></div> : projects.length === 0 ? <div className="empty-state"><FolderKanban /><span>Chưa có công việc nào.</span></div> : <div className="cards-grid">{projects.map((project) => {
        const StatusIcon = statusIcons[project.status];
        return <article className="project-card" key={project._id}><div className="card-topline"><span className={`status-pill ${project.status}`}><StatusIcon size={15} />{statusLabels[project.status]}</span><span className={`priority ${project.priority}`}>{priorityLabels[project.priority]}</span></div><h3>{project.title}</h3><p>{project.description || 'Chưa có mô tả chi tiết.'}</p><dl><div><dt>Phụ trách</dt><dd>{project.owner}</dd></div><div><dt>Hạng mục</dt><dd>{project.category}</dd></div></dl><div className="card-actions"><select disabled={!permissions.updateStatus} value={project.status} onChange={(event) => updateStatus(project, event.target.value)}><option value="planning">Lên kế hoạch</option><option value="active">Đang làm</option><option value="done">Hoàn thành</option></select>{permissions.delete && <button type="button" onClick={() => deleteTask(project._id)} aria-label={`Xóa ${project.title}`}><Trash2 size={17} /></button>}</div></article>;
      })}</div>}
    </section>
  </section>;
}

export default function ConstructionProgressUpdate({ modal = false, onClose, construction, ...props }) {
  if (!modal) return <ProgressContent {...props} />;
  return <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Cập nhật tiến độ công trình"><div className="jobs-modal-card"><div className="jobs-modal-header"><div><span className="eyebrow">{construction?.name || 'Công trình hiện tại'}</span><h2>Cập nhật tiến độ thi công</h2></div><button type="button" onClick={onClose} aria-label="Đóng"><X size={22} /></button></div><ProgressContent compact {...props} /></div></section>;
}
