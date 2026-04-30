import { z } from 'zod';
import ZodSchemaTools from '../../Library/ZodSchemaTools';

describe('ZodSchemaTools', () => {
	describe('redact', () => {
		it('should redact fields marked with meta sensitive', () => {
			const schema = z.object({
				email: z.string(),
				password: z.string().meta({ sensitive: true }),
			});

			const data = { email: 'test@test.com', password: 'secret123' };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.email).toBe('test@test.com');
			expect(result.password).toBe('[REDACTED]');
		});

		it('should not mutate the original data', () => {
			const schema = z.object({
				password: z.string().meta({ sensitive: true }),
			});

			const data = { password: 'secret' };
			const result = ZodSchemaTools.redact(data, schema);

			expect(data.password).toBe('secret');
			expect(result.password).toBe('[REDACTED]');
		});

		it('should handle nested objects', () => {
			const schema = z.object({
				user: z.object({
					name: z.string(),
					password: z.string().meta({ sensitive: true }),
				}),
			});

			const data = { user: { name: 'Paul', password: 'secret' } };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.user.name).toBe('Paul');
			expect(result.user.password).toBe('[REDACTED]');
		});

		it('should handle arrays of sensitive values', () => {
			const schema = z.object({
				tokens: z.array(z.string().meta({ sensitive: true })),
			});

			const data = { tokens: ['token1', 'token2', 'token3'] };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.tokens).toEqual(['[REDACTED]', '[REDACTED]', '[REDACTED]']);
		});

		it('should handle arrays of objects with sensitive fields', () => {
			const schema = z.object({
				users: z.array(z.object({
					name: z.string(),
					secret: z.string().meta({ sensitive: true }),
				})),
			});

			const data = {
				users: [
					{ name: 'Alice', secret: 'abc' },
					{ name: 'Bob', secret: 'def' },
				],
			};
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.users[0].name).toBe('Alice');
			expect(result.users[0].secret).toBe('[REDACTED]');
			expect(result.users[1].name).toBe('Bob');
			expect(result.users[1].secret).toBe('[REDACTED]');
		});

		it('should handle optional sensitive fields', () => {
			const schema = z.object({
				name: z.string(),
				apiKey: z.string().optional().meta({ sensitive: true }),
			});

			const data = { name: 'test', apiKey: 'key-123' };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.name).toBe('test');
			expect(result.apiKey).toBe('[REDACTED]');
		});

		it('should handle null/undefined values gracefully', () => {
			const schema = z.object({
				name: z.string(),
				token: z.string().optional().meta({ sensitive: true }),
			});

			const data = { name: 'test', token: undefined };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.name).toBe('test');
			expect(result.token).toBeUndefined();
		});

		it('should not redact fields without sensitive meta', () => {
			const schema = z.object({
				name: z.string(),
				email: z.string(),
				age: z.number(),
				active: z.boolean(),
			});

			const data = { name: 'Paul', email: 'paul@test.com', age: 30, active: true };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result).toEqual(data);
		});

		it('should allow custom replacement string', () => {
			const schema = z.object({
				password: z.string().meta({ sensitive: true }),
			});

			const data = { password: 'secret' };
			const result = ZodSchemaTools.redact(data, schema, '***');

			expect(result.password).toBe('***');
		});

		it('should handle deeply nested sensitive fields', () => {
			const schema = z.object({
				config: z.object({
					database: z.object({
						host: z.string(),
						credentials: z.object({
							username: z.string(),
							password: z.string().meta({ sensitive: true }),
						}),
					}),
				}),
			});

			const data = {
				config: {
					database: {
						host: 'localhost',
						credentials: { username: 'admin', password: 'p@ss' },
					},
				},
			};
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.config.database.host).toBe('localhost');
			expect(result.config.database.credentials.username).toBe('admin');
			expect(result.config.database.credentials.password).toBe('[REDACTED]');
		});

		it('should handle an entire object marked as sensitive', () => {
			const schema = z.object({
				public: z.string(),
				secrets: z.object({
					key: z.string(),
					token: z.string(),
				}).meta({ sensitive: true }),
			});

			const data = { public: 'hello', secrets: { key: 'k', token: 't' } };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.public).toBe('hello');
			expect(result.secrets).toBe('[REDACTED]');
		});

		it('should preserve fields not in the schema', () => {
			const schema = z.object({
				name: z.string(),
				password: z.string().meta({ sensitive: true }),
			});

			const data = { name: 'test', password: 'secret', extra: 'preserved' } as any;
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.name).toBe('test');
			expect(result.password).toBe('[REDACTED]');
			expect(result.extra).toBe('preserved');
		});

		it('should handle empty objects', () => {
			const schema = z.object({});
			const data = {};
			const result = ZodSchemaTools.redact(data, schema);
			expect(result).toEqual({});
		});

		it('should handle number sensitive fields', () => {
			const schema = z.object({
				id: z.number(),
				ssn: z.number().meta({ sensitive: true }),
			});

			const data = { id: 1, ssn: 123456789 };
			const result = ZodSchemaTools.redact(data, schema);

			expect(result.id).toBe(1);
			expect(result.ssn).toBe('[REDACTED]');
		});
	});

	describe('safeStringify', () => {
		it('should stringify simple data without a schema', () => {
			const data = { name: 'Paul', age: 30 };
			const result = ZodSchemaTools.safeStringify(data);
			expect(JSON.parse(result)).toEqual(data);
		});

		it('should handle circular references', () => {
			const data: any = { name: 'Paul' };
			data.self = data;
			const result = ZodSchemaTools.safeStringify(data);
			expect(JSON.parse(result)).toEqual({ name: 'Paul', self: '[Circular Reference]' });
		});

		it('should replace globals key with [Globals]', () => {
			const data = { name: 'Paul', globals: { $environment: {}, $client: {} } };
			const result = ZodSchemaTools.safeStringify(data);
			expect(JSON.parse(result)).toEqual({ name: 'Paul', globals: '[Globals]' });
		});

		it('should replace Globals key case-insensitively', () => {
			const data = { Globals: { big: 'object' }, value: 1 };
			const result = ZodSchemaTools.safeStringify(data);
			expect(JSON.parse(result)).toEqual({ Globals: '[Globals]', value: 1 });
		});

		it('should redact sensitive fields when schema is provided', () => {
			const schema = z.object({
				email: z.string(),
				password: z.string().meta({ sensitive: true }),
			});
			const data = { email: 'test@test.com', password: 'secret' };
			const result = ZodSchemaTools.safeStringify(data, schema);
			expect(JSON.parse(result)).toEqual({ email: 'test@test.com', password: '[REDACTED]' });
		});

		it('should handle both circular references and redaction together', () => {
			const schema = z.object({
				name: z.string(),
				token: z.string().meta({ sensitive: true }),
			});
			const data: any = { name: 'Paul', token: 'secret-token' };
			data.globals = { $env: {} };
			const result = ZodSchemaTools.safeStringify(data, schema);
			const parsed = JSON.parse(result);
			expect(parsed.name).toBe('Paul');
			expect(parsed.token).toBe('[REDACTED]');
			expect(parsed.globals).toBe('[Globals]');
		});

		it('should accept a custom replacement string', () => {
			const schema = z.object({
				password: z.string().meta({ sensitive: true }),
			});
			const data = { password: 'secret' };
			const result = ZodSchemaTools.safeStringify(data, schema, '***');
			expect(JSON.parse(result)).toEqual({ password: '***' });
		});

		it('should handle nested circular references', () => {
			const child: any = { value: 'test' };
			const parent: any = { child };
			child.parent = parent;
			const result = ZodSchemaTools.safeStringify(parent);
			const parsed = JSON.parse(result);
			expect(parsed.child.value).toBe('test');
			expect(parsed.child.parent).toBe('[Circular Reference]');
		});
	});
});
