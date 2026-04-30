import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import ApiZod from '../../../Base/Controller/ApiZod';
import Request from '../../../System/Request';
import RestError from '../../../Error/Rest';
import { GlobalsType } from '../../../Types/System';
import type { ZodSchema } from '../../../Types/Zod';

extendZodWithOpenApi(z);

class TestApiZod extends ApiZod<GlobalsType> {
	static get zodSchema(): ZodSchema {
		return {
			get: {
				description: 'Get a user by ID',
				params: z.object({
					id: z.string(),
				}),
				query: z.object({
					include: z.string().optional(),
				}),
				response: {
					200: {
						description: 'User found',
						schema: z.object({
							id: z.string(),
							name: z.string(),
							email: z.string(),
						}),
					},
				},
			},
			post: {
				description: 'Create a user',
				body: z.object({
					name: z.string(),
					email: z.string(),
					password: z.string().meta({ sensitive: true }),
				}),
				response: {
					200: {
						description: 'User already exists',
						schema: z.object({
							id: z.string(),
							name: z.string(),
							email: z.string(),
						}),
					},
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
	}

	public async get(request: Request) {
		const params = this.parsePathParameters(request);
		const output = this.parseOutput({ id: params.id, name: 'test', email: 'test@test.com' });
		return { body: output, status: 200 };
	}

	public async post(request: Request) {
		const body = this.parseBody(request);
		const output = this.parseOutput({ id: '1', name: body.name, email: body.email }, undefined, 201);
		return { body: output, status: 201 };
	}
}

const mockGlobals: GlobalsType = {
	$environment: { NODE_ENV: 'test' },
	$client: { id: 'test-client' },
	$services: {},
	$socket: {} as any,
	$io: {} as any,
};

describe('ApiZod', () => {
	let api: TestApiZod;
	let mockRequest: any;

	beforeEach(() => {
		api = new TestApiZod(mockGlobals);
		mockRequest = {
			body: { name: 'John', email: 'john@example.com', password: 'secret123' },
			parameters: {
				path: { id: '123' },
				query: { include: 'profile' },
			},
			headers: {},
			method: 'post',
			path: '/test',
			resource: { path: '/test' },
			context: {},
			access: {},
			type: 'express',
			source: 'route',
			requests: [],
		};
	});

	describe('parseBody', () => {
		it('should parse valid body using zodSchema schema', () => {
			const result = api.parseBody(mockRequest, 'post');
			expect(result).toEqual({ name: 'John', email: 'john@example.com', password: 'secret123' });
		});

		it('should strip unrecognised keys from body', () => {
			mockRequest.body = { name: 'John', email: 'john@example.com', password: 'secret', extra: 'field' };
			const result = api.parseBody(mockRequest, 'post');
			expect(result).toEqual({ name: 'John', email: 'john@example.com', password: 'secret' });
			expect((result as any).extra).toBeUndefined();
		});

		it('should throw RestError on invalid body', () => {
			mockRequest.body = { name: 123 };
			expect(() => api.parseBody(mockRequest, 'post')).toThrow(RestError);
		});

		it('should throw RestError with 400 status on validation failure', () => {
			mockRequest.body = {};
			try {
				api.parseBody(mockRequest, 'post');
				fail('Should have thrown');
			} catch (err: any) {
				expect(err).toBeInstanceOf(RestError);
				expect(err.status).toBe(400);
			}
		});

		it('should include field path in error message', () => {
			mockRequest.body = { name: 123, email: 'valid@email.com', password: 'pass' };
			try {
				api.parseBody(mockRequest, 'post');
				fail('Should have thrown');
			} catch (err: any) {
				expect(err.message).toContain('name');
			}
		});

		it('should throw if body schema not defined for method', () => {
			expect(() => api.parseBody(mockRequest, 'get')).toThrow(RestError);
			expect(() => api.parseBody(mockRequest, 'get')).toThrow('Body schema not defined for method get');
		});
	});

	describe('parsePathParameters', () => {
		it('should parse valid path parameters', () => {
			const result = api.parsePathParameters(mockRequest, 'get');
			expect(result).toEqual({ id: '123' });
		});

		it('should throw RestError on invalid path parameters', () => {
			mockRequest.parameters.path = { id: 123 };
			expect(() => api.parsePathParameters(mockRequest, 'get')).toThrow(RestError);
		});

		it('should strip unrecognised keys from path parameters', () => {
			mockRequest.parameters.path = { id: '123', extra: 'value' };
			const result = api.parsePathParameters(mockRequest, 'get');
			expect(result).toEqual({ id: '123' });
		});

		it('should throw if path params schema not defined for method', () => {
			expect(() => api.parsePathParameters(mockRequest, 'post')).toThrow(RestError);
			expect(() => api.parsePathParameters(mockRequest, 'post')).toThrow('Path parameters schema not defined for method post');
		});
	});

	describe('parseQueryParameters', () => {
		it('should parse valid query parameters', () => {
			const result = api.parseQueryParameters(mockRequest, 'get');
			expect(result).toEqual({ include: 'profile' });
		});

		it('should handle optional query parameters', () => {
			mockRequest.parameters.query = {};
			const result = api.parseQueryParameters(mockRequest, 'get');
			expect(result).toBeDefined();
		});

		it('should throw if query schema not defined for method', () => {
			expect(() => api.parseQueryParameters(mockRequest, 'post')).toThrow(RestError);
			expect(() => api.parseQueryParameters(mockRequest, 'post')).toThrow('Query parameters schema not defined for method post');
		});
	});

	describe('parseOutput', () => {
		it('should parse valid output data for default status 200', () => {
			const data = { id: '1', name: 'John', email: 'john@example.com' };
			const result = api.parseOutput(data, 'post');
			expect(result).toEqual(data);
		});

		it('should parse output for a specific status code', () => {
			const data = { id: '1', name: 'John', email: 'john@example.com' };
			const result = api.parseOutput(data, 'post', 201);
			expect(result).toEqual(data);
		});

		it('should strip unrecognised keys from output', () => {
			const data = { id: '1', name: 'John', email: 'john@example.com', internal: 'secret' };
			const result = api.parseOutput(data, 'post', 201);
			expect(result).toEqual({ id: '1', name: 'John', email: 'john@example.com' });
		});

		it('should throw RestError on invalid output data', () => {
			const data = { id: 123 };
			expect(() => api.parseOutput(data, 'post')).toThrow(RestError);
		});

		it('should throw if response schema not defined for status code', () => {
			const data = { id: '1', name: 'John', email: 'john@example.com' };
			expect(() => api.parseOutput(data, 'post', 404)).toThrow(RestError);
			expect(() => api.parseOutput(data, 'post', 404)).toThrow('Response schema not defined for method post status 404');
		});

		it('should throw if method has no response defined', () => {
			// Override zodSchema to create a method with no response
			const noResponseApi = new (class extends ApiZod<GlobalsType> {
				static get zodSchema() {
					return { get: { description: 'No response', params: z.object({ id: z.string() }) } };
				}
			})(mockGlobals);

			expect(() => noResponseApi.parseOutput({}, 'get')).toThrow('Response schema not defined for method get');
		});
	});

	describe('zodSchema() and options()', () => {
		it('should generate options() from zodSchema() automatically', () => {
			const options = api.options();
			expect(options.get).toBeDefined();
			expect(options.post).toBeDefined();
			expect(options.get!.description).toBe('Get a user by ID');
			expect(options.post!.description).toBe('Create a user');
		});

		it('should produce valid OpenAPI parameters from zodSchema()', () => {
			const options = api.options();
			expect(options.get!.parameters).toBeDefined();
			const pathParams = options.get!.parameters!.filter((p: any) => p.in === 'path');
			expect(pathParams.length).toBe(1);
			expect(pathParams[0].name).toBe('id');
		});

		it('should produce valid OpenAPI requestBody from zodSchema()', () => {
			const options = api.options();
			expect(options.post!.requestBody).toBeDefined();
			const bodySchema = options.post!.requestBody!.content['application/json']!.schema as any;
			expect(bodySchema.type).toBe('object');
			expect(bodySchema.properties.name).toBeDefined();
			expect(bodySchema.properties.email).toBeDefined();
		});
	});

	describe('getCallingMethod', () => {
		it('should auto-detect method when called from HTTP method handler', async () => {
			const result = await api.post(mockRequest);
			expect(result.status).toBe(201);
			expect(result.body.id).toBe('1');
		});

		it('should throw when method cannot be determined', () => {
			expect(() => (api as any).getCallingMethod()).toThrow('Could not determine HTTP method');
		});
	});
});
