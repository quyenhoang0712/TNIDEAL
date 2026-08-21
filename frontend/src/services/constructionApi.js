async function constructionRequest(token, options = {}) {
  const response = await fetch('/api/constructions', {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thể xử lý công trình');
  return data;
}

export const getConstructions = (token) => constructionRequest(token);
export const createConstruction = (token, form) => constructionRequest(token, { method: 'POST', body: JSON.stringify(form) });
