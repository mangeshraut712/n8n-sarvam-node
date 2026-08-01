import type { IDataObject } from 'n8n-workflow';

/** Default chat completion budget when Options → Max Tokens is not set. */
export const DEFAULT_CHAT_MAX_TOKENS = 1024;

/**
 * Build the `/v1/chat/completions` request body.
 *
 * n8n collection fields (including Max Tokens) are omitted from `options` until
 * the user explicitly adds them, so a UI "default: 1024" never reaches the wire
 * on its own. sarvam-105b is a reasoning model and often returns empty content
 * or opaque 400s without an explicit `max_tokens` budget — always send one.
 */
export function buildChatCompletionBody(
	model: string,
	messages: Array<{ role: string; content: string }>,
	options: IDataObject = {},
): IDataObject {
	const body: IDataObject = { model, messages };

	const maxTokens =
		typeof options.max_tokens === 'number' && options.max_tokens > 0
			? options.max_tokens
			: DEFAULT_CHAT_MAX_TOKENS;
	body.max_tokens = maxTokens;

	if (options.temperature !== undefined) body.temperature = options.temperature;
	if (options.top_p !== undefined) body.top_p = options.top_p;
	if (options.frequency_penalty !== undefined) body.frequency_penalty = options.frequency_penalty;
	if (options.presence_penalty !== undefined) body.presence_penalty = options.presence_penalty;
	if (options.wiki_grounding !== undefined) body.wiki_grounding = options.wiki_grounding;
	if (options.seed !== undefined && options.seed !== null && options.seed !== '') {
		body.seed = options.seed;
	}
	if (options.reasoning_effort) body.reasoning_effort = options.reasoning_effort;

	return body;
}
