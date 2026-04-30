import { z } from 'zod';
import { extendZodWithOpenApi, OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
extendZodWithOpenApi(z);
/**
 * @module express-api/Library/ZodToOpenApi
 * @description Converts a ZodSchema into an OpenAPI fragment format,
 * bridging Zod-based definitions with the legacy OPTIONS / Index spec builder.
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export function zodToOpenApiSchema(zodSchema) {
    const registry = new OpenAPIRegistry();
    const result = {};
    for (const method of Object.keys(zodSchema)) {
        const methodSchema = zodSchema[method];
        const routeConfig = {
            method: method,
            path: '/__internal__',
            description: methodSchema.description,
            responses: {},
        };
        if (methodSchema.security) {
            routeConfig.security = methodSchema.security;
        }
        if (methodSchema.params || methodSchema.query) {
            routeConfig.request = routeConfig.request || {};
            if (methodSchema.params)
                routeConfig.request.params = methodSchema.params;
            if (methodSchema.query)
                routeConfig.request.query = methodSchema.query;
        }
        if (methodSchema.body) {
            routeConfig.request = routeConfig.request || {};
            routeConfig.request.body = {
                content: {
                    'application/json': {
                        schema: methodSchema.body,
                    },
                },
            };
        }
        if (methodSchema.response) {
            for (const [statusCode, responseDef] of Object.entries(methodSchema.response)) {
                routeConfig.responses[statusCode] = {
                    description: responseDef.description,
                    content: {
                        'application/json': {
                            schema: responseDef.schema,
                        },
                    },
                };
            }
        }
        else {
            routeConfig.responses['200'] = { description: 'Success' };
        }
        registry.registerPath(routeConfig);
    }
    const generator = new OpenApiGeneratorV31(registry.definitions);
    const doc = generator.generateDocument({
        openapi: '3.1.0',
        info: { title: 'internal', version: '0.0.0' },
    });
    const pathItem = doc.paths?.['/__internal__'];
    if (!pathItem)
        return result;
    for (const method of Object.keys(zodSchema)) {
        const generated = pathItem[method];
        if (generated) {
            result[method] = generated;
        }
    }
    return result;
}
//# sourceMappingURL=ZodToOpenApi.js.map