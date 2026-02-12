import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
  institute: z.string().min(1),
  email: z.string().email(),

  year: z.string().optional(),
  branch: z.string().optional(),

  committee1: z.string().min(1),
  portfolio1_1: z.string().min(1),
  portfolio1_2: z.string().min(1),
  portfolio1_3: z.string().min(1),

  committee2: z.string().min(1),
  portfolio2_1: z.string().min(1),
  portfolio2_2: z.string().min(1),
  portfolio2_3: z.string().min(1),

  experience: z.string().min(1),
  referral: z.string().optional(),

  transaction: z.string().min(1),
});
