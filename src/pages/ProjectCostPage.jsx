import { CirclePlus, ClipboardList, DollarSign, Package, Trash2, UsersRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCostData, saveCostData } from '../services/costApi';

const expenseLabels = { MACHINE: 'Máy móc / thiết bị', TRANSPORT: 'Vận chuyển', UTILITIES: 'Điện nước', OTHER: 'Khác' };
const number = (value) => Number(value || 0);
const formatMoney = (value) => `${number(value).toLocaleString('vi-VN')}đ`;
const formatCompactMoney = (value) => number(value) >= 1000000 ? `${(number(value) / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu` : formatMoney(value);
const dateKey = (value) => {
  const [day, month, year] = String(value).split('/');
  return year && month && day ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` : value;
};

export default function ProjectCostPage({ project, session, materialDefinitions, materialTransactions }) {
  const [tab, setTab] = useState('overview');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ type: 'MACHINE', description: '', amount: '', category: 'Móng', date: '18/08/2026', note: '' });
  const [expenses, setExpenses] = useState([]);
  const [laborCosts, setLaborCosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCostData(session.token).then((data) => {
      if (cancelled) return;
      setExpenses(data.expenses || []);
      setLaborCosts(data.laborCosts || []);
      setError('');
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.message);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [session.token]);

  const inDateRange = (date) => (!fromDate || dateKey(date) >= fromDate) && (!toDate || dateKey(date) <= toDate);
  const importedMaterials = materialTransactions.filter((entry) => entry.projectId === 'current-project' && entry.type === 'IMPORT' && inDateRange(entry.date));
  const filteredLaborCosts = laborCosts.filter((entry) => entry.projectId === 'current-project' && inDateRange(entry.date));
  const filteredExpenses = expenses.filter((entry) => entry.projectId === 'current-project' && inDateRange(entry.date));
  const materialCost = importedMaterials.reduce((sum, entry) => sum + number(entry.quantity) * number(entry.unitPrice), 0);
  const laborCost = filteredLaborCosts.reduce((sum, entry) => sum + (entry.paymentType === 'DAILY' ? number(entry.workUnits) * number(entry.dailyRate) : number(entry.contractAmount)), 0);
  const machineCost = filteredExpenses.filter((entry) => entry.type === 'MACHINE').reduce((sum, entry) => sum + number(entry.amount), 0);
  const otherExpenseCost = filteredExpenses.filter((entry) => entry.type !== 'MACHINE').reduce((sum, entry) => sum + number(entry.amount), 0);
  const otherCost = machineCost + otherExpenseCost;
  const totalCost = materialCost + laborCost + otherCost;

  async function persistCosts(nextExpenses, nextLaborCosts = laborCosts) {
    const saved = await saveCostData(session.token, { expenses: nextExpenses, laborCosts: nextLaborCosts });
    setExpenses(saved.expenses || []);
    setLaborCosts(saved.laborCosts || []);
  }

  async function addExpense(event) {
    event.preventDefault();
    if (!expenseForm.description.trim() || number(expenseForm.amount) <= 0) return setError('Nội dung và số tiền phải hợp lệ.');
    const nextExpenses = [...expenses, { ...expenseForm, id: Date.now(), projectId: 'current-project', amount: number(expenseForm.amount) }];
    try {
      await persistCosts(nextExpenses);
      setExpenseForm({ type: 'MACHINE', description: '', amount: '', category: 'Móng', date: '18/08/2026', note: '' });
      setShowExpenseModal(false);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteExpense(id) {
    const nextExpenses = expenses.filter((expense) => Number(expense.id) !== Number(id));
    try {
      await persistCosts(nextExpenses);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return <>
    <section className="cost-page">
      <div className="cost-toolbar">
        <label>Dự án<select><option>{project?.name || 'Chọn một dự án'}</option></select></label>
        <label>Từ ngày<input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label>
        <label>Đến ngày<input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label>
        <button className="primary-button" type="button" onClick={() => { setError(''); setShowExpenseModal(true); }}><CirclePlus size={18} />Thêm chi phí</button>
      </div>
      {error && !showExpenseModal && <p className="setup-error">{error}</p>}
      <div className="cost-summary-cards">
        <article><span><DollarSign size={20} /></span><div><small>Tổng chi phí</small><strong>{formatCompactMoney(totalCost)}</strong></div></article>
        <article><span><Package size={20} /></span><div><small>Chi phí vật tư</small><strong>{formatCompactMoney(materialCost)}</strong></div></article>
        <article><span><UsersRound size={20} /></span><div><small>Chi phí nhân công</small><strong>{formatCompactMoney(laborCost)}</strong></div></article>
        <article><span><ClipboardList size={20} /></span><div><small>Chi phí khác</small><strong>{formatCompactMoney(otherCost)}</strong></div></article>
      </div>
      <div className="material-tabs">
        <button className={tab === 'overview' ? 'active' : ''} type="button" onClick={() => setTab('overview')}>Tổng quan</button>
        <button className={tab === 'materials' ? 'active' : ''} type="button" onClick={() => setTab('materials')}>Vật tư</button>
        <button className={tab === 'labor' ? 'active' : ''} type="button" onClick={() => setTab('labor')}>Nhân công</button>
        <button className={tab === 'expenses' ? 'active' : ''} type="button" onClick={() => setTab('expenses')}>Phát sinh</button>
      </div>
      {loading && <div className="empty-state">Đang tải dữ liệu chi phí...</div>}
      {!loading && tab === 'overview' && <div className="cost-overview">
        <section><div className="cost-section-heading"><span className="eyebrow">Tổng hợp</span><h2>Cơ cấu chi phí</h2></div><div className="cost-breakdown"><div className="cost-table-head"><span>Loại chi phí</span><span>Số tiền</span><span>Tỷ trọng</span></div>{[['Vật tư', materialCost], ['Nhân công', laborCost], ['Máy móc / thiết bị', machineCost], ['Phát sinh khác', otherExpenseCost]].map(([label, amount]) => <div key={label}><strong>{label}</strong><span>{formatMoney(amount)}</span><span><b>{totalCost ? Math.round(amount / totalCost * 100) : 0}%</b><i><i style={{ width: `${totalCost ? amount / totalCost * 100 : 0}%` }} /></i></span></div>)}</div></section>
        <section><div className="cost-section-heading"><span className="eyebrow">Theo công việc</span><h2>Chi phí theo hạng mục</h2></div><div className="category-cost-table"><div><span>Hạng mục</span><span>Vật tư</span><span>Nhân công</span><span>Khác</span><span>Tổng</span></div>{['Chuẩn bị & mặt bằng', 'Móng', 'Khung BTCT', 'Xây tường'].map((category) => { const materialAmount = importedMaterials.filter((entry) => entry.category === category).reduce((sum, entry) => sum + number(entry.quantity) * number(entry.unitPrice), 0); const laborAmount = filteredLaborCosts.filter((entry) => entry.category === category).reduce((sum, entry) => sum + (entry.paymentType === 'DAILY' ? number(entry.workUnits) * number(entry.dailyRate) : number(entry.contractAmount)), 0); const expenseAmount = filteredExpenses.filter((entry) => entry.category === category).reduce((sum, entry) => sum + number(entry.amount), 0); return <div key={category}><strong>{category}</strong><span>{formatMoney(materialAmount)}</span><span>{formatMoney(laborAmount)}</span><span>{formatMoney(expenseAmount)}</span><b>{formatMoney(materialAmount + laborAmount + expenseAmount)}</b></div>; })}</div></section>
      </div>}
      {!loading && tab === 'materials' && <div className="cost-data-table material-cost-table"><div><span>Ngày</span><span>Vật tư</span><span>Hạng mục</span><span>Số lượng</span><span>Đơn giá</span><span>Thành tiền</span><span>Nhà cung cấp</span></div>{importedMaterials.map((entry) => { const material = materialDefinitions.find((item) => item.name === entry.material); return <div key={entry.id}><span>{entry.date}</span><strong>{entry.material}</strong><span>{entry.category}</span><span>{number(entry.quantity).toLocaleString('vi-VN')} {material?.unit || '—'}</span><span>{formatMoney(entry.unitPrice)}</span><b>{formatMoney(number(entry.quantity) * number(entry.unitPrice))}</b><span>{entry.supplier || '—'}</span></div>; })}</div>}
      {!loading && tab === 'labor' && <div className="cost-data-table labor-cost-table"><div><span>Đội / Nhân công</span><span>Hạng mục</span><span>Hình thức</span><span>Số công</span><span>Đơn giá</span><span>Thành tiền</span></div>{filteredLaborCosts.map((entry) => <div key={entry.id}><strong>{entry.name}</strong><span>{entry.category}</span><span className="payment-type">{entry.paymentType === 'DAILY' ? 'Theo công' : 'Khoán'}</span><span>{entry.paymentType === 'DAILY' ? entry.workUnits : '—'}</span><span>{entry.paymentType === 'DAILY' ? formatMoney(entry.dailyRate) : '—'}</span><b>{formatMoney(entry.paymentType === 'DAILY' ? number(entry.workUnits) * number(entry.dailyRate) : entry.contractAmount)}</b></div>)}</div>}
      {!loading && tab === 'expenses' && <div className="cost-data-table expense-table"><div><span>Ngày</span><span>Loại</span><span>Nội dung</span><span>Hạng mục</span><span>Số tiền</span><span>Ghi chú</span><span>Thao tác</span></div>{filteredExpenses.map((entry) => <div key={entry.id}><span>{entry.date}</span><span className="expense-type">{expenseLabels[entry.type] || entry.type}</span><strong>{entry.description}</strong><span>{entry.category}</span><b>{formatMoney(entry.amount)}</b><span>{entry.note || '—'}</span><button type="button" onClick={() => deleteExpense(entry.id)}><Trash2 size={17} /></button></div>)}</div>}
    </section>

    {showExpenseModal && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Thêm chi phí"><form className="jobs-modal-card material-import-modal" onSubmit={addExpense}><div className="jobs-modal-header"><div><span className="eyebrow">Chi phí phát sinh</span><h2>Thêm chi phí</h2></div><button type="button" onClick={() => setShowExpenseModal(false)} aria-label="Đóng"><X size={22} /></button></div><div className="material-import-form"><label>Dự án *<select><option>{project?.name || 'Công trình hiện tại'}</option></select></label><label>Hạng mục<select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}><option>Chuẩn bị & mặt bằng</option><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select></label><label>Loại chi phí *<select value={expenseForm.type} onChange={(event) => setExpenseForm({ ...expenseForm, type: event.target.value })}>{Object.entries(expenseLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label>Nội dung *<input required value={expenseForm.description} onChange={(event) => setExpenseForm({ ...expenseForm, description: event.target.value })} placeholder="Ví dụ: Thuê máy xúc 1 ngày" /></label><label>Số tiền *<input required min="1" type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} /></label><label>Ngày *<input required value={expenseForm.date} onChange={(event) => setExpenseForm({ ...expenseForm, date: event.target.value })} /></label><label>Ghi chú<textarea rows="3" value={expenseForm.note} onChange={(event) => setExpenseForm({ ...expenseForm, note: event.target.value })} /></label>{error && <p className="setup-error">{error}</p>}<div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowExpenseModal(false)}>Hủy</button><button className="primary-button" type="submit">Lưu chi phí</button></div></div></form></section>}
  </>;
}
