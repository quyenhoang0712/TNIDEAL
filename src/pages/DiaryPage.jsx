import { Camera, ChevronLeft, ChevronRight, CirclePlus, Eye, MapPin, Pencil, Printer, Search, Trash2, Upload, UsersRound, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

const categories = ['Chuẩn bị & mặt bằng', 'Móng', 'Khung BTCT', 'Xây tường', 'Cầu thang', 'Mái', 'Tô/trát'];
const tasksByCategory = {
  'Chuẩn bị & mặt bằng': ['Dọn dẹp mặt bằng', 'Định vị tim trục', 'Vận chuyển vật tư'],
  Móng: ['Đào đất móng', 'Bê tông lót', 'Gia công cốt thép móng', 'Lắp dựng cốp pha', 'Đổ bê tông móng', 'Lấp đất'],
  'Khung BTCT': ['Gia công cốt thép', 'Lắp dựng cốp pha', 'Đổ bê tông cột/dầm/sàn'],
  'Xây tường': ['Xây tường bao', 'Xây tường ngăn'],
  'Cầu thang': ['Gia công thép cầu thang', 'Đổ bê tông cầu thang'],
  Mái: ['Gia công kết cấu mái', 'Đổ bê tông mái'],
  'Tô/trát': ['Tô trong', 'Tô ngoài']
};
const teams = ['Đội thi công 01', 'Đội thi công 02', 'Đội thi công 03', 'Đội thi công 04'];
const emptyForm = { date: '2026-08-18', category: 'Móng', taskName: 'Gia công cốt thép móng', team: 'Đội thi công 01', workerCount: 8, startTime: '08:00', endTime: '16:30', description: '', issue: '', note: '', images: [] };

function displayDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export default function DiaryPage({ project }) {
  const cameraRef = useRef(null);
  const uploadRef = useRef(null);
  const [view, setView] = useState('timeline');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [diaries, setDiaries] = useState([{ id: 1, projectId: 'current-project', ...emptyForm, description: 'Gia công và lắp dựng cốt thép móng, hoàn thành khoảng 70% khối lượng.', issue: 'Chiều có mưa nên dừng thi công sớm.', images: [], createdAt: '2026-08-18T16:35:00' }, { id: 2, projectId: 'current-project', ...emptyForm, date: '2026-08-17', taskName: 'Bê tông lót', workerCount: 7, description: 'Hoàn thành bê tông lót khu vực móng.', issue: '', images: [], createdAt: '2026-08-17T17:00:00' }]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [reportDate, setReportDate] = useState(null);

  const filtered = useMemo(() => diaries.filter((diary) => {
    const keyword = search.trim().toLocaleLowerCase('vi');
    return (!dateFilter || diary.date === dateFilter) && (categoryFilter === 'all' || diary.category === categoryFilter) && (!keyword || [diary.taskName, diary.description, diary.issue, diary.note].some((value) => value.toLocaleLowerCase('vi').includes(keyword)));
  }).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)), [diaries, search, dateFilter, categoryFilter]);
  const grouped = filtered.reduce((result, diary) => ({ ...result, [diary.date]: [...(result[diary.date] || []), diary] }), {});
  const activeCategories = new Set(diaries.map((diary) => diary.category)).size;

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, images: [] });
    setShowForm(true);
  }

  function openEdit(diary) {
    setEditingId(diary.id);
    setForm({ ...diary, images: [...diary.images] });
    setShowForm(true);
  }

  function addImages(files, source) {
    const accepted = Array.from(files).filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type)).slice(0, 10 - form.images.length);
    const capturedAt = new Date().toISOString();
    const append = (position = {}) => setForm((current) => ({ ...current, images: [...current.images, ...accepted.map((file) => ({ id: `${Date.now()}-${file.name}`, url: URL.createObjectURL(file), name: file.name, type: 'PROGRESS', capturedAt, source, latitude: position.latitude, longitude: position.longitude, note: '' }))] }));
    if (source === 'camera' && navigator.geolocation) navigator.geolocation.getCurrentPosition(({ coords }) => append({ latitude: coords.latitude, longitude: coords.longitude }), () => append());
    else append();
  }

  function saveDiary(event) {
    event.preventDefault();
    const payload = { ...form, id: editingId || Date.now(), projectId: 'current-project', createdAt: editingId ? form.createdAt : new Date().toISOString() };
    setDiaries((current) => editingId ? current.map((item) => item.id === editingId ? payload : item) : [...current, payload]);
    setShowForm(false);
  }

  function deleteDiary(diary) {
    if (!window.confirm(`Bạn có chắc muốn xóa nhật ký ngày ${displayDate(diary.date)} không?`)) return;
    setDiaries((current) => current.filter((item) => item.id !== diary.id));
    setSelectedDiary(null);
  }

  return <section className="diary-page">
    <div className="diary-toolbar"><select aria-label="Chọn dự án"><option>{project?.name || 'Chọn dự án'}</option></select><input aria-label="Chọn ngày" type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /><select aria-label="Hạng mục" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">Tất cả hạng mục</option>{categories.map((category) => <option key={category}>{category}</option>)}</select><label><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm nhật ký..." /></label><button className="primary-button" type="button" onClick={openCreate}><CirclePlus size={18} />Ghi nhật ký</button></div>
    <div className="diary-stats"><article><strong>{new Set(diaries.filter((item) => item.date.slice(0, 7) === '2026-08').map((item) => item.date)).size}</strong><span>Nhật ký tháng này</span></article><article><strong>{activeCategories}</strong><span>Hạng mục đang thi công</span></article><article><strong>{diaries.reduce((sum, diary) => sum + diary.images.length, 0)}</strong><span>Ảnh hiện trường</span></article></div>
    <div className="material-tabs"><button className={view === 'timeline' ? 'active' : ''} type="button" onClick={() => setView('timeline')}>Nhật ký thi công</button><button className={view === 'gallery' ? 'active' : ''} type="button" onClick={() => setView('gallery')}>Báo cáo hình ảnh</button></div>

    {view === 'timeline' && <div className="diary-timeline">{Object.entries(grouped).map(([date, items]) => <section key={date}><div className="timeline-date"><strong>{displayDate(date)}</strong><button type="button" onClick={() => setReportDate(date)}>Báo cáo ngày</button></div>{items.map((diary) => <article className="diary-card" key={diary.id}><div className="diary-card-top"><div><span className="eyebrow">{diary.category}</span><h3>{diary.taskName}</h3></div><span>{diary.startTime} – {diary.endTime}</span></div><div className="diary-team"><UsersRound size={17} />{diary.team} · <strong>{diary.workerCount} nhân công</strong></div><p>{diary.description}</p>{diary.issue && <div className="diary-issue"><strong>Vấn đề / phát sinh</strong><span>{diary.issue}</span></div>}{diary.images.length > 0 && <div className="diary-thumbs">{diary.images.slice(0, 4).map((imageItem, index) => <button type="button" key={imageItem.id} onClick={() => setLightbox({ images: diary.images, index, diary })}><img loading="lazy" src={imageItem.url} alt={imageItem.name} />{index === 3 && diary.images.length > 4 && <span>+{diary.images.length - 4}</span>}</button>)}</div>}<div className="diary-actions"><button type="button" onClick={() => setSelectedDiary(diary)}><Eye size={16} />Xem chi tiết</button><button type="button" onClick={() => openEdit(diary)}><Pencil size={16} />Chỉnh sửa</button></div></article>)}</section>)}{filtered.length === 0 && <div className="empty-state"><Camera /><span>Chưa có nhật ký thi công cho công trình này.</span><button className="primary-button" type="button" onClick={openCreate}>Ghi nhật ký đầu tiên</button></div>}</div>}

    {view === 'gallery' && <div className="diary-gallery">{Object.entries(grouped).map(([date, items]) => <section key={date}><div className="timeline-date"><strong>{displayDate(date)}</strong><button type="button" onClick={() => setReportDate(date)}>Mở báo cáo hiện trường</button></div>{items.map((diary) => <article key={diary.id}><span className="eyebrow">{diary.category}</span><h3>{diary.taskName}</h3>{diary.images.length ? <div className="gallery-grid">{diary.images.map((imageItem, index) => <button type="button" key={imageItem.id} onClick={() => setLightbox({ images: diary.images, index, diary })}><img loading="lazy" src={imageItem.url} alt={imageItem.name} /><span>{new Date(imageItem.capturedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span></button>)}</div> : <p>Chưa có hình ảnh hiện trường.</p>}<small>{diary.team} · {diary.workerCount} nhân công</small></article>)}</section>)}</div>}

    {showForm && <section className="jobs-modal" role="dialog" aria-modal="true"><form className="jobs-modal-card diary-form-modal" onSubmit={saveDiary}><div className="jobs-modal-header"><div><span className="eyebrow">{editingId ? 'Chỉnh sửa' : 'Nhật ký mới'}</span><h2>{editingId ? 'Chỉnh sửa nhật ký' : 'Ghi nhật ký công trình'}</h2></div><button type="button" onClick={() => setShowForm(false)}><X /></button></div><div className="diary-form"><label>Dự án *<select><option>{project?.name}</option></select></label><label>Ngày *<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><div className="field-grid"><label>Hạng mục *<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value, taskName: tasksByCategory[event.target.value][0] })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Công việc *<select value={form.taskName} onChange={(event) => setForm({ ...form, taskName: event.target.value })}>{tasksByCategory[form.category].map((task) => <option key={task}>{task}</option>)}</select></label></div><div className="field-grid"><label>Đội thi công<select value={form.team} onChange={(event) => setForm({ ...form, team: event.target.value })}>{teams.map((team) => <option key={team}>{team}</option>)}</select></label><label>Số nhân công thực tế<input min="0" type="number" value={form.workerCount} onChange={(event) => setForm({ ...form, workerCount: Number(event.target.value) })} /></label></div><div className="field-grid"><label>Bắt đầu<input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} /></label><label>Kết thúc<input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} /></label></div><label>Nội dung thi công *<textarea required rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Ví dụ: Gia công và lắp dựng cốt thép móng trục A-B, hoàn thành khoảng 70% khối lượng." /></label><label>Vấn đề / phát sinh<textarea rows="3" value={form.issue} onChange={(event) => setForm({ ...form, issue: event.target.value })} /></label><label>Ghi chú<textarea rows="2" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} /></label><div className="diary-image-field"><strong>Hình ảnh hiện trường ({form.images.length}/10)</strong><div><button type="button" onClick={() => cameraRef.current?.click()}><Camera size={20} />Chụp ảnh</button><button type="button" onClick={() => uploadRef.current?.click()}><Upload size={20} />Tải ảnh lên</button></div><input hidden ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={(event) => addImages(event.target.files, 'camera')} /><input hidden multiple ref={uploadRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => addImages(event.target.files, 'upload')} />{form.images.length > 0 && <div className="image-preview-grid">{form.images.map((imageItem) => <div key={imageItem.id}><img src={imageItem.url} alt={imageItem.name} /><select value={imageItem.type} onChange={(event) => setForm({ ...form, images: form.images.map((item) => item.id === imageItem.id ? { ...item, type: event.target.value } : item) })}><option value="BEFORE">Trước thi công</option><option value="PROGRESS">Đang thi công</option><option value="AFTER">Sau thi công</option><option value="ISSUE">Vấn đề / sự cố</option><option value="OTHER">Khác</option></select><button type="button" onClick={() => setForm({ ...form, images: form.images.filter((item) => item.id !== imageItem.id) })}><Trash2 size={16} /></button></div>)}</div>}</div><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowForm(false)}>Hủy</button><button className="primary-button" type="submit">Lưu nhật ký</button></div></div></form></section>}

    {selectedDiary && <section className="jobs-modal" role="dialog" aria-modal="true"><div className="jobs-modal-card diary-detail-modal"><div className="jobs-modal-header"><div><span className="eyebrow">Chi tiết nhật ký</span><h2>{displayDate(selectedDiary.date)} · {selectedDiary.taskName}</h2></div><button type="button" onClick={() => setSelectedDiary(null)}><X /></button></div><div className="diary-detail"><dl><div><dt>Dự án</dt><dd>{project?.name}</dd></div><div><dt>Hạng mục</dt><dd>{selectedDiary.category}</dd></div><div><dt>Đội thi công</dt><dd>{selectedDiary.team}</dd></div><div><dt>Nhân công</dt><dd>{selectedDiary.workerCount} người</dd></div><div><dt>Thời gian</dt><dd>{selectedDiary.startTime} – {selectedDiary.endTime}</dd></div></dl><section><h3>Nội dung thi công</h3><p>{selectedDiary.description}</p></section>{selectedDiary.issue && <section className="diary-issue"><h3>Vấn đề / phát sinh</h3><p>{selectedDiary.issue}</p></section>}<div className="diary-detail-buttons"><button className="ghost-button" type="button" onClick={() => openEdit(selectedDiary)}><Pencil size={17} />Chỉnh sửa</button><button className="delete-diary" type="button" onClick={() => deleteDiary(selectedDiary)}><Trash2 size={17} />Xóa nhật ký</button></div></div></div></section>}

    {lightbox && <section className="diary-lightbox"><button className="lightbox-close" type="button" onClick={() => setLightbox(null)}><X /></button><button type="button" disabled={lightbox.index === 0} onClick={() => setLightbox({ ...lightbox, index: lightbox.index - 1 })}><ChevronLeft /></button><div><img src={lightbox.images[lightbox.index].url} alt="Hiện trường" /><aside><strong>{project?.name}</strong><span>{displayDate(lightbox.diary.date)} · {new Date(lightbox.images[lightbox.index].capturedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span><span>{lightbox.diary.category} · {lightbox.diary.taskName}</span><span>{lightbox.diary.team}</span>{lightbox.images[lightbox.index].latitude && <span><MapPin size={14} />{lightbox.images[lightbox.index].latitude.toFixed(5)}, {lightbox.images[lightbox.index].longitude.toFixed(5)}</span>}</aside></div><button type="button" disabled={lightbox.index === lightbox.images.length - 1} onClick={() => setLightbox({ ...lightbox, index: lightbox.index + 1 })}><ChevronRight /></button></section>}

    {reportDate && <section className="jobs-modal diary-report-overlay"><div className="jobs-modal-card diary-report"><div className="jobs-modal-header no-print"><div><span className="eyebrow">Báo cáo hiện trường</span><h2>{displayDate(reportDate)}</h2></div><div className="report-actions"><button type="button" onClick={() => window.print()}><Printer size={18} />In / Xuất báo cáo</button><button type="button" onClick={() => setReportDate(null)}><X /></button></div></div><header><strong>TN IDEAL CÔNG TRÌNH</strong><h1>Báo cáo hiện trường</h1><p>{project?.name} · {displayDate(reportDate)}</p><p>{project?.fullAddress || project?.location}</p></header>{diaries.filter((item) => item.date === reportDate).map((diary, index) => <article key={diary.id}><h2>{index + 1}. {diary.category} — {diary.taskName}</h2><dl><div><dt>Đội thi công</dt><dd>{diary.team}</dd></div><div><dt>Nhân công</dt><dd>{diary.workerCount} người</dd></div><div><dt>Thời gian</dt><dd>{diary.startTime} – {diary.endTime}</dd></div></dl><h3>Nội dung thi công</h3><p>{diary.description}</p>{diary.issue && <><h3>Vấn đề / phát sinh</h3><p>{diary.issue}</p></>}<div className="report-images">{diary.images.map((imageItem) => <figure key={imageItem.id}><img src={imageItem.url} alt="Hiện trường" /><figcaption>{new Date(imageItem.capturedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · {imageItem.type}</figcaption></figure>)}</div></article>)}</div></section>}
  </section>;
}
