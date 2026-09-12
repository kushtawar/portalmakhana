import "server-only";
import { connectToDatabase } from "@/lib/db/connect";
import { EnquiryModel, type EnquiryDoc } from "@/lib/db/models/Enquiry";
import type { CreateEnquiryInput } from "@/lib/validation/enquiry";
import type { Enquiry } from "@/lib/types";

function toEnquiry(doc: EnquiryDoc & { _id: unknown; createdAt: Date }): Enquiry {
  return {
    id: String(doc._id),
    type: doc.type,
    fields: doc.fields,
    status: doc.status,
    notes: doc.notes,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createEnquiry(input: CreateEnquiryInput): Promise<Enquiry> {
  await connectToDatabase();
  const created = await EnquiryModel.create({ type: input.type, fields: input.fields });
  return toEnquiry(created.toObject() as EnquiryDoc & { _id: unknown; createdAt: Date });
}

export async function listEnquiries(): Promise<Enquiry[]> {
  await connectToDatabase();
  const docs = await EnquiryModel.find().sort({ createdAt: -1 }).lean();
  return docs.map((doc) => toEnquiry(doc as EnquiryDoc & { _id: unknown; createdAt: Date }));
}

export async function getEnquiryById(id: string): Promise<Enquiry | null> {
  await connectToDatabase();
  const doc = await EnquiryModel.findById(id).lean();
  return doc ? toEnquiry(doc as EnquiryDoc & { _id: unknown; createdAt: Date }) : null;
}

export async function countNewEnquiries(): Promise<number> {
  await connectToDatabase();
  return EnquiryModel.countDocuments({ status: "NEW" });
}
