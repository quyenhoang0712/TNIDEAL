import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorName: { type: String, required: true },
    actorRole: { type: String, enum: ['admin', 'contractor'], required: true },
    action: { type: String, required: true },
    targetType: { type: String, default: 'system' },
    targetName: { type: String, default: '' },
    details: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
