import { z } from 'zod';
import Controller from '../Controller';
import RestError from '../../Error/Rest';
import Request from '../../System/Request';
import { zodToOpenApiSchema, OpenApiSchema } from '../../Library/ZodToOpenApi';
import { GlobalsType } from '../../Types/System';
import type { ZodServiceSchema } from '../../Types/Zod';

export type { ZodServiceSchema };

// Extract the TypeScript output type from any Zod schema via its _output property.
// Returns any when T is undefined/never so that untyped callers stay permissive.
type ZodOut<T> = T extends { _output: infer O } ? O : any;

// Infer the parsed body type from the post method schema.
// Falls back to any when the body field is optional (i.e. undefined is assignable to it),
// which is the case for the default ZodServiceSchema constraint.
type ParsedBody<TSchema extends ZodServiceSchema> =
	undefined extends TSchema['post']['body'] ? any : ZodOut<TSchema['post']['body']>;

// Infer the parsed response type from the post method schema for a given status code.
type ParsedResponse<TSchema extends ZodServiceSchema, StatusCode extends number = 200> =
	StatusCode extends keyof NonNullable<TSchema['post']['response']>
		? NonNullable<TSchema['post']['response']>[StatusCode] extends { schema: infer S }
			? ZodOut<S>
			: any
		: any;

/**
 * @module express-api/Base/Controller/ServiceZod
 * @class ServiceZod
 * @extends Controller
 * @description Base class for service controllers using Zod schemas for validation and OpenAPI generation. Services are POST-only.
 *
 * To get fully inferred types from parseBody and parseOutput, pass the concrete schema type as the second generic:
 *
 *   const schema = { post: { description: '...', body: z.object({ name: z.string() }) } } satisfies ZodServiceSchema;
 *   class MyService extends ServiceZod<Globals, typeof schema> { static get zodSchema() { return schema; } }
 *
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default abstract class ServiceZod<T extends GlobalsType, TSchema extends ZodServiceSchema = ZodServiceSchema> extends Controller<T> {
	/**
	 * @public @static @get zodSchema
	 * @description Zod-based schema definitions for this service endpoint (post only). Override in subclass.
	 * @returns The Zod schema definition for this endpoint
	 */
	static get zodSchema(): ZodServiceSchema {
		throw new Error('zodSchema must be overridden in subclass');
	}

	/**
	 * @public @method options
	 * @description Return metadata documentation on the endpoint as OpenAPI fragment (auto-converted from zodSchema)
	 * @returns The documentation for this endpoint
	 */
	options(): OpenApiSchema {
		return zodToOpenApiSchema((this.constructor as typeof ServiceZod).zodSchema);
	}

	/**
	 * @public parseBody
	 * @description Parse and validate the request body against the Zod schema defined in zodSchema.post.body.
	 * Returns a fully typed result when TSchema is provided as a class generic (e.g. ServiceZod<G, typeof schema>).
	 * @param request The http request passed in to the system
	 * @returns The validated body data
	 */
	public parseBody(request: Request): ParsedBody<TSchema> {
		const methodSchema = (this.constructor as typeof ServiceZod).zodSchema.post;
		if (!methodSchema.body) throw new RestError('Body schema not defined for service', 400);

		const result = methodSchema.body.safeParse(request.body);
		if (!result.success) {
			throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
		}
		return result.data as ParsedBody<TSchema>;
	}

	/**
	 * @public parseOutput
	 * @description Parse and validate response output against the Zod schema defined in zodSchema.post.response.
	 * Returns a fully typed result when TSchema is provided as a class generic and statusCode is a numeric literal.
	 * @param data The response data to send out in a response
	 * @param statusCode The HTTP status code to select the response schema (defaults to 200)
	 * @returns The validated output data
	 */
	public parseOutput<StatusCode extends number = 200>(data: any, statusCode?: StatusCode): ParsedResponse<TSchema, StatusCode> {
		const methodSchema = (this.constructor as typeof ServiceZod).zodSchema.post;
		if (!methodSchema.response) throw new RestError('Response schema not defined for service', 400);

		const code = (statusCode ?? 200) as number;
		const responseSchema = methodSchema.response[code];
		if (!responseSchema) throw new RestError(`Response schema not defined for service status ${code}`, 400);

		const result = responseSchema.schema.safeParse(data);
		if (!result.success) {
			throw new RestError(result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '), 400);
		}
		return result.data as ParsedResponse<TSchema, StatusCode>;
	}
}
