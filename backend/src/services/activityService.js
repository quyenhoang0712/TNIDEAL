import ActivityLog from '../models/ActivityLog.js';

export async function writeActivity(user, action, targetType, targetName, details = '') {
  await ActivityLog.create({
    actorId: user?._id || null,
    actorName: user?.displayName || user?.username || 'Hệ thống',
    actorRole: user?.role || 'admin',
    action,
    targetType,
    targetName,
    details
  });
}
