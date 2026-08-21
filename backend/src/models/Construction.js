import mongoose from 'mongoose';

const constructionSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  name: { type: String, required: true, trim: true },
  investorName: { type: String, required: true, trim: true },
  investorPhone: { type: String, default: '' },
  type: { type: String, default: 'house' },
  location: { type: String, default: '' },
  fullAddress: { type: String, default: '' },
  provinceCity: { type: String, default: '' },
  wardCommune: { type: String, default: '' },
  startDate: { type: String, default: '' },
  duration: { type: Number, default: 0 },
  landLength: { type: Number, default: 0 },
  landWidth: { type: Number, default: 0 },
  upperFloors: { type: Number, default: 0 },
  hasBasement: { type: Boolean, default: false },
  status: { type: String, enum: ['planning', 'active', 'paused', 'done'], default: 'planning' },
  hidden: { type: Boolean, default: false },
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contractorName: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Construction || mongoose.model('Construction', constructionSchema);
