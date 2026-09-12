import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db/connect";
import { EnquiryModel } from "@/lib/db/models/Enquiry";
import { getEnquiryById } from "@/lib/db/enquiries";
import { recordAuditEvent } from "@/lib/db/audit";
import { updateEnquirySchema } from "@/lib/validation/enquiry";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const enquiry = await getEnquiryById(id);
  if (!enquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ enquiry });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();
  const updated = await EnquiryModel.findByIdAndUpdate(id, parsed.data, {
    returnDocument: "after",
  }).lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await recordAuditEvent({
    entityType: "enquiry",
    entityLabel: updated.fields[0]?.value ?? id,
    action: "update",
    actor: session.user?.email ?? "admin",
  });

  return NextResponse.json({ enquiry: updated });
}
