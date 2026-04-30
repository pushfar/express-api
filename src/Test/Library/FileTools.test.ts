import { Readable } from 'stream';
import FileTools from '../../Library/FileTools';

describe('FileTools', () => {
	describe('streamToText', () => {
		it('converts a readable stream to utf8 text', async () => {
			const stream = Readable.from(['hello ', 'world']);
			const text = await FileTools.streamToText(stream);
			expect(text).toBe('hello world');
		});

		it('handles binary buffer chunks', async () => {
			const stream = Readable.from([Buffer.from('abc'), Buffer.from('123')]);
			const text = await FileTools.streamToText(stream);
			expect(text).toBe('abc123');
		});

		it('rejects when stream emits an error', async () => {
			const stream = new Readable({ read() { /* no-op */ } });
			const error = new Error('stream failed');

			const pending = FileTools.streamToText(stream);
			stream.emit('error', error);

			await expect(pending).rejects.toThrow('stream failed');
		});
	});
});
