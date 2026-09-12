import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { AuditEventModel, type AuditEventDoc } from "@/lib/db/models/AuditEvent";
import type { AuditAction, AuditEntityType, AuditEvent } from "@/lib/types";

function toAuditEvent(doc: AuditEventDoc & { _id: unknown; createdAt: Date }): AuditEvent {
  return {
    id: String(doc._id),
    entityType: doc.entityType,
    entityLabel: doc.entityLabel,
    action: doc.action,
    actor: doc.actor,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function recordAuditEvent(input: {
  entityType: AuditEntityType;
  entityLabel: string;
  action: AuditAction;
  actor: string;
}): Promise<void> {
  await connectToDatabase();
  await AuditEventModel.create(input);
}

export async function listAuditEvents(limit = 100): Promise<AuditEvent[]> {
  await connectToDatabase();
  const docs = await AuditEventModel.find().sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map((doc) => toAuditEvent(doc as AuditEventDoc & { _id: unknown; createdAt: Date }));
}
