import mongoose from 'mongoose';

export const DEFAULT_MATERIAL_DEFINITIONS = [
  { name: 'Xi măng PCB40', unit: 'Bao', minStock: 100, price: 95000 },
  { name: 'Thép D16', unit: 'Kg', minStock: 500, price: 17500 },
  { name: 'Cát xây', unit: 'm³', minStock: 6, price: 420000 },
  { name: 'Đá 1×2', unit: 'm³', minStock: 10, price: 480000 }
];

const definitionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },
  minStock: { type: Number, min: 0, default: 0 },
  price: { type: Number, min: 0, default: 0 }
}, { _id: false });

const transactionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  projectId: { type: String, default: 'current-project' },
  constructionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Construction', default: null },
  material: { type: String, required: true, trim: true },
  type: { type: String, enum: ['IMPORT', 'EXPORT'], required: true },
  quantity: { type: Number, required: true, min: 0.000001 },
  unitPrice: { type: Number, min: 0, default: 0 },
  category: { type: String, default: '' },
  supplier: { type: String, default: '' },
  date: { type: String, default: '' },
  note: { type: String, default: '' }
}, { _id: false });

const purchaseRequestSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  projectId: { type: String, default: 'current-project' },
  constructionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Construction', default: null },
  material: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.000001 },
  unit: { type: String, required: true },
  category: { type: String, default: '' },
  neededDate: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'], default: 'PENDING' }
}, { _id: false });

const materialWorkspaceSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  materialDefinitions: { type: [definitionSchema], default: () => DEFAULT_MATERIAL_DEFINITIONS.map((item) => ({ ...item })) },
  materialTransactions: { type: [transactionSchema], default: [] },
  purchaseRequests: { type: [purchaseRequestSchema], default: [] },
  migratedFromWorkspaceAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.models.MaterialWorkspace || mongoose.model('MaterialWorkspace', materialWorkspaceSchema);
