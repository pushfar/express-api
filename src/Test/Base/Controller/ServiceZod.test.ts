import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import ServiceZod from '../../../Base/Controller/ServiceZod';
import Request from '../../../System/Request';
import RestError from '../../../Error/Rest';
import { GlobalsType } from '../../../Types/System';
import type { ZodServiceSchema } from '../../../Types/Zod';

extendZodWithOpenApi(z);

class TestServiceZod extends ServiceZod<GlobalsType> {
	static get zodSchema(): ZodServiceSchema {
		return {
			post: {
				description: 'Process a service action',
				body: z.object({
					action: z.string(),
					payload: z.object({
						id: z.string(),
						value: z.number(),
					}),
				}),
				response: {
					200: {
						description: 'Action processed',
						schema: z.object({
							success: z.boolean(),
							result: z.string(),
						}),
					},
					202: {
						description: 'Action accepted for processing',
						schema: z.object({
							queued: z.boolean(),
						}),
					},
				},
			},
		};
	}

	public async post(request: Request) {
		const body = this.parseBody(request);
		const output = this.parseOutput({ success: true, result: body.action });
		return { body: output, status: 200 };
	}
}

const mockGlobals: GlobalsType = {
	$environment: { NODE_ENV: 'test' },
	$client: { id: 'test-client' },
	$services: {},
	$socket: {} as any,
	$io: {} as any,
};

describe('ServiceZod', () => {
	let service: TestServiceZod;
	let mockRequest: any;

	beforeEach(() => {
		service = new TestServiceZod(mockGlobals);
		mockRequest = {
			body: { action: 'do_thing', payload: { id: '123', value: 42 } },
			parameters: { path: {}, query: {} },
			headers: {},
			method: 'post',
			path: '/service',
			resource: { path: '/service' },
			context: {},
			access: {},
			type: 'express',
			source: 'route',
			requests: [],
		};
	});

	describe('parseBody', () => {
		it('should parse valid body from zodSchema schema', () => {
			const result = service.parseBody(mockRequest);
			expect(result).toEqual({ action: 'do_thing', payload: { id: '123', value: 42 } });
		});

		it('should strip unrecognised keys from body', () => {
			mockRequest.body = { action: 'do_thing', payload: { id: '123', value: 42 }, extra: 'nope' };
			const result = service.parseBody(mockRequest);
			expect(result).toEqual({ action: 'do_thing', payload: { id: '123', value: 42 } });
			expect((result as any).extra).toBeUndefined();
		});

		it('should throw RestError on invalid body', () => {
			mockRequest.body = { action: 123 };
			expect(() => service.parseBody(mockRequest)).toThrow(RestError);
		});

		it('should throw RestError with 400 status on validation failure', () => {
			mockRequest.body = {};
			try {
				service.parseBody(mockRequest);
				fail('Should have thrown');
			} catch (err: any) {
				expect(err).toBeInstanceOf(RestError);
				expect(err.status).toBe(400);
			}
		});

		it('should include field path in error message for nested fields', () => {
			mockRequest.body = { action: 'test', payload: { id: '123', value: 'not_a_number' } };
			try {
				service.parseBody(mockRequest);
				fail('Should have thrown');
			} catch (err: any) {
				expect(err.message).toContain('payload.value');
			}
		});
	});

	describe('parseOutput', () => {
		it('should parse valid output for default status 200', () => {
			const data = { success: true, result: 'done' };
			const result = service.parseOutput(data);
			expect(result).toEqual(data);
		});

		it('should parse output for a specific status code', () => {
			const data = { queued: true };
			const result = service.parseOutput(data, 202);
			expect(result).toEqual(data);
		});

		it('should strip unrecognised keys from output', () => {
			const data = { success: true, result: 'done', internal: 'secret' };
			const result = service.parseOutput(data);
			expect(result).toEqual({ success: true, result: 'done' });
			expect((result as any).internal).toBeUndefined();
		});

		it('should throw RestError on invalid output data', () => {
			const data = { success: 'not_boolean', result: 123 };
			expect(() => service.parseOutput(data)).toThrow(RestError);
		});

		it('should throw if status code response not defined', () => {
			expect(() => service.parseOutput({}, 404)).toThrow(RestError);
			expect(() => service.parseOutput({}, 404)).toThrow('Response schema not defined for service status 404');
		});
	});

	describe('zodSchema() and options()', () => {
		it('should generate options() from zodSchema() automatically', () => {
			const options = service.options();
			expect(options.post).toBeDefined();
			expect(options.post!.description).toBe('Process a service action');
		});

		it('should produce valid OpenAPI requestBody from zodSchema()', () => {
			const options = service.options();
			expect(options.post!.requestBody).toBeDefined();
			const bodySchema = options.post!.requestBody!.content['application/json']!.schema as any;
			expect(bodySchema.type).toBe('object');
			expect(bodySchema.properties.action).toBeDefined();
			expect(bodySchema.properties.payload).toBeDefined();
		});

		it('should produce valid OpenAPI response from zodSchema()', () => {
			const options = service.options();
			expect(options.post!.responses[200]).toBeDefined();
			const responseContent = (options.post!.responses[200] as any).content['application/json'];
			expect(responseContent).toBeDefined();
			expect(responseContent.schema.properties.success.type).toBe('boolean');
			expect(responseContent.schema.properties.result.type).toBe('string');
		});
	});
});
