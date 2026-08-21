import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'general' },
    companyName: { type: String, default: 'TN Ideal' },
    supportEmail: { type: String, default: 'admin@tnideal.vn' },
    loginAlerts: { type: Boolean, default: true },
    logo: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);
