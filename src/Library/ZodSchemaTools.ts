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
	public static redact<T>(data: T, schema: z.ZodType, replacement: string = '[REDACTED]'): T {
		if (!data) return data;
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
	public static safeStringify(data: any, schema?: z.ZodType, replacement: string = '[REDACTED]'): string {
		if (!data) return '';
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
	private static __getCircularReplacer() {
		const seen = new WeakSet();
		return (key: string, value: any) => {
			if (key.toLowerCase() === 'globals') return '[Globals]';
			if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) {
					return '[Circular Reference]';
				}
				seen.add(value);
			}
			return value;
		};
	};

	private static __redactValue(data: any, schema: any, replacement: string): any {
		if (data === null || data === undefined) return data;

		const meta = schema.meta?.();
		if (meta?.sensitive) return replacement;

		const def = schema._zod?.def;
		if (!def) return data;

		if (def.shape && typeof data === 'object' && !Array.isArray(data)) {
			return ZodSchemaTools.__redactObject(data, def.shape, replacement);
		}

		if (def.element && Array.isArray(data)) {
			return data.map((item: any) => ZodSchemaTools.__redactValue(item, def.element, replacement));
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

	private static __redactObject(data: any, shape: Record<string, any>, replacement: string): any {
		const result: any = {};
		for (const key of Object.keys(data)) {
			if (key in shape) {
				result[key] = ZodSchemaTools.__redactValue(data[key], shape[key], replacement);
			} else {
				result[key] = data[key];
			}
		}
		return result;
	}
}
