import { z } from "zod";

export const categorySchema = z.enum(["fullstack", "frontend", "backend", "ml", "other"]);

export const projectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(60),
  shortDescription: z.string().max(140),
  description: z.string(),
  techStack: z.array(z.string()).max(8),
  imageUrl: z.string().min(1),
  placeholderColor: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
  demoLink: z.string().url().nullable(),
  repoLink: z.string().url().nullable(),
  featured: z.boolean(),
  isConfidential: z.boolean(),
  category: categorySchema,
  year: z.number().int(),
  order: z.number().int().nonnegative(),
  isActive: z.number().int().default(1)
});

export const projectsSchema = z.array(projectSchema);

export type Project = z.infer<typeof projectSchema>;
