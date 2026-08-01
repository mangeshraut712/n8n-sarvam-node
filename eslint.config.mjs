import n8nConfig from "@n8n/node-cli/eslint";

export default [
	{
		ignores: ["tests/**", "dist/**"],
	},
	...n8nConfig.default,
];
