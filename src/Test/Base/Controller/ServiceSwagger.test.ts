import { jest } from '@jest/globals';
import ServiceSwagger from '../../../Base/Controller/ServiceSwagger';
import Request from '../../../System/Request';
import SchemaTools from '../../../Library/SchemaTools';
import RestError from '../../../Error/Rest';
import { GlobalsType } from '../../../Types/System';

class TestServiceSwagger extends ServiceSwagger<GlobalsType> {
	public options() {
		return {
			post: {
				description: 'Process service request',
				requestBody: {
					content: {
						'application/json': {
							schema: {
								type: 'object' as const,
								required: ['action'],
								properties: {
									action: { description: 'Action', type: 'string' as const },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Success',
						content: {
							'application/json': {
								schema: {
									type: 'object' as const,
									properties: {
										success: { description: 'Success flag', type: 'boolean' as const },
									},
								},
							},
						},
					},
				},
			},
		} as any;
	}

	public async post(request: Request) {
		const body = this.parseBody(request);
		return { body: { success: true }, status: 200 };
	}
}

const mockGlobals: GlobalsType = {
	$environment: { NODE_ENV: 'test' },
	$client: { id: 'test-client' },
	$services: {},
	$socket: {} as any,
	$io: {} as any,
};

describe('ServiceSwagger', () => {
	let service: TestServiceSwagger;
	let mockRequest: any;

	beforeEach(() => {
		service = new TestServiceSwagger(mockGlobals);
		mockRequest = {
			body: { action: 'do_thing' },
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
		} as any;
	});

	describe('parseBody', () => {
		it('should parse body successfully', () => {
			const mockBody = { action: 'do_thing' };
			jest.spyOn(SchemaTools, 'parseBody').mockReturnValue(mockBody as any);

			const result = service.parseBody(mockRequest);
			expect(result).toEqual(mockBody);
			expect(SchemaTools.parseBody).toHaveBeenCalledWith(
				mockRequest,
				service.options().post,
				expect.stringContaining('TestServiceSwagger:post:')
			);
		});

		it('should throw RestError on schema validation error', () => {
			jest.spyOn(SchemaTools, 'parseBody').mockImplementation(() => {
				throw new Error('Validation failed');
			});

			expect(() => service.parseBody(mockRequest)).toThrow(RestError);
			expect(() => service.parseBody(mockRequest)).toThrow('Validation failed');
		});
	});

	describe('parseOutput', () => {
		it('should parse output successfully', () => {
			const mockOutput = { success: true };
			jest.spyOn(SchemaTools, 'parseOutput').mockReturnValue(mockOutput as any);

			const result = service.parseOutput({ success: true });
			expect(result).toEqual(mockOutput);
			expect(SchemaTools.parseOutput).toHaveBeenCalledWith(
				{ success: true },
				service.options().post,
				expect.stringContaining('TestServiceSwagger:post:'),
				200
			);
		});

		it('should throw RestError on validation error', () => {
			jest.spyOn(SchemaTools, 'parseOutput').mockImplementation(() => {
				throw new Error('Output validation failed');
			});

			expect(() => service.parseOutput({ data: 'test' })).toThrow(RestError);
			expect(() => service.parseOutput({ data: 'test' })).toThrow('Output validation failed');
		});
	});

	describe('options', () => {
		it('should return the schema with post method', () => {
			const options = service.options();
			expect(options.post).toBeDefined();
			expect(options.post.description).toBe('Process service request');
		});
	});
});
