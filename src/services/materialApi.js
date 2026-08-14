async function materialRequest(token, options = {}) {
  const response = await fetch('/api/materials', {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thể đồng bộ dữ liệu vật tư');
  return data;
}

export const DEFAULT_MATERIAL_DEFINITIONS = [
  { name: 'Xi măng PCB40', unit: 'Bao', minStock: 100, price: 95000 },
  { name: 'Thép D16', unit: 'Kg', minStock: 500, price: 17500 },
  { name: 'Cát xây', unit: 'm³', minStock: 6, price: 420000 },
  { name: 'Đá 1×2', unit: 'm³', minStock: 10, price: 480000 }
];

export const getMaterialData = (token) => materialRequest(token);
export const saveMaterialData = (token, data) => materialRequest(token, { method: 'PUT', body: JSON.stringify(data) });
