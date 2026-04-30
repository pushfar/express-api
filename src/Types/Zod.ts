import { z } from 'zod';

export type ZodMethodSchema = {
	description: string;
	security?: Record<string, any[]>[];
	params?: z.ZodObject<any>;
	query?: z.ZodObject<any>;
	body?: z.ZodObject<any> | z.ZodPipe<any, any>;
	response?: Record<number, {
		description: string;
		schema: z.ZodType<any>;
	}>;
};

export type ZodSchema = {
	[method: string]: ZodMethodSchema;
};

export type ZodServiceSchema = {
	post: ZodMethodSchema;
};
