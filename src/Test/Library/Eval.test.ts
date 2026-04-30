import Eval from '../../Library/Eval';

describe('Eval', () => {
	describe('execute', () => {
		it('evaluates full expression matches and returns typed values', () => {
			const value = Eval.execute('${this.user.profile.age}', { user: { profile: { age: 42 } } });
			expect(value).toBe(42);
		});

		it('evaluates partial template expressions as strings', () => {
			const value = Eval.execute('Hello ${this.user.name}', { user: { name: 'Paul' } });
			expect(value).toBe('Hello Paul');
		});

		it('returns empty fallback when full expression resolves to falsy', () => {
			const value = Eval.execute('${this.user.profile.age}', { user: { profile: { age: 0 } } }, 'EMPTY');
			expect(value).toBe('EMPTY');
		});

		it('returns null when value is empty and no fallback is provided', () => {
			const value = Eval.execute('', {}, undefined);
			expect(value).toBeNull();
		});

		it('throws enriched error for invalid expressions', () => {
			expect(() => {
				Eval.execute('${this.missing.}', {});
			}).toThrow('when evaluating the following >>> ${this.missing.}');
		});
	});

	describe('deepExecute', () => {
		it('recursively evaluates template values in nested objects and arrays', () => {
			const input = {
				name: '${this.user.name}',
				nested: {
					greeting: 'Hi ${this.user.name}',
					items: ['${this.user.profile.age}', 'x']
				}
			};

			const output = Eval.deepExecute<typeof input>(input, { user: { name: 'Paul', profile: { age: 42 } } });

			expect(output).toEqual({
				name: 'Paul',
				nested: {
					greeting: 'Hi Paul',
					items: [42, 'x']
				}
			});
		});

		it('passes through non-object values using execute', () => {
			const value = Eval.deepExecute<string>('Hello ${this.user.name}', { user: { name: 'Paul' } });
			expect(value).toBe('Hello Paul');
		});
	});
});
