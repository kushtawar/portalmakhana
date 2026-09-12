import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createEnquiry, listEnquiries } from "@/lib/db/enquiries";
import { createEnquirySchema } from "@/lib/validation/enquiry";
import { notifyNewEnquiry } from "@/lib/mail/notifyEnquiry";

// Public: visitors submit wholesale/export enquiries from the storefront.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const enquiry = await createEnquiry(parsed.data);

  // The enquiry is already saved; don't fail the request over a flaky mail server.
  notifyNewEnquiry(enquiry).catch((error) => {
    console.error("Failed to send enquiry notification email", error);
  });

  return NextResponse.json({ enquiry }, { status: 201 });
}

// Admin-only: the lead list.
export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const enquiries = await listEnquiries();
  return NextResponse.json({ enquiries });
}
