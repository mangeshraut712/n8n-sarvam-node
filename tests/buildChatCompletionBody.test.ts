import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	buildChatCompletionBody,
	DEFAULT_CHAT_MAX_TOKENS,
} from '../nodes/Sarvam/buildChatCompletionBody';

describe('buildChatCompletionBody', () => {
	const messages = [{ role: 'user', content: 'Hello' }];

	it('always includes max_tokens when Options collection is empty', () => {
		const body = buildChatCompletionBody('sarvam-105b', messages, {});
		assert.equal(body.model, 'sarvam-105b');
		assert.deepEqual(body.messages, messages);
		assert.equal(body.max_tokens, DEFAULT_CHAT_MAX_TOKENS);
	});

	it('respects an explicit positive max_tokens override', () => {
		const body = buildChatCompletionBody('sarvam-105b', messages, {
			max_tokens: 2000,
		});
		assert.equal(body.max_tokens, 2000);
	});

	it('falls back to the default when max_tokens is zero or negative', () => {
		assert.equal(
			buildChatCompletionBody('sarvam-105b', messages, { max_tokens: 0 }).max_tokens,
			DEFAULT_CHAT_MAX_TOKENS,
		);
		assert.equal(
			buildChatCompletionBody('sarvam-105b', messages, { max_tokens: -5 }).max_tokens,
			DEFAULT_CHAT_MAX_TOKENS,
		);
	});

	it('forwards optional sampling fields when provided', () => {
		const body = buildChatCompletionBody('sarvam-105b', messages, {
			temperature: 0.2,
			top_p: 0.9,
			reasoning_effort: 'low',
			seed: 0,
			wiki_grounding: false,
		});
		assert.equal(body.temperature, 0.2);
		assert.equal(body.top_p, 0.9);
		assert.equal(body.reasoning_effort, 'low');
		assert.equal(body.seed, 0);
		assert.equal(body.wiki_grounding, false);
	});
});
