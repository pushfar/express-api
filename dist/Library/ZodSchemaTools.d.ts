import { z } from 'zod';
/**
 * @module express-api/Library/ZodSchemaTools
 * @class ZodSchemaTools
 * @description Utility class providing Zod schema tools including redaction of sensitive fields
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default class ZodSchemaTools {
    /**
     * @public @static redact
     * @description Returns a deep copy of data with sensitive fields replaced by '[Redacted]' and circular references replaced by '[Circular Reference]'.
     * Fields are marked sensitive via .meta({ sensitive: true }) on the Zod schema.
     * Does not mutate the original data.
     * @param data The parsed data object to redact
     * @param schema The Zod schema that describes the data shape
     * @param replacement The replacement string for sensitive values (defaults to '[Redacted]')
     * @returns A new object with sensitive fields redacted
     */
    static redact<T>(data: T, schema: z.ZodType, replacement?: string): T;
    /**
     * @public @static safeStringify
     * @description Safely JSON-stringifies data, handling circular references and optionally redacting sensitive fields.
     * @param data The data to stringify
     * @param schema Optional Zod schema — when provided, sensitive fields are redacted before stringifying
     * @param replacement The replacement string for sensitive values (defaults to '[REDACTED]')
     * @returns A JSON string with circular references and globals handled, and sensitive fields redacted if schema provided
     */
    static safeStringify(data: any, schema?: z.ZodType, replacement?: string): string;
    /**
     * @public @async getCircularReplacer
     * @description Get a circular replacer for safe logging
     * @returns A circular replacer function
     */
    private static __getCircularReplacer;
    private static __redactValue;
    private static __redactObject;
}
//# sourceMappingURL=ZodSchemaTools.d.ts.map