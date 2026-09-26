import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema(
  {
    transactionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    operationType: {
      type: String,
      enum: [
        'INITIAL_STOCK',
        'RECEIPT',
        'DELIVERY',
        'TRANSFER_IN',
        'TRANSFER_OUT',
        'ADJUSTMENT',
      ],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    referenceNumber: {
      type: String,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
    },
    sourceLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    destinationLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

stockLedgerSchema.index({ transactionNumber: 1 });
stockLedgerSchema.index({ product: 1 });
stockLedgerSchema.index({ timestamp: -1 });

const StockLedger = mongoose.model('StockLedger', stockLedgerSchema);
export default StockLedger;
