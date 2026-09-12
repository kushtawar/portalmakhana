import "server-only";
import { getMailTransport } from "@/lib/mail/transport";
import type { Enquiry } from "@/lib/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TYPE_LABEL: Record<Enquiry["type"], string> = {
  wholesale: "Wholesale",
  export: "Export",
};

export async function notifyNewEnquiry(enquiry: Enquiry): Promise<void> {
  const to = process.env.ENQUIRY_TO_EMAIL;
  if (!to) return;

  const contactName = enquiry.fields[0]?.value || "Unknown";
  const replyTo = enquiry.fields.find((field) => EMAIL_PATTERN.test(field.value))?.value;

  const lines = enquiry.fields.map((field) => `${field.label}: ${field.value}`);

  await getMailTransport().sendMail({
    from: process.env.SMTP_USER,
    to,
    replyTo,
    subject: `New ${TYPE_LABEL[enquiry.type]} enquiry from ${contactName}`,
    text: [
      `A new ${TYPE_LABEL[enquiry.type].toLowerCase()} enquiry was submitted on the ItarIntakes website.`,
      "",
      ...lines,
      "",
      `Submitted: ${new Date(enquiry.createdAt).toLocaleString("en-IN")}`,
      "View and manage in the admin portal under Enquiries.",
    ].join("\n"),
  });
}
