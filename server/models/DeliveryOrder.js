import mongoose from 'mongoose';

const deliveryOrderSchema = new mongoose.Schema(
  {
    deliveryNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: String,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    sourceLocation: {
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
        quantity: {
          type: Number,
          required: true,
          min: 0.00001,
        },
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'READY', 'PICKED', 'PACKED', 'DONE', 'CANCELED'],
      default: 'DRAFT',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    validatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


deliveryOrderSchema.index({ status: 1 });

const DeliveryOrder = mongoose.model('DeliveryOrder', deliveryOrderSchema);
export default DeliveryOrder;
