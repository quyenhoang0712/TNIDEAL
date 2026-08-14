import mongoose from 'mongoose';

const progressTaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 3 },
  owner: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  status: { type: String, enum: ['planning', 'active', 'done'], default: 'planning' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  description: { type: String, trim: true, default: '' },
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  constructionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Construction', default: null, index: true }
}, { timestamps: true, collection: 'projects' });

export default mongoose.models.ProgressTask || mongoose.model('ProgressTask', progressTaskSchema);
