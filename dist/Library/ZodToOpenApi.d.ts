import type { ZodSchema } from '../Types/Zod.js';
import type { SwaggerSchemaMethodType } from '../Types/Swagger.js';
export type OpenApiSchema = {
    [method: string]: SwaggerSchemaMethodType;
};
/**
 * @module express-api/Library/ZodToOpenApi
 * @description Converts a ZodSchema into an OpenAPI fragment format,
 * bridging Zod-based definitions with the legacy OPTIONS / Index spec builder.
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export declare function zodToOpenApiSchema(zodSchema: ZodSchema): OpenApiSchema;
//# sourceMappingURL=ZodToOpenApi.d.ts.map