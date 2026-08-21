async function progressRequest(token, path = '', options = {}) {
  const response = await fetch(`/api/progress${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Không thể xử lý tiến độ công trình');
  return data;
}

export function getProgressTasks(token, { status = 'all', constructionId = '' } = {}) {
  const query = new URLSearchParams();
  if (status !== 'all') query.set('status', status);
  if (constructionId) query.set('constructionId', constructionId);
  const suffix = query.toString() ? `?${query}` : '';
  return progressRequest(token, suffix);
}

export const createProgressTask = (token, task) => progressRequest(token, '', { method: 'POST', body: JSON.stringify(task) });
export const updateProgressStatus = (token, taskId, status) => progressRequest(token, `/${taskId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const deleteProgressTask = (token, taskId) => progressRequest(token, `/${taskId}`, { method: 'DELETE' });
