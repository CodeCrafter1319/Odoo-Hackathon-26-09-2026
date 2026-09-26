import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
    },
    parentLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
    },
    type: {
      type: String,
      enum: ['warehouse', 'internal', 'production', 'storage'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound uniqueness constraint for location code within a warehouse
locationSchema.index({ warehouse: 1, code: 1 }, { unique: true });

const Location = mongoose.model('Location', locationSchema);
export default Location;
