import bcrypt from 'bcrypt';
import CryptoTools from '../../Library/CryptoTools';

describe('CryptoTools', () => {
	describe('legacy hash/encryption methods', () => {
		it('creates deterministic md5 and sha256 hashes', () => {
			expect(CryptoTools.md5('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
			expect(CryptoTools.sha256('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
		});

		it('creates reproducible password hashes with explicit salt', () => {
			const salt = CryptoTools.sha256('mysalt');
			const one = CryptoTools.passwordHash('mypassword', salt);
			const two = CryptoTools.passwordHash('mypassword', salt);
			expect(one).toBe(two);
			expect(one.startsWith(salt)).toBe(true);
		});

		it('encrypts and decrypts strings with AES-256-CBC', () => {
			const encrypted = CryptoTools.encryptAES256CBC('Hello World', 'password123', 'salt');
			const decrypted = CryptoTools.decryptAES256CBC(encrypted, 'password123', 'salt');
			expect(decrypted).toBe('Hello World');
		});

		it('encodes and decodes JWT tokens through AES wrapper', () => {
			const token = CryptoTools.encodeToken(
				'scope-a',
				'key-123',
				'example.com',
				'https://example.com',
				60,
				'jwt-secret',
				'aes-secret'
			);

			expect(CryptoTools.decodeToken('scope-a', token, 'jwt-secret', 'aes-secret')).toBe('key-123');
		});
	});

	describe('compareBcryptHash', () => {
		it('normalizes $2y$ hashes to compare correctly', async () => {
			const plain = 'my-password';
			const nodeHash = await bcrypt.hash(plain, 4);
			const phpStyleHash = nodeHash.replace('$2b$', '$2y$');

			await expect(CryptoTools.compareBcryptHash(plain, phpStyleHash)).resolves.toBe(true);
		});
	});

	describe('makeBcryptHash', () => {
		it('throws for empty password', async () => {
			await expect(CryptoTools.makeBcryptHash('')).rejects.toThrow('Password must be a non-empty string');
		});

		it('returns php-style $2y$ hash prefix for generated bcrypt hashes', async () => {
			const hash = await CryptoTools.makeBcryptHash('abc123', 4);
			expect(hash.startsWith('$2y$')).toBe(true);
		});
	});

	describe('generateUuid', () => {
		it('returns a valid UUID v4', () => {
			const uuid = CryptoTools.generateUuid();
			expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});
	});

	describe('generateApiKey and hashApiKey', () => {
		it('creates an api key with expected structure and deterministic hash', () => {
			const { key, prefix, hash } = CryptoTools.generateApiKey('test');

			expect(key.startsWith('pfid_test_')).toBe(true);
			expect(prefix).toBe(key.slice(0, 16));
			expect(hash).toBe(CryptoTools.hashApiKey(key));
			expect(hash).toHaveLength(64);
		});
	});
});
