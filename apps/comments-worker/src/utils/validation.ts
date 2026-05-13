import { isValidEmail } from "@emtech/comments-shared";
import { z } from "zod";

const optionalTrimmed = (max: number) =>
	z
		.string()
		.transform(value => value.trim())
		.refine(value => value.length <= max, `Must be ${max} characters or less`)
		.optional();

export const createCommentSchema = z.object({
	pagePath: z
		.string()
		.transform(value => value.trim())
		.refine(value => value.startsWith("/") && !value.startsWith("//"), "pagePath must be a site path"),
	body: z
		.string()
		.transform(value => value.trim())
		.refine(value => value.length > 0, "body is required")
		.refine(value => value.length <= 3000, "body must be 3000 characters or less"),
	name: optionalTrimmed(80),
	email: z
		.string()
		.transform(value => value.trim())
		.refine(value => value.length === 0 || isValidEmail(value), "Invalid email")
		.optional(),
	parentId: z
		.string()
		.transform(value => value.trim())
		.refine(value => value.length > 0, "parentId cannot be empty")
		.optional(),
	turnstileToken: z
		.string()
		.transform(value => value.trim())
		.optional()
});

export const listCommentsSchema = z.object({
	pagePath: z
		.string()
		.transform(value => value.trim())
		.refine(value => value.startsWith("/") && !value.startsWith("//"), "pagePath must be a site path")
});

export const adminStatusSchema = z.object({
	status: z.enum(["all", "pending", "approved", "rejected", "spam", "deleted"]).default("all")
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
