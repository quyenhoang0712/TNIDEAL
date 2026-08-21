import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  projectId: { type: String, default: 'current-project' },
  constructionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Construction', default: null },
  type: { type: String, enum: ['MACHINE', 'TRANSPORT', 'UTILITIES', 'OTHER'], required: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.000001 },
  category: { type: String, default: '' },
  date: { type: String, default: '' },
  note: { type: String, default: '' }
}, { _id: false });

const laborCostSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  projectId: { type: String, default: 'current-project' },
  constructionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Construction', default: null },
  name: { type: String, required: true, trim: true },
  category: { type: String, default: '' },
  paymentType: { type: String, enum: ['DAILY', 'CONTRACT'], required: true },
  workUnits: { type: Number, min: 0, default: 0 },
  dailyRate: { type: Number, min: 0, default: 0 },
  contractAmount: { type: Number, min: 0, default: 0 },
  date: { type: String, default: '' }
}, { _id: false });

const costWorkspaceSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  expenses: { type: [expenseSchema], default: [] },
  laborCosts: { type: [laborCostSchema], default: [] },
  migratedFromWorkspaceAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.CostWorkspace || mongoose.model('CostWorkspace', costWorkspaceSchema);
