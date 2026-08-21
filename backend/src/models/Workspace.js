import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      required: true
    },
    materialTransactions: { type: [mongoose.Schema.Types.Mixed], default: [] },
    purchaseRequests: { type: [mongoose.Schema.Types.Mixed], default: [] },
    expenses: { type: [mongoose.Schema.Types.Mixed], default: [] },
    diaries: { type: [mongoose.Schema.Types.Mixed], default: [] },
    constructionTeams: { type: [mongoose.Schema.Types.Mixed], default: [] },
    laborCosts: { type: [mongoose.Schema.Types.Mixed], default: [] },
    projectFiles: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);
