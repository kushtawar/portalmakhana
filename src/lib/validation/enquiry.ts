import { z } from "zod";

export const enquiryFieldEntrySchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const createEnquirySchema = z.object({
  type: z.enum(["wholesale", "export"]),
  fields: z.array(enquiryFieldEntrySchema).min(1),
});

export const updateEnquirySchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "QUOTED", "WON", "LOST"]).optional(),
  notes: z.string().optional(),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;
