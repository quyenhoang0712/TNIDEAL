async function costRequest(token, options = {}) {
  const response = await fetch('/api/costs', {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thể đồng bộ dữ liệu chi phí');
  return data;
}

export const getCostData = (token) => costRequest(token);
export const saveCostData = (token, data) => costRequest(token, { method: 'PUT', body: JSON.stringify(data) });
