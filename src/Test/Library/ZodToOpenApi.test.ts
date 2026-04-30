import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { zodToOpenApiSchema } from '../../Library/ZodToOpenApi';
import type { ZodSchema } from '../../Types/Zod';

extendZodWithOpenApi(z);

describe('ZodToOpenApi', () => {
	describe('zodToOpenApiSchema', () => {
		it('should convert a simple GET method with path params and response', () => {
			const zodSchema: ZodSchema = {
				get: {
					description: 'Get a user by ID',
					params: z.object({
						id: z.string(),
					}),
					response: {
						200: {
							description: 'User found',
							schema: z.object({
								id: z.string(),
								name: z.string(),
							}),
						},
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			expect(result.get).toBeDefined();
			expect(result.get!.description).toBe('Get a user by ID');
			expect(result.get!.parameters).toBeDefined();
			expect(result.get!.parameters!.length).toBe(1);
			expect(result.get!.parameters![0].name).toBe('id');
			expect(result.get!.parameters![0].in).toBe('path');
			expect(result.get!.parameters![0].required).toBe(true);
			expect(result.get!.responses[200]).toBeDefined();
			expect(result.get!.responses[200].content!['application/json']).toBeDefined();
		});

		it('should convert a POST method with body and response', () => {
			const zodSchema: ZodSchema = {
				post: {
					description: 'Create a user',
					body: z.object({
						name: z.string(),
						email: z.string(),
					}),
					response: {
						201: {
							description: 'User created',
							schema: z.object({
								id: z.string(),
								name: z.string(),
								email: z.string(),
							}),
						},
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			expect(result.post).toBeDefined();
			expect(result.post!.description).toBe('Create a user');
			expect(result.post!.requestBody).toBeDefined();

			const bodySchema = result.post!.requestBody!.content['application/json']!.schema as any;
			expect(bodySchema.type).toBe('object');
			expect(bodySchema.properties.name).toEqual({ type: 'string' });
			expect(bodySchema.properties.email).toEqual({ type: 'string' });
			expect(bodySchema.required).toContain('name');
			expect(bodySchema.required).toContain('email');
		});

		it('should convert query parameters', () => {
			const zodSchema: ZodSchema = {
				get: {
					description: 'List users',
					query: z.object({
						page: z.string().optional(),
						limit: z.string().optional(),
					}),
					response: {
						200: {
							description: 'List of users',
							schema: z.array(z.object({ id: z.string() })),
						},
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			expect(result.get).toBeDefined();
			expect(result.get!.parameters).toBeDefined();

			const queryParams = result.get!.parameters!.filter(p => p.in === 'query');
			expect(queryParams.length).toBe(2);
			expect(queryParams.find(p => p.name === 'page')).toBeDefined();
			expect(queryParams.find(p => p.name === 'limit')).toBeDefined();
			expect(queryParams.find(p => p.name === 'page')!.required).toBe(false);
		});

		it('should convert both path and query params together', () => {
			const zodSchema: ZodSchema = {
				get: {
					description: 'Get user items',
					params: z.object({ userId: z.string() }),
					query: z.object({ filter: z.string().optional() }),
					response: {
						200: {
							description: 'Items retrieved',
							schema: z.array(z.object({ id: z.string() })),
						},
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			const pathParams = result.get!.parameters!.filter(p => p.in === 'path');
			const queryParams = result.get!.parameters!.filter(p => p.in === 'query');
			expect(pathParams.length).toBe(1);
			expect(pathParams[0].name).toBe('userId');
			expect(queryParams.length).toBe(1);
			expect(queryParams[0].name).toBe('filter');
		});

		it('should handle multiple methods in one schema', () => {
			const zodSchema: ZodSchema = {
				get: {
					description: 'Get resource',
					params: z.object({ id: z.string() }),
					response: {
						200: { description: 'Found', schema: z.object({ id: z.string() }) },
					},
				},
				post: {
					description: 'Create resource',
					body: z.object({ name: z.string() }),
					response: {
						201: { description: 'Created', schema: z.object({ id: z.string() }) },
					},
				},
				delete: {
					description: 'Delete resource',
					params: z.object({ id: z.string() }),
					response: {
						200: { description: 'Deleted', schema: z.object({ success: z.boolean() }) },
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			expect(result.get).toBeDefined();
			expect(result.post).toBeDefined();
			expect(result.delete).toBeDefined();
			expect(result.get!.description).toBe('Get resource');
			expect(result.post!.description).toBe('Create resource');
			expect(result.delete!.description).toBe('Delete resource');
		});

		it('should handle security definitions', () => {
			const zodSchema: ZodSchema = {
				get: {
					description: 'Protected endpoint',
					security: [{ bearerAuth: [] }],
					response: {
						200: { description: 'Success', schema: z.object({ data: z.string() }) },
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			expect(result.get!.security).toBeDefined();
			expect(result.get!.security).toEqual([{ bearerAuth: [] }]);
		});

		it('should handle schema with no response (defaults to 200 Success)', () => {
			const zodSchema: ZodSchema = {
				delete: {
					description: 'Delete something',
					params: z.object({ id: z.string() }),
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			expect(result.delete).toBeDefined();
			expect(result.delete!.responses[200]).toBeDefined();
		});

		it('should return empty schema for empty input', () => {
			const result = zodToOpenApiSchema({});
			expect(result).toEqual({});
		});

		it('should correctly convert optional vs required fields in body', () => {
			const zodSchema: ZodSchema = {
				post: {
					description: 'Mixed required/optional',
					body: z.object({
						required_field: z.string(),
						optional_field: z.string().optional(),
					}),
					response: {
						200: { description: 'Ok', schema: z.object({ ok: z.boolean() }) },
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			const bodySchema = result.post!.requestBody!.content['application/json']!.schema as any;
			expect(bodySchema.required).toContain('required_field');
			expect(bodySchema.required).not.toContain('optional_field');
		});

		it('should handle number and boolean types in schemas', () => {
			const zodSchema: ZodSchema = {
				post: {
					description: 'Diverse types',
					body: z.object({
						name: z.string(),
						age: z.number(),
						active: z.boolean(),
					}),
					response: {
						200: { description: 'Ok', schema: z.object({ success: z.boolean() }) },
					},
				},
			};

			const result = zodToOpenApiSchema(zodSchema);

			const bodySchema = result.post!.requestBody!.content['application/json']!.schema as any;
			expect(bodySchema.properties.name.type).toBe('string');
			expect(bodySchema.properties.age.type).toBe('number');
			expect(bodySchema.properties.active.type).toBe('boolean');
		});
	});
});
