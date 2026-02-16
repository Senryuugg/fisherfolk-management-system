import mongoose from 'mongoose';

const mapDataSchema = new mongoose.Schema(
  {
    layerName: {
      type: String,
      required: true,
    },
    layerType: {
      type: String,
      enum: ['fishing_zone', 'mangrove', 'city', 'protected_area', 'buffer_zone'],
      required: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point', 'Polygon', 'MultiPolygon'],
        default: 'Point',
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
      },
    },
    bufferRadius: {
      value: Number,
      unit: {
        type: String,
        enum: ['km', 'meters'],
        default: 'km',
      },
    },
    properties: {
      name: String,
      description: String,
      area: Number,
      managingOrganization: String,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Create geospatial index for coordinates
mapDataSchema.index({ 'coordinates.coordinates': '2dsphere' });

export default mongoose.model('MapData', mapDataSchema);
