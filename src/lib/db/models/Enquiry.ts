import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { EnquiryStatus, EnquiryType } from "@/lib/types";

const TYPE_VALUES: EnquiryType[] = ["wholesale", "export"];
const STATUS_VALUES: EnquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "QUOTED",
  "WON",
  "LOST",
];

export interface EnquiryFieldEntryDoc {
  label: string;
  value: string;
}

export interface EnquiryDoc {
  type: EnquiryType;
  fields: EnquiryFieldEntryDoc[];
  status: EnquiryStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EnquiryHydratedDoc = HydratedDocument<EnquiryDoc>;

const FieldEntrySchema = new Schema<EnquiryFieldEntryDoc>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const EnquirySchema = new Schema<EnquiryDoc>(
  {
    type: { type: String, required: true, enum: TYPE_VALUES, index: true },
    fields: { type: [FieldEntrySchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    status: { type: String, required: true, enum: STATUS_VALUES, default: "NEW", index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const EnquiryModel =
  (mongoose.models.Enquiry as mongoose.Model<EnquiryDoc>) ||
  mongoose.model<EnquiryDoc>("Enquiry", EnquirySchema);
