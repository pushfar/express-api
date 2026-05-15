import { z } from 'zod';
import Controller from '../Controller';
import RestError from '../../Error/Rest';
import Request from '../../System/Request';
import { zodToOpenApiSchema, OpenApiSchema } from '../../Library/ZodToOpenApi';
import { GlobalsType } from '../../Types/System';
import type { ZodSchema, ZodMethodSchema } from '../../Types/Zod';

export type { ZodSchema };

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

// Extract the TypeScript output type from any Zod schema via its _output property.
// Returns any when T is undefined/never so that untyped callers stay permissive.
type ZodOut<T> = T extends { _output: infer O } ? O : any;

// Infer the TypeScript type for a specific schema field ('body' | 'params' | 'query') on a given method.
// Falls back to any when the field is optional (undefined is assignable), which is the case for the
// default ZodSchema constraint where all fields are typed as ZodType<any> | undefined.
type ParsedField<TSchema extends ZodSchema, M extends keyof TSchema, F extends keyof ZodMethodSchema> =
	undefined extends TSchema[M][F] ? any : ZodOut<TSchema[M][F]>;

// Infer the parsed response type for a given method and status code.
type ParsedOutput<TSchema extends ZodSchema, M extends keyof TSchema, StatusCode extends number = 200> =
	StatusCode extends keyof NonNullable<TSchema[M]['response']>
		? NonNullable<TSchema[M]['response']>[StatusCode] extends { schema: infer S }
			? ZodOut<S>
			: any
		: any;

/**
 * @module express-api/Base/Controller/ApiZod
 * @class ApiZod
 * @extends Controller
 * @description Base class for API controllers using Zod schemas for validation and OpenAPI generation.
 *
 * To get fully inferred types from parse methods, pass the concrete schema type as the second generic:
 *
 *   const schema = { post: { description: '...', body: z.object({ name: z.string() }) } } satisfies ZodSchema;
 *   class MyController extends ApiZod<Globals, typeof schema> { static get zodSchema() { return schema; } }
 *
 * Then `this.parseBody(request, 'post')` returns `{ name: string }` instead of `any`.
 * When the method is omitted and auto-detected from the call stack, the return type is `any`.
 *
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default abstract class ApiZod<T extends GlobalsType, TSchema extends ZodSchema = ZodSchema> extends Controller<T> {
	/**
	 * @public @static @get zodSchema
	 * @description Zod-based schema definitions for this endpoint. Override in subclass.
	 * @returns The Zod schema definition for this endpoint
	 */
	static get zodSchema(): ZodSchema {
		throw new Error('zodSchema must be overridden in subclass');
	}

	/**
	 * @public @method options
	 * @description Return metadata documentation on the endpoint as OpenAPI fragment (auto-converted from zodSchema)
	 * @returns The documentation for this endpoint
	 */
	options(): OpenApiSchema {
		return zodToOpenApiSchema((this.constructor as typeof ApiZod).zodSchema);
	}

	/**
	 * @public parseBody
	 * @description Parse and validate the request body against the Zod schema defined in zodSchema().
	 * Passing method as a string literal (e.g. 'post') returns a fully typed result when TSchema is provided.
	 * Omitting method triggers auto-detection from the call stack and returns any.
	 * @param request The http request passed in to the system
	 * @param method The optional method to use if auto detection fails
	 * @returns The validated body data
	 */
	public parseBody<M extends keyof TSchema & HttpMethod>(request: Request, method: M): ParsedField<TSchema, M, 'body'>;
	public parseBody(request: Request, method?: HttpMethod): any;
	public parseBody(request: Request, method?: string): any {
		const m = method || this.getCallingMethod();
		const methodSchema = this.__getMethodSchema(m);
		if (!methodSchema.body) throw new RestError('Body schema not defined for method ' + m, 400);

		const result = methodSchema.body.safeParse(request.body);
		if (!result.success) {
			throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
		}
		return result.data;
	}

	/**
	 * @public parsePathParameters
	 * @description Parse and validate the path parameters against the Zod schema defined in zodSchema().
	 * Passing method as a string literal (e.g. 'get') returns a fully typed result when TSchema is provided.
	 * Omitting method triggers auto-detection from the call stack and returns any.
	 * @param request The http request passed in to the system
	 * @param method The optional method to use if auto detection fails
	 * @returns The validated path parameter data
	 */
	public parsePathParameters<M extends keyof TSchema & HttpMethod>(request: Request, method: M): ParsedField<TSchema, M, 'params'>;
	public parsePathParameters(request: Request, method?: HttpMethod): any;
	public parsePathParameters(request: Request, method?: string): any {
		const m = method || this.getCallingMethod();
		const methodSchema = this.__getMethodSchema(m);
		if (!methodSchema.params) throw new RestError('Path parameters schema not defined for method ' + m, 400);

		const result = methodSchema.params.safeParse(request.parameters.path);
		if (!result.success) {
			throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
		}
		return result.data;
	}

	/**
	 * @public parseQueryParameters
	 * @description Parse and validate the query parameters against the Zod schema defined in zodSchema().
	 * Passing method as a string literal (e.g. 'get') returns a fully typed result when TSchema is provided.
	 * Omitting method triggers auto-detection from the call stack and returns any.
	 * @param request The http request passed in to the system
	 * @param method The optional method to use if auto detection fails
	 * @returns The validated query parameter data
	 */
	public parseQueryParameters<M extends keyof TSchema & HttpMethod>(request: Request, method: M): ParsedField<TSchema, M, 'query'>;
	public parseQueryParameters(request: Request, method?: HttpMethod): any;
	public parseQueryParameters(request: Request, method?: string): any {
		const m = method || this.getCallingMethod();
		const methodSchema = this.__getMethodSchema(m);
		if (!methodSchema.query) throw new RestError('Query parameters schema not defined for method ' + m, 400);

		const result = methodSchema.query.safeParse(request.parameters.query);
		if (!result.success) {
			throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
		}
		return result.data;
	}

	/**
	 * @public parseOutput
	 * @description Parse and validate response output against the Zod schema defined in zodSchema().
	 * Passing method as a string literal and statusCode as a numeric literal returns a fully typed result when TSchema is provided.
	 * Omitting method triggers auto-detection from the call stack and returns any.
	 * @param data The response data to send out in a response
	 * @param method The optional method to use if auto detection fails
	 * @param statusCode The HTTP status code to select the response schema (defaults to 200)
	 * @returns The validated output data
	 */
	public parseOutput<M extends keyof TSchema & HttpMethod, StatusCode extends number = 200>(data: any, method: M, statusCode?: StatusCode): ParsedOutput<TSchema, M, StatusCode>;
	public parseOutput(data: any, method?: HttpMethod, statusCode?: number): any;
	public parseOutput(data: any, method?: string, statusCode: number = 200): any {
		const m = method || this.getCallingMethod();
		const methodSchema = this.__getMethodSchema(m);
		if (!methodSchema.response) throw new RestError('Response schema not defined for method ' + m, 400);

		const responseSchema = methodSchema.response[statusCode];
		if (!responseSchema) throw new RestError(`Response schema not defined for method ${m} status ${statusCode}`, 400);

		const result = responseSchema.schema.safeParse(data);
		if (!result.success) {
			throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
		}
		return result.data;
	}

	/**
	 * @private __getMethodSchema
	 * @description Get the ZodMethodSchema for a given HTTP method from zodSchema()
	 * @param method The HTTP method
	 * @returns The method schema
	 */
	private __getMethodSchema(method: string): ZodMethodSchema {
		const schema = (this.constructor as typeof ApiZod).zodSchema[method];
		if (!schema) throw new RestError(`Schema not defined for method ${method}`, 400);
		return schema;
	}

	/**
	 * @protected getCallingMethod
	 * @description Attempts to detect the calling method name from the call stack
	 * @returns The detected method name
	 */
	protected getCallingMethod(): HttpMethod {
		try {
			const stack = new Error().stack;
			if (!stack) throw new Error('not found');

			const stackLines = stack.split('\n');
			for (let i = 2; i < Math.min(stackLines.length, 6); i++) {
				const line = stackLines[i];
				// Use word boundary so e.g. getCallingMethod is not mistaken for "get"
				const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];
				for (const method of methods) {
					if (new RegExp(`\\.${method}\\b`).test(line)) return method;
				}
			}
		} catch {}

		throw new Error('Could not determine HTTP method. Please provide method parameter or ensure parseOutput is called from a method named get, post, put, patch, or delete.');
	}
}
