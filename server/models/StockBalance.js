import mongoose from 'mongoose';

const stockBalanceSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
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
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index to prevent duplicate records
stockBalanceSchema.index({ product: 1, location: 1 }, { unique: true });
stockBalanceSchema.index({ product: 1, warehouse: 1 });

// Ensure availableQuantity is calculated correctly
stockBalanceSchema.pre('save', function () {
  this.availableQuantity = this.quantity - this.reservedQuantity;
});

const StockBalance = mongoose.model('StockBalance', stockBalanceSchema);
export default StockBalance;
