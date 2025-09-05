// models/child.schema.ts
import { z } from 'zod';

export const childSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['Male', 'Female', 'Prefer not to say']),
  dob: z.string().min(1, 'Date of birth is required'),
  topics: z.array(z.string()),
  concerns: z.array(z.string()),
});

export const childrenFormSchema = z.object({
  children: z.array(childSchema).min(1, 'At least one child is required'),
});

export type ChildrenFormType = z.infer<typeof childrenFormSchema>;
