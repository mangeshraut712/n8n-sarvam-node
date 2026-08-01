import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { buildChatCompletionBody } from './buildChatCompletionBody';

const BASE_URL = 'https://api.sarvam.ai';

const STT_LANGUAGES = [
	{ name: 'Auto Detect', value: 'unknown' },
	{ name: 'Assamese', value: 'as-IN' },
	{ name: 'Bengali', value: 'bn-IN' },
	{ name: 'Bodo', value: 'brx-IN' },
	{ name: 'Dogri', value: 'doi-IN' },
	{ name: 'English', value: 'en-IN' },
	{ name: 'Gujarati', value: 'gu-IN' },
	{ name: 'Hindi', value: 'hi-IN' },
	{ name: 'Kannada', value: 'kn-IN' },
	{ name: 'Kashmiri', value: 'ks-IN' },
	{ name: 'Konkani', value: 'kok-IN' },
	{ name: 'Maithili', value: 'mai-IN' },
	{ name: 'Malayalam', value: 'ml-IN' },
	{ name: 'Manipuri', value: 'mni-IN' },
	{ name: 'Marathi', value: 'mr-IN' },
	{ name: 'Nepali', value: 'ne-IN' },
	{ name: 'Odia', value: 'od-IN' },
	{ name: 'Punjabi', value: 'pa-IN' },
	{ name: 'Sanskrit', value: 'sa-IN' },
	{ name: 'Santali', value: 'sat-IN' },
	{ name: 'Sindhi', value: 'sd-IN' },
	{ name: 'Tamil', value: 'ta-IN' },
	{ name: 'Telugu', value: 'te-IN' },
	{ name: 'Urdu', value: 'ur-IN' },
];

const TTS_LANGUAGES = [
	{ name: 'Bengali', value: 'bn-IN' },
	{ name: 'English', value: 'en-IN' },
	{ name: 'Gujarati', value: 'gu-IN' },
	{ name: 'Hindi', value: 'hi-IN' },
	{ name: 'Kannada', value: 'kn-IN' },
	{ name: 'Malayalam', value: 'ml-IN' },
	{ name: 'Marathi', value: 'mr-IN' },
	{ name: 'Odia', value: 'od-IN' },
	{ name: 'Punjabi', value: 'pa-IN' },
	{ name: 'Tamil', value: 'ta-IN' },
	{ name: 'Telugu', value: 'te-IN' },
];

const TTS_SPEAKERS = [
	{ name: 'Aayan', value: 'aayan' },
	{ name: 'Aditya', value: 'aditya' },
	{ name: 'Advait', value: 'advait' },
	{ name: 'Amelia', value: 'amelia' },
	{ name: 'Amit', value: 'amit' },
	{ name: 'Anand', value: 'anand' },
	{ name: 'Ashutosh', value: 'ashutosh' },
	{ name: 'Dev', value: 'dev' },
	{ name: 'Gokul', value: 'gokul' },
	{ name: 'Ishita', value: 'ishita' },
	{ name: 'Kabir', value: 'kabir' },
	{ name: 'Kavitha', value: 'kavitha' },
	{ name: 'Kavya', value: 'kavya' },
	{ name: 'Manan', value: 'manan' },
	{ name: 'Mani', value: 'mani' },
	{ name: 'Mohit', value: 'mohit' },
	{ name: 'Neha', value: 'neha' },
	{ name: 'Pooja', value: 'pooja' },
	{ name: 'Priya', value: 'priya' },
	{ name: 'Rahul', value: 'rahul' },
	{ name: 'Ratan', value: 'ratan' },
	{ name: 'Rehan', value: 'rehan' },
	{ name: 'Ritu', value: 'ritu' },
	{ name: 'Rohan', value: 'rohan' },
	{ name: 'Roopa', value: 'roopa' },
	{ name: 'Rupali', value: 'rupali' },
	{ name: 'Shreya', value: 'shreya' },
	{ name: 'Shruti', value: 'shruti' },
	{ name: 'Shubh', value: 'shubh' },
	{ name: 'Simran', value: 'simran' },
	{ name: 'Soham', value: 'soham' },
	{ name: 'Sophia', value: 'sophia' },
	{ name: 'Suhani', value: 'suhani' },
	{ name: 'Sumit', value: 'sumit' },
	{ name: 'Sunny', value: 'sunny' },
	{ name: 'Tanya', value: 'tanya' },
	{ name: 'Tarun', value: 'tarun' },
	{ name: 'Varun', value: 'varun' },
	{ name: 'Vijay', value: 'vijay' },
];

export class Sarvam implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Sarvam AI',
		name: 'sarvam',
		icon: 'file:sarvam.svg',
		group: ['transform'],
		usableAsTool: true,
		version: 1,
		subtitle: '={{$parameter["operation"] + " (" + $parameter["resource"] + ")"}}',
		description: 'Indian language AI APIs — transcribe, speak, and chat across 22+ Indian languages',
		defaults: {
			name: 'Sarvam AI',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'sarvamApi',
				required: true,
			},
		],
		properties: [
			// ──────────────── Resource ────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Chat', value: 'chat' },
					{ name: 'Speech', value: 'speech' },
				],
				default: 'speech',
			},

			// ──────────────── Operations ────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['speech'] } },
				options: [
					{ name: 'Speech to Text', value: 'speechToText', description: 'Transcribe audio to text with multiple output modes', action: 'Speech to text' },
					{ name: 'Text to Speech', value: 'textToSpeech', description: 'Convert text to spoken audio', action: 'Text to speech' },
				],
				default: 'speechToText',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['chat'] } },
				options: [
					{ name: 'Complete', value: 'complete', description: 'Generate a chat completion', action: 'Complete chat' },
				],
				default: 'complete',
			},

			// ════════════════ SPEECH > SPEECH TO TEXT ════════════════
			{
				displayName: 'Input Binary Field',
				name: 'binaryPropertyName',
				type: 'string',
				required: true,
				default: 'data',
				displayOptions: { show: { resource: ['speech'], operation: ['speechToText'] } },
				description: 'Name of the binary property containing the audio file',
			},
			{
				displayName: 'Mode',
				name: 'sttMode',
				type: 'options',
				required: true,
				default: 'transcribe',
				options: [
					{ name: 'Code Mixed', value: 'codemix', description: 'English words in English, Indic words in native script' },
					{ name: 'Transcribe', value: 'transcribe', description: 'Standard transcription in original language' },
					{ name: 'Translate to English', value: 'translate', description: 'Translate speech from any Indic language to English' },
					{ name: 'Transliterate (Roman)', value: 'translit', description: 'Romanize speech to Latin script' },
					{ name: 'Verbatim', value: 'verbatim', description: 'Exact word-for-word transcription without normalization' },
				],
				displayOptions: { show: { resource: ['speech'], operation: ['speechToText'] } },
			},
			{
				displayName: 'Options',
				name: 'speechToTextOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['speech'], operation: ['speechToText'] } },
				options: [
					{
						displayName: 'Language',
						name: 'language_code',
						type: 'options',
						default: 'unknown',
						options: STT_LANGUAGES,
						description: 'Language of the audio. Use Auto Detect if unknown.',
					},
				],
			},

			// ════════════════ SPEECH > TEXT TO SPEECH ════════════════
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 4 },
				required: true,
				default: '',
				displayOptions: { show: { resource: ['speech'], operation: ['textToSpeech'] } },
				description: 'The text to convert to speech (max 2500 characters)',
			},
			{
				displayName: 'Target Language',
				name: 'ttsTargetLanguage',
				type: 'options',
				required: true,
				default: 'hi-IN',
				options: TTS_LANGUAGES,
				displayOptions: { show: { resource: ['speech'], operation: ['textToSpeech'] } },
				description: 'Language for text normalization before synthesis',
			},
			{
				displayName: 'Options',
				name: 'textToSpeechOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['speech'], operation: ['textToSpeech'] } },
				options: [
					{
						displayName: 'Output Audio Codec',
						name: 'output_audio_codec',
						type: 'options',
						default: 'wav',
						options: [
							{ name: 'AAC', value: 'aac' },
							{ name: 'ALAW', value: 'alaw' },
							{ name: 'FLAC', value: 'flac' },
							{ name: 'Linear16', value: 'linear16' },
							{ name: 'MP3', value: 'mp3' },
							{ name: 'MULAW', value: 'mulaw' },
							{ name: 'Opus', value: 'opus' },
							{ name: 'WAV', value: 'wav' },
						],
					},
					{
						displayName: 'Pace',
						name: 'pace',
						type: 'number',
						default: 1,
						typeOptions: { minValue: 0.5, maxValue: 2, numberPrecision: 1 },
						description: 'Speech speed (0.5-2.0)',
					},
					{
						displayName: 'Sample Rate',
						name: 'speech_sample_rate',
						type: 'options',
						default: 22050,
						options: [
							{ name: '8000 Hz', value: 8000 },
							{ name: '16000 Hz', value: 16000 },
							{ name: '22050 Hz', value: 22050 },
							{ name: '24000 Hz', value: 24000 },
							{ name: '32000 Hz', value: 32000 },
							{ name: '44100 Hz', value: 44100 },
							{ name: '48000 Hz', value: 48000 },
						],
					},
					{
						displayName: 'Speaker',
						name: 'speaker',
						type: 'options',
						default: 'shubh',
						options: TTS_SPEAKERS,
						description: 'Voice to use for synthesis',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.6,
						typeOptions: { minValue: 0.01, maxValue: 2, numberPrecision: 2 },
						description: 'Expressiveness control (0.01-2.0)',
					},
				],
			},

			// ════════════════ CHAT > COMPLETE ════════════════
			{
				displayName: 'Model',
				name: 'chatModel',
				type: 'options',
				required: true,
				default: 'sarvam-105b',
				options: [
					{ name: 'Sarvam 105B', value: 'sarvam-105b' },
					{ name: 'Sarvam 30B (Deprecated)', value: 'sarvam-30b' },
				],
				description:
					'Chat model to use. Prefer sarvam-105b; sarvam-30b is deprecated.',
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
			},
			{
				displayName: 'User Message',
				name: 'userMessage',
				type: 'string',
				typeOptions: { rows: 4 },
				required: true,
				default: '',
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
				description: 'The message to send to the model',
			},
			{
				displayName: 'System Message',
				name: 'systemMessage',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
				description: 'Optional system prompt to guide the model behavior',
			},
			{
				displayName: 'Options',
				name: 'chatOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { resource: ['chat'], operation: ['complete'] } },
				options: [
					{
						displayName: 'Frequency Penalty',
						name: 'frequency_penalty',
						type: 'number',
						default: 0,
						typeOptions: { minValue: -2, maxValue: 2 },
						description: 'Penalize repeated tokens (-2.0 to 2.0)',
					},
					{
						displayName: 'Max Tokens',
						name: 'max_tokens',
						type: 'number',
						default: 1024,
						typeOptions: { minValue: 1 },
						description:
							'Maximum tokens in the response. Always sent (defaults to 1024 even if this option is not added). Required for reliable sarvam-105b replies.',
					},
					{
						displayName: 'Presence Penalty',
						name: 'presence_penalty',
						type: 'number',
						default: 0,
						typeOptions: { minValue: -2, maxValue: 2 },
						description: 'Encourage new topics (-2.0 to 2.0)',
					},
					{
						displayName: 'Reasoning Effort',
						name: 'reasoning_effort',
						type: 'options',
						default: '',
						options: [
							{ name: 'High', value: 'high' },
							{ name: 'Low', value: 'low' },
							{ name: 'Medium', value: 'medium' },
							{ name: 'None', value: '' },
						],
					},
					{
						displayName: 'Seed',
						name: 'seed',
						type: 'number',
						default: 0,
						description: 'For reproducible results (best effort)',
					},
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.2,
						typeOptions: { minValue: 0, maxValue: 2, numberPrecision: 1 },
					},
					{
						displayName: 'Top P',
						name: 'top_p',
						type: 'number',
						default: 1,
						typeOptions: { minValue: 0, maxValue: 1, numberPrecision: 2 },
					},
					{
						displayName: 'Wiki Grounding',
						name: 'wiki_grounding',
						type: 'boolean',
						default: false,
						description: 'Whether to ground responses using Wikipedia',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject;

				if (resource === 'speech') {
					const result = await handleSpeechOperations.call(this, operation, i);
				if (operation === 'textToSpeech') {
					returnData.push({ ...(result as unknown as INodeExecutionData), pairedItem: { item: i } });
					continue;
					}
					responseData = result;
				} else if (resource === 'chat') {
					responseData = await handleChatOperations.call(this, i);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

			returnData.push({ json: responseData, pairedItem: { item: i } });
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

async function handleSpeechOperations(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject> {
	if (operation === 'speechToText') {
		const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
		const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
		const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

		const extraFields: IDataObject = {
			model: 'saaras:v3',
			mode: this.getNodeParameter('sttMode', i) as string,
		};

		const options = this.getNodeParameter('speechToTextOptions', i, {}) as IDataObject;
		if (options.language_code) extraFields.language_code = options.language_code;

		return await makeFormRequest.call(
			this, '/speech-to-text', dataBuffer,
			binaryData.fileName ?? 'audio.wav', binaryData.mimeType ?? 'audio/wav', extraFields,
		);
	}

	if (operation === 'textToSpeech') {
		const body: IDataObject = {
			model: 'bulbul:v3',
			text: this.getNodeParameter('text', i) as string,
			target_language_code: this.getNodeParameter('ttsTargetLanguage', i) as string,
		};
		const options = this.getNodeParameter('textToSpeechOptions', i, {}) as IDataObject;
		if (options.speaker) body.speaker = options.speaker;
		if (options.pace !== undefined) body.pace = options.pace;
		if (options.temperature !== undefined) body.temperature = options.temperature;
		if (options.speech_sample_rate) body.speech_sample_rate = options.speech_sample_rate;
		if (options.output_audio_codec) body.output_audio_codec = options.output_audio_codec;

		const response = (await makeApiRequest.call(this, 'POST', '/text-to-speech', body)) as IDataObject & {
			audios?: string[];
		};

		const codec = (options.output_audio_codec as string) ?? 'wav';
		const mimeTypes: Record<string, string> = {
			wav: 'audio/wav',
			mp3: 'audio/mpeg',
			aac: 'audio/aac',
			flac: 'audio/flac',
			opus: 'audio/opus',
			linear16: 'audio/L16',
			mulaw: 'audio/basic',
			alaw: 'audio/basic',
		};

		if (response.audios && Array.isArray(response.audios) && response.audios.length > 0) {
			const audioBuffer = Buffer.from(response.audios[0] as string, 'base64');
			const binaryOutput = await this.helpers.prepareBinaryData(
				audioBuffer,
				`output.${codec}`,
				mimeTypes[codec] ?? 'audio/wav',
			);
			return { json: { request_id: response.request_id }, binary: { data: binaryOutput } } as unknown as IDataObject;
		}

		return response;
	}

	throw new NodeOperationError(this.getNode(), `Unknown speech operation: ${operation}`);
}

async function handleChatOperations(
	this: IExecuteFunctions,
	i: number,
): Promise<IDataObject> {
	const model = this.getNodeParameter('chatModel', i) as string;
	const userMessage = this.getNodeParameter('userMessage', i) as string;
	const systemMessage = this.getNodeParameter('systemMessage', i, '') as string;
	const options = this.getNodeParameter('chatOptions', i, {}) as IDataObject;

	const messages: Array<{ role: string; content: string }> = [];
	if (systemMessage) {
		messages.push({ role: 'system', content: systemMessage });
	}
	messages.push({ role: 'user', content: userMessage });

	const body = buildChatCompletionBody(model, messages, options);
	return await makeApiRequest.call(this, 'POST', '/v1/chat/completions', body);
}

function formatApiError(error: unknown): string {
	const err = error as {
		statusCode?: number;
		message?: string;
		body?: { error?: { message?: string }; detail?: string | Array<{ msg?: string }> };
	};
	const status = err.statusCode;
	const detail = err.body?.detail;
	const detailText = Array.isArray(detail)
		? detail.map((d) => d.msg).filter(Boolean).join('; ')
		: typeof detail === 'string'
			? detail
			: undefined;
	const apiMessage =
		err.body?.error?.message ?? detailText ?? err.message ?? 'Unknown error';

	if (status === 401 || status === 403) {
		return 'Invalid or expired API key. Check your Sarvam AI credential.';
	}
	if (status === 402 || apiMessage.includes('insufficient_quota')) {
		return 'Insufficient API credits. Top up at dashboard.sarvam.ai.';
	}
	if (status === 400 || status === 422) {
		return `Invalid request: ${apiMessage}`;
	}
	if (status === 429) {
		return 'Rate limit exceeded. Please wait and try again.';
	}
	if (status && status >= 500) {
		return `Sarvam API server error (${status}). Try again later.`;
	}
	return apiMessage;
}

async function makeApiRequest(
	this: IExecuteFunctions,
	method: string,
	endpoint: string,
	body: IDataObject,
): Promise<IDataObject> {
	try {
		return (await this.helpers.httpRequestWithAuthentication.call(this, 'sarvamApi', {
			method: method as 'POST',
			url: `${BASE_URL}${endpoint}`,
			body,
			json: true,
			headers: {
				'Content-Type': 'application/json',
			},
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatApiError(error));
	}
}

async function makeFormRequest(
	this: IExecuteFunctions,
	endpoint: string,
	fileBuffer: Buffer,
	fileName: string,
	mimeType: string,
	extraFields: IDataObject,
): Promise<IDataObject> {
	const boundary = `----n8nBoundary${Date.now()}`;
	const parts: Buffer[] = [];

	parts.push(Buffer.from(
		`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
	));
	parts.push(fileBuffer);
	parts.push(Buffer.from('\r\n'));

	for (const [key, value] of Object.entries(extraFields)) {
		if (value !== undefined && value !== null && value !== '') {
			parts.push(Buffer.from(
				`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${String(value)}\r\n`,
			));
		}
	}

	parts.push(Buffer.from(`--${boundary}--\r\n`));
	const body = Buffer.concat(parts);

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(this, 'sarvamApi', {
			method: 'POST',
			url: `${BASE_URL}${endpoint}`,
			body,
			headers: {
				'Content-Type': `multipart/form-data; boundary=${boundary}`,
			},
		})) as IDataObject;
	} catch (error) {
		throw new NodeOperationError(this.getNode(), formatApiError(error));
	}
}
