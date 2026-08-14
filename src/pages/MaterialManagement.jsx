import { CirclePlus, ClipboardList, DollarSign, Package, Search, X } from 'lucide-react';
import { useState } from 'react';
import { DEFAULT_MATERIAL_DEFINITIONS } from '../services/materialApi';

const number = (value) => Number(value || 0);

export default function MaterialManagement({
  project,
  materialDefinitions,
  materialTransactions,
  purchaseRequests,
  setMaterialTransactions,
  setPurchaseRequests
}) {
  const definitions = materialDefinitions?.length ? materialDefinitions : DEFAULT_MATERIAL_DEFINITIONS;
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importForm, setImportForm] = useState({ material: definitions[0].name, quantity: 100, unit: definitions[0].unit, unitPrice: definitions[0].price, supplier: '', date: '08/08/2026' });
  const [showExport, setShowExport] = useState(false);
  const [exportForm, setExportForm] = useState({ material: definitions[0].name, quantity: 1, category: 'Móng', date: '18/08/2026', note: '' });
  const [error, setError] = useState('');

  const materials = definitions.map((definition) => {
    const transactions = materialTransactions.filter((transaction) => transaction.material === definition.name);
    const imported = transactions.filter((transaction) => transaction.type === 'IMPORT').reduce((sum, transaction) => sum + number(transaction.quantity), 0);
    const used = transactions.filter((transaction) => transaction.type === 'EXPORT').reduce((sum, transaction) => sum + number(transaction.quantity), 0);
    const remaining = imported - used;
    return { ...definition, imported, used, remaining, status: remaining <= 0 ? 'need' : remaining <= definition.minStock ? 'low' : 'enough' };
  });
  const filteredMaterials = materials.filter((material) => material.name.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
  const totalImportValue = materialTransactions.filter((transaction) => transaction.type === 'IMPORT').reduce((sum, transaction) => sum + number(transaction.quantity) * number(transaction.unitPrice), 0);

  function saveImport(event) {
    event.preventDefault();
    if (number(importForm.quantity) <= 0 || number(importForm.unitPrice) < 0) return setError('Số lượng và đơn giá phải hợp lệ.');
    setMaterialTransactions((current) => [...current, {
      id: Date.now(), projectId: 'current-project', material: importForm.material, type: 'IMPORT',
      quantity: number(importForm.quantity), unitPrice: number(importForm.unitPrice), category: importForm.category || 'Móng',
      supplier: importForm.supplier || '', date: importForm.date, note: importForm.note || ''
    }]);
    if (importForm.requestId) setPurchaseRequests((current) => current.map((request) => Number(request.id) === Number(importForm.requestId) ? { ...request, status: 'RECEIVED' } : request));
    setError('');
    setShowImport(false);
  }

  function saveExport(event) {
    event.preventDefault();
    const material = materials.find((item) => item.name === exportForm.material);
    if (!material || number(exportForm.quantity) <= 0) return setError('Số lượng xuất phải lớn hơn 0.');
    if (number(exportForm.quantity) > material.remaining) return setError(`Không thể xuất quá tồn kho hiện tại (${material.remaining.toLocaleString('vi-VN')} ${material.unit}).`);
    setMaterialTransactions((current) => [...current, {
      id: Date.now(), projectId: 'current-project', material: exportForm.material, type: 'EXPORT', quantity: number(exportForm.quantity),
      unitPrice: 0, category: exportForm.category, supplier: '', date: exportForm.date, note: exportForm.note || ''
    }]);
    setError('');
    setShowExport(false);
    setSelectedMaterial(null);
  }

  return <>
    <section className="materials-page">
      <div className="material-stats">
        <article><span><Package size={20} /></span><div><strong>{materials.length}</strong><small>Vật tư đang quản lý</small></div></article>
        <article><span><ClipboardList size={20} /></span><div><strong>{purchaseRequests.filter((request) => !['RECEIVED', 'CANCELLED'].includes(request.status)).length}</strong><small>Cần mua</small></div></article>
        <article><span><Package size={20} /></span><div><strong>{materials.filter((material) => material.used > 0).length}</strong><small>Đã sử dụng</small></div></article>
        <article><span><DollarSign size={20} /></span><div><strong>{(totalImportValue / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr</strong><small>Giá trị đã nhập</small></div></article>
      </div>
      <div className="materials-toolbar">
        <label className="worker-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm vật tư..." /></label>
        <select aria-label="Công trình"><option>{project?.name || 'Tất cả công trình'}</option></select>
        <select aria-label="Hạng mục"><option>Tất cả hạng mục</option><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select>
        <select aria-label="Trạng thái"><option>Tất cả trạng thái</option><option>Sắp hết</option><option>Còn</option></select>
        <button className="primary-button" type="button" onClick={() => { setError(''); setShowImport(true); }}><CirclePlus size={18} />Nhập vật tư</button>
      </div>
      <div className="material-tabs">
        <button className={tab === 'overview' ? 'active' : ''} type="button" onClick={() => setTab('overview')}>Vật tư hiện có</button>
        <button className={tab === 'buy' ? 'active' : ''} type="button" onClick={() => setTab('buy')}>Cần mua</button>
        <button className={tab === 'history' ? 'active' : ''} type="button" onClick={() => setTab('history')}>Lịch sử nhập/xuất</button>
      </div>
      {tab === 'overview' && <div className="material-table">
        <div className="material-table-head"><span>Vật tư</span><span>ĐVT</span><span>Đã nhập</span><span>Đã dùng</span><span>Tồn kho</span><span>Trạng thái</span><span>Thao tác</span></div>
        {filteredMaterials.map((material) => <div className="material-table-row" key={material.name}><strong>{material.name}</strong><span>{material.unit}</span><span>{material.imported.toLocaleString('vi-VN')}</span><span>{material.used.toLocaleString('vi-VN')}</span><b>{material.remaining.toLocaleString('vi-VN')}</b><span className={`material-status ${material.status}`}>{material.status === 'enough' ? 'Còn' : material.status === 'low' ? 'Sắp hết' : 'Hết'}</span><button type="button" onClick={() => setSelectedMaterial(material)}>Xem</button></div>)}
      </div>}
      {tab === 'buy' && <div className="purchase-section">
        <div className="purchase-heading"><span>{purchaseRequests.length} yêu cầu vật tư</span></div>
        <div className="purchase-grid">{purchaseRequests.map((request) => {
          const material = materials.find((item) => item.name === request.material) || { name: request.material, unit: request.unit, price: 0, remaining: 0 };
          const statusLabels = { PENDING: 'Chưa mua', ORDERED: 'Đã đặt', RECEIVED: 'Đã nhập', CANCELLED: 'Hủy' };
          return <article key={request.id}><div><span className={`request-status ${String(request.status).toLowerCase()}`}>{statusLabels[request.status] || request.status}</span><h3>{request.material}</h3><p>{project?.name || 'Công trình hiện tại'} → {request.category}</p></div><dl><div><dt>Số lượng</dt><dd>{number(request.quantity).toLocaleString('vi-VN')} {request.unit}</dd></div><div><dt>Ngày cần</dt><dd>{request.neededDate}</dd></div><div><dt>Tồn hiện tại</dt><dd>{material.remaining.toLocaleString('vi-VN')} {request.unit}</dd></div></dl>{!['RECEIVED', 'CANCELLED'].includes(request.status) && <button className="primary-button" type="button" onClick={() => { setImportForm({ ...importForm, requestId: request.id, material: material.name, quantity: request.quantity, unit: material.unit, unitPrice: material.price, category: request.category }); setError(''); setShowImport(true); }}>Ghi nhận đã nhập</button>}</article>;
        })}</div>
      </div>}
      {tab === 'history' && <div className="history-table">
        <div className="history-table-head"><span>Ngày</span><span>Loại</span><span>Vật tư</span><span>Số lượng</span><span>ĐVT</span><span>Hạng mục</span><span>Đơn giá</span><span>Thành tiền</span><span>Ghi chú</span></div>
        {[...materialTransactions].reverse().map((entry) => { const material = materials.find((item) => item.name === entry.material); return <div className="history-table-row" key={entry.id}><span>{entry.date}</span><span className={`movement ${entry.type === 'IMPORT' ? 'import' : 'export'}`}>{entry.type === 'IMPORT' ? 'Nhập' : 'Xuất'}</span><strong>{entry.material}</strong><b>{entry.type === 'IMPORT' ? '+' : '-'}{number(entry.quantity).toLocaleString('vi-VN')}</b><span>{material?.unit || '—'}</span><span>{entry.category}</span><span>{entry.unitPrice ? number(entry.unitPrice).toLocaleString('vi-VN') : '—'}</span><strong>{entry.unitPrice ? (number(entry.quantity) * number(entry.unitPrice)).toLocaleString('vi-VN') : '—'}</strong><span>{entry.note || entry.supplier || '—'}</span></div>; })}
      </div>}
    </section>

    {selectedMaterial && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selectedMaterial.name}`}><div className="jobs-modal-card material-detail-modal"><div className="jobs-modal-header"><div><span className="eyebrow">Chi tiết vật tư</span><h2>{selectedMaterial.name}</h2><p>{project?.name || 'Công trình hiện tại'} · ĐVT: {selectedMaterial.unit} · Tồn tối thiểu: {selectedMaterial.minStock.toLocaleString('vi-VN')}</p></div><button type="button" onClick={() => setSelectedMaterial(null)} aria-label="Đóng"><X size={22} /></button></div><div className="material-detail-content"><div className="material-detail-summary"><article><span>Tổng đã nhập</span><strong>{selectedMaterial.imported.toLocaleString('vi-VN')}</strong><small>{selectedMaterial.unit}</small></article><article><span>Tổng đã dùng</span><strong>{selectedMaterial.used.toLocaleString('vi-VN')}</strong><small>{selectedMaterial.unit}</small></article><article className="remaining"><span>Tồn hiện tại</span><strong>{selectedMaterial.remaining.toLocaleString('vi-VN')}</strong><small>{selectedMaterial.unit}</small></article></div><div className="material-detail-actions"><button className="primary-button" type="button" onClick={() => { setExportForm({ ...exportForm, material: selectedMaterial.name }); setError(''); setShowExport(true); }}>Xuất sử dụng</button></div><section><h3>Sử dụng theo hạng mục</h3><div className="usage-list">{Array.from(new Set(materialTransactions.filter((entry) => entry.material === selectedMaterial.name && entry.type === 'EXPORT').map((entry) => entry.category))).map((category) => <div key={category}><span>{category}</span><strong>{materialTransactions.filter((entry) => entry.material === selectedMaterial.name && entry.type === 'EXPORT' && entry.category === category).reduce((sum, entry) => sum + number(entry.quantity), 0).toLocaleString('vi-VN')} {selectedMaterial.unit}</strong></div>)}</div></section><section><h3>Lịch sử nhập/xuất</h3><div className="usage-list">{materialTransactions.filter((entry) => entry.material === selectedMaterial.name).map((entry) => <div key={entry.id}><span>{entry.date} · {entry.type === 'IMPORT' ? 'Nhập' : 'Xuất'} · {entry.category}</span><strong>{entry.type === 'IMPORT' ? '+' : '-'}{number(entry.quantity).toLocaleString('vi-VN')} {selectedMaterial.unit}</strong></div>)}</div></section></div></div></section>}

    {showImport && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Nhập vật tư"><form className="jobs-modal-card material-import-modal" onSubmit={saveImport}><div className="jobs-modal-header"><div><span className="eyebrow">Kho công trình</span><h2>Nhập vật tư</h2></div><button type="button" onClick={() => setShowImport(false)} aria-label="Đóng"><X size={22} /></button></div><div className="material-import-form"><label>Công trình *<select><option>{project?.name || 'Công trình hiện tại'}</option></select></label><label>Hạng mục<select value={importForm.category || 'Móng'} onChange={(event) => setImportForm({ ...importForm, category: event.target.value })}><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select></label><label>Vật tư *<select value={importForm.material} onChange={(event) => { const material = materials.find((item) => item.name === event.target.value); setImportForm({ ...importForm, material: event.target.value, unit: material.unit, unitPrice: material.price }); }}>{materials.map((material) => <option key={material.name}>{material.name}</option>)}</select></label><div className="field-grid"><label>Số lượng *<input min="1" type="number" value={importForm.quantity} onChange={(event) => setImportForm({ ...importForm, quantity: Number(event.target.value) })} /></label><label>Đơn vị *<input readOnly value={importForm.unit} /></label></div><label>Đơn giá *<input min="0" type="number" value={importForm.unitPrice} onChange={(event) => setImportForm({ ...importForm, unitPrice: Number(event.target.value) })} /></label><label>Nhà cung cấp<input value={importForm.supplier} onChange={(event) => setImportForm({ ...importForm, supplier: event.target.value })} /></label><label>Ngày nhập *<input value={importForm.date} onChange={(event) => setImportForm({ ...importForm, date: event.target.value })} /></label><label>Ghi chú<textarea rows="2" value={importForm.note || ''} onChange={(event) => setImportForm({ ...importForm, note: event.target.value })} /></label>{error && <p className="setup-error">{error}</p>}<div className="import-total"><span>Thành tiền</span><strong>{(number(importForm.quantity) * number(importForm.unitPrice)).toLocaleString('vi-VN')}đ</strong></div><div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowImport(false)}>Hủy</button><button className="primary-button" type="submit">Xác nhận nhập</button></div></div></form></section>}

    {showExport && <section className="jobs-modal" role="dialog" aria-modal="true" aria-label="Xuất sử dụng vật tư"><form className="jobs-modal-card material-import-modal" onSubmit={saveExport}><div className="jobs-modal-header"><div><span className="eyebrow">Kho công trình</span><h2>Xuất sử dụng vật tư</h2></div><button type="button" onClick={() => setShowExport(false)} aria-label="Đóng"><X size={22} /></button></div><div className="material-import-form"><label>Công trình<select><option>{project?.name || 'Công trình hiện tại'}</option></select></label><label>Vật tư<select value={exportForm.material} onChange={(event) => setExportForm({ ...exportForm, material: event.target.value })}>{materials.map((material) => <option key={material.name}>{material.name}</option>)}</select></label><label>Số lượng xuất *<input min="1" type="number" value={exportForm.quantity} onChange={(event) => setExportForm({ ...exportForm, quantity: Number(event.target.value) })} /></label><label>Hạng mục sử dụng<select value={exportForm.category} onChange={(event) => setExportForm({ ...exportForm, category: event.target.value })}><option>Móng</option><option>Khung BTCT</option><option>Xây tường</option></select></label><label>Ngày sử dụng<input value={exportForm.date} onChange={(event) => setExportForm({ ...exportForm, date: event.target.value })} /></label><label>Ghi chú<textarea rows="3" placeholder="Ví dụ: Đổ bê tông móng" value={exportForm.note} onChange={(event) => setExportForm({ ...exportForm, note: event.target.value })} /></label>{error && <p className="setup-error">{error}</p>}<div className="modal-actions"><button className="ghost-button" type="button" onClick={() => setShowExport(false)}>Hủy</button><button className="primary-button" type="submit">Xác nhận xuất</button></div></div></form></section>}
  </>;
}
