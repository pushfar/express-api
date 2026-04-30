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
    static redact(data, schema, replacement = '[REDACTED]') {
        if (!data)
            return data;
        return ZodSchemaTools.__redactValue(JSON.parse(JSON.stringify(data, ZodSchemaTools.__getCircularReplacer())), schema, replacement);
    }
    /**
     * @public @static safeStringify
     * @description Safely JSON-stringifies data, handling circular references and optionally redacting sensitive fields.
     * @param data The data to stringify
     * @param schema Optional Zod schema — when provided, sensitive fields are redacted before stringifying
     * @param replacement The replacement string for sensitive values (defaults to '[REDACTED]')
     * @returns A JSON string with circular references and globals handled, and sensitive fields redacted if schema provided
     */
    static safeStringify(data, schema, replacement = '[REDACTED]') {
        if (!data)
            return '';
        const safe = JSON.parse(JSON.stringify(data, ZodSchemaTools.__getCircularReplacer()));
        if (schema) {
            return JSON.stringify(ZodSchemaTools.__redactValue(safe, schema, replacement));
        }
        return JSON.stringify(safe);
    }
    /**
     * @public @async getCircularReplacer
     * @description Get a circular replacer for safe logging
     * @returns A circular replacer function
     */
    static __getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (key.toLowerCase() === 'globals')
                return '[Globals]';
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return '[Circular Reference]';
                }
                seen.add(value);
            }
            return value;
        };
    }
    ;
    static __redactValue(data, schema, replacement) {
        if (data === null || data === undefined)
            return data;
        const meta = schema.meta?.();
        if (meta?.sensitive)
            return replacement;
        const def = schema._zod?.def;
        if (!def)
            return data;
        if (def.shape && typeof data === 'object' && !Array.isArray(data)) {
            return ZodSchemaTools.__redactObject(data, def.shape, replacement);
        }
        if (def.element && Array.isArray(data)) {
            return data.map((item) => ZodSchemaTools.__redactValue(item, def.element, replacement));
        }
        // ZodPipe (transforms) — walk the input schema
        if (def.in) {
            return ZodSchemaTools.__redactValue(data, def.in, replacement);
        }
        // ZodOptional / ZodNullable — unwrap
        if (def.innerType) {
            return ZodSchemaTools.__redactValue(data, def.innerType, replacement);
        }
        return data;
    }
    static __redactObject(data, shape, replacement) {
        const result = {};
        for (const key of Object.keys(data)) {
            if (key in shape) {
                result[key] = ZodSchemaTools.__redactValue(data[key], shape[key], replacement);
            }
            else {
                result[key] = data[key];
            }
        }
        return result;
    }
}
//# sourceMappingURL=ZodSchemaTools.js.map