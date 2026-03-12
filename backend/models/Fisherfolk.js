import mongoose from 'mongoose';

// Taguig fisherfolk have 2-year renewal cycles; all other NCR cities are 1-year
const TAGUIG_RENEWAL_YEARS = 2;
const DEFAULT_RENEWAL_YEARS = 1;

export const getRenewalYears = (cityMunicipality = '') =>
  /taguig/i.test(cityMunicipality) ? TAGUIG_RENEWAL_YEARS : DEFAULT_RENEWAL_YEARS;

export const computeExpiry = (registrationDate, cityMunicipality) => {
  if (!registrationDate) return null;
  const d = new Date(registrationDate);
  d.setFullYear(d.getFullYear() + getRenewalYears(cityMunicipality));
  return d;
};

const fisherfolkSchema = new mongoose.Schema(
  {
    rsbsaNumber: { type: String, required: true, unique: true },
    registrationNumber: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    middleName: String,
    registrationDate: Date,
    renewalDate: Date,           // last time they renewed
    registrationExpiry: Date,    // computed: registrationDate (or renewalDate) + renewal period
    birthDate: Date,
    gender: String,
    region: String,
    province: String,
    cityMunicipality: String,
    barangay: String,
    mainLivelihood: String,
    alternativeLivelihood: String,
    boats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Boat' }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Auto-compute registrationExpiry before every save
fisherfolkSchema.pre('save', function (next) {
  const baseDate = this.renewalDate || this.registrationDate;
  if (baseDate) {
    this.registrationExpiry = computeExpiry(baseDate, this.cityMunicipality);
  }
  next();
});

export default mongoose.model('Fisherfolk', fisherfolkSchema);
