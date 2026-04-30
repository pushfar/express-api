/**
 * @module express-api/Library/Crypto
 * @class Crypto
 * @description Common resource element, functional only, providing crypto functionality
 * @author Paul Smith (ulsmith) <paul.smith@ulsmith.net>
 * @license MIT
 */
export default class Crypto {
    /**
     * @public @static @name md5
     * @description Create an MD5 hash
     * @param {String} s The string to hash
     * @return {String} A hash of the string
     */
    static md5(s: string): string;
    /**
     * @public @static @name sha256
     * @description Create an sha256 hash
     * @param {String} s The string to hash
     * @return {String} A hash of the string
     */
    static sha256(s: string): string;
    /**
     * @public @static @name md5
     * @description Create a password hash using sha256
     * @param {String} text The string to hash
     * @param {String} salt The salt to use
     * @return {String} A hash of the string with salt hash at front
     * @example To create a new hash... Crypto.passwordHash('paul smith')
     * @example To create a new hash with original salt for verifying... Crypto.passwordHash('paul smith', hash.substring(0, hash.length / 2))
     */
    static passwordHash(text: string, salt?: string): string;
    /**
     * @public @static @name encryptAES256CBC
     * @description Create a 256bit AES encrypted string
     * @param {String} string The string to encrypt
     * @param {String} password The password to use as a key
     * @param {String} salt (optional) The salt to mix the password up with in key gen
     * @return {String} An encrypted string
     * @example encryptAES256CBC('Something', 'ABC...XYZ');
     */
    static encryptAES256CBC(string: string, password: string, salt?: string): string;
    /**
     * @public @static @name decryptAES256CBC
     * @description Decrypt a 256bit AES encrypted string
     * @param {String} enc The encrypted string to decrypt
     * @param {String} password The password to use as a key
     * @param {String} salt (optional) The salt to mix the password up with in key gen
     * @return {String} A decrypted string
     * @example let decryptedString = decryptAES256CBC('ab3927d55ge....fdfdf44dfd', 'ABC...XYZ');
     */
    static decryptAES256CBC(enc: string, password: string, salt?: string): string;
    /**
     * @public @static @method encodeToken
     * @description Creates a JWT encoded token for use in passing to the public
     * @param {String} key The key to hide in the token
     * @return {String} Encrypted JWT token
     */
    static encodeToken(scope: string, key: string, host: string, origin: string, expire: number, JWTKey: string, AESKey: string): string;
    /**
     * @public @static @method decodeToken
     * @description Decodes a reset key and return key
     * @param {String} token The token to decode
     * @return {String} The key from in the token
     */
    static decodeToken(scope: string, token: string, JWTKey: string, AESKey: string): string;
    /**
     * Compare two bcrypt hashes
     * @method compareBcryptHash
     * @param stringOne The first bcrypt hash to compare
     * @param stringTwo The second bcrypt hash to compare
     * @return True if the hashes are the same, false otherwise
     */
    static compareBcryptHash(stringOne: string, stringTwo: string): Promise<boolean>;
    /**
     * Make a bcrypt hash from a plain text password
     * @method makeBcryptHash
     * @param plain The plain text password to hash
     * @param saltRounds The number of salt rounds to use
     * @return The bcrypt hash
     */
    static makeBcryptHash(plain: string, saltRounds?: number): Promise<string>;
    /**
     * Generate a v4 UUID.
     * @method generateUuid
     * @return A newly generated UUID
     */
    static generateUuid(): string;
    /**
     * Generate a new, high-entropy API key. Only the hash is ever persisted; the plaintext
     * key is returned once to the caller and must not be stored server-side.
     *
     * Format: `pfid_<env>_<43-char base64url secret>` (~256 bits of entropy).
     * @method generateApiKey
     * @param env The environment tag embedded in the key (e.g. "live", "test")
     * @return The plaintext key, its displayable prefix, and its SHA-256 hash
     */
    static generateApiKey(env?: string): {
        key: string;
        prefix: string;
        hash: string;
    };
    /**
     * Hash an API key for lookup / comparison. SHA-256 is sufficient because keys are
     * high-entropy random strings (not user-chosen), so they are not brute-forceable.
     * @method hashApiKey
     * @param key The plaintext API key
     * @return The hex-encoded SHA-256 hash
     */
    static hashApiKey(key: string): string;
}
//# sourceMappingURL=CryptoTools.d.ts.map