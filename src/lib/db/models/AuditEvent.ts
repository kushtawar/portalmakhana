import mongoose, { Schema, type HydratedDocument } from "mongoose";
import type { AuditAction, AuditEntityType } from "@/lib/types";

const ENTITY_VALUES: AuditEntityType[] = ["product", "promotion", "banner", "article", "enquiry"];
const ACTION_VALUES: AuditAction[] = [
  "create",
  "update",
  "delete",
  "activate",
  "deactivate",
  "publish",
  "unpublish",
];

export interface AuditEventDoc {
  entityType: AuditEntityType;
  entityLabel: string;
  action: AuditAction;
  actor: string;
  createdAt: Date;
}

export type AuditEventHydratedDoc = HydratedDocument<AuditEventDoc>;

const AuditEventSchema = new Schema<AuditEventDoc>(
  {
    entityType: { type: String, required: true, enum: ENTITY_VALUES, index: true },
    entityLabel: { type: String, required: true },
    action: { type: String, required: true, enum: ACTION_VALUES },
    actor: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditEventModel =
  (mongoose.models.AuditEvent as mongoose.Model<AuditEventDoc>) ||
  mongoose.model<AuditEventDoc>("AuditEvent", AuditEventSchema);
