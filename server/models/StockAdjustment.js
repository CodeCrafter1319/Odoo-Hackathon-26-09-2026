import mongoose from 'mongoose';

const stockAdjustmentSchema = new mongoose.Schema(
  {
    adjustmentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        systemQuantity: {
          type: Number,
          required: true,
        },
        countedQuantity: {
          type: Number,
          required: true,
          min: 0,
        },
        difference: {
          type: Number,
        },
      },
    ],
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PENDING', 'APPROVED', 'DONE', 'CANCELED'],
      default: 'DRAFT',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


stockAdjustmentSchema.index({ status: 1 });

// Calculate difference before saving
stockAdjustmentSchema.pre('save', function () {
  if (this.items && this.items.length > 0) {
    this.items.forEach((item) => {
      if (item.systemQuantity !== undefined && item.countedQuantity !== undefined) {
        item.difference = item.countedQuantity - item.systemQuantity;
      }
    });
  }
});

const StockAdjustment = mongoose.model('StockAdjustment', stockAdjustmentSchema);
export default StockAdjustment;
