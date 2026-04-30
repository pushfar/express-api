import { jest } from '@jest/globals';
import ApiSwagger from '../../../Base/Controller/ApiSwagger';
import Request from '../../../System/Request';
import SchemaTools from '../../../Library/SchemaTools';
import RestError from '../../../Error/Rest';
import { GlobalsType } from '../../../Types/System';

class TestApiSwagger extends ApiSwagger<GlobalsType> {
	public options() {
		return {
			get: {
				parameters: [
					{
						name: 'id',
						in: 'path' as const,
						required: true,
						schema: { type: 'string' }
					}
				],
				responses: {
					200: {
						content: {
							'application/json': {
								schema: { type: 'object' }
							}
						}
					}
				}
			},
			post: {
				requestBody: {
					content: {
						'application/json': {
							schema: { type: 'object' }
						}
					}
				},
				responses: {
					200: {
						content: {
							'application/json': {
								schema: { type: 'object' }
							}
						}
					}
				}
			},
		} as any;
	}

	public async get(request: Request) {
		return { body: { id: 'test' }, status: 200 };
	}

	public async post(request: Request) {
		return { body: { created: true }, status: 201 };
	}
}

const mockGlobals: GlobalsType = {
	$environment: { NODE_ENV: 'test' },
	$client: { id: 'test-client' },
	$services: {},
	$socket: {} as any,
	$io: {} as any,
};

describe('ApiSwagger', () => {
	let api: TestApiSwagger;
	let mockRequest: any;

	beforeEach(() => {
		api = new TestApiSwagger(mockGlobals);
		mockRequest = {
			body: { name: 'test' },
			parameters: {
				path: { id: '123' },
				query: { id: '456' }
			},
			headers: {},
			method: 'post',
			path: '/test',
			resource: { path: '/test' },
			context: {},
			access: {},
			type: 'express',
			source: 'route',
			requests: []
		} as any;
	});

	describe('parseBody', () => {
		it('should parse body successfully', () => {
			const mockBody = { name: 'test' };
			jest.spyOn(SchemaTools, 'parseBody').mockReturnValue(mockBody as any);

			const result = api.parseBody(mockRequest, 'post');
			expect(result).toEqual(mockBody);
			expect(SchemaTools.parseBody).toHaveBeenCalledWith(
				mockRequest,
				api.options().post,
				expect.stringContaining('TestApiSwagger:post:')
			);
		});

		it('should throw RestError on schema validation error', () => {
			jest.spyOn(SchemaTools, 'parseBody').mockImplementation(() => {
				throw new Error('Validation failed');
			});

			expect(() => api.parseBody(mockRequest, 'post')).toThrow(RestError);
			expect(() => api.parseBody(mockRequest, 'post')).toThrow('Validation failed');
		});
	});

	describe('parsePathParameters', () => {
		it('should parse path parameters successfully', () => {
			const mockParams = { id: '123' };
			jest.spyOn(SchemaTools, 'parsePathParameters').mockReturnValue(mockParams as any);

			const result = api.parsePathParameters(mockRequest, 'get');
			expect(result).toEqual(mockParams);
		});

		it('should throw RestError on validation error', () => {
			jest.spyOn(SchemaTools, 'parsePathParameters').mockImplementation(() => {
				throw new Error('Path parameter validation failed');
			});

			expect(() => api.parsePathParameters(mockRequest, 'get')).toThrow(RestError);
		});
	});

	describe('parseQueryParameters', () => {
		it('should throw RestError on validation error', () => {
			jest.spyOn(SchemaTools, 'parseQueryParameters').mockImplementation(() => {
				throw new Error('Query parameter validation failed');
			});

			expect(() => api.parseQueryParameters(mockRequest, 'get')).toThrow(RestError);
		});
	});

	describe('parseOutput', () => {
		it('should parse output successfully', () => {
			const mockOutput = { result: 'success' };
			jest.spyOn(SchemaTools, 'parseOutput').mockReturnValue(mockOutput as any);

			const result = api.parseOutput({ data: 'test' }, 'post');
			expect(result).toEqual(mockOutput);
		});

		it('should throw RestError on validation error', () => {
			jest.spyOn(SchemaTools, 'parseOutput').mockImplementation(() => {
				throw new Error('Output validation failed');
			});

			expect(() => api.parseOutput({ data: 'test' }, 'post')).toThrow(RestError);
		});
	});

	describe('getCallingMethod', () => {
		it('should throw when method cannot be determined from stack', () => {
			expect(() => (api as any).getCallingMethod()).toThrow('Could not determine HTTP method');
		});
	});
});
