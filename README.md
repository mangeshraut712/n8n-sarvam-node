# n8n-nodes-sarvam

[![npm version](https://img.shields.io/npm/v/n8n-nodes-sarvam.svg)](https://www.npmjs.com/package/n8n-nodes-sarvam)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![n8n community node](https://img.shields.io/badge/n8n-community%20node-ff6d5a)](https://www.npmjs.com/package/n8n-nodes-sarvam)

This is an n8n community node for [Sarvam AI](https://sarvam.ai) — Indian language AI APIs for transcription, speech synthesis, and chat across 22+ Indian languages.

## Installation

Follow the [n8n community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

In n8n, go to **Settings > Community Nodes** and install:

```
n8n-nodes-sarvam
```

## Authentication

You need a Sarvam AI API key. Get one from the [Sarvam AI Dashboard](https://dashboard.sarvam.ai) after signing up. You receive ₹1000 free credits on signup.

In n8n, create a new **Sarvam AI API** credential and paste your API key.

## Operations

### Speech

| Operation | Description |
|---|---|
| **Speech to Text** | Transcribe audio files with multiple modes — transcribe, translate to English, transliterate (roman), code-mixed, and verbatim |
| **Text to Speech** | Convert text to natural-sounding speech with 39 voice options |

### Chat

| Operation | Description |
|---|---|
| **Complete** | Generate chat completions using Sarvam AI language models |

## Speech to Text Modes

| Mode | Description |
|---|---|
| **Transcribe** | Standard transcription in the original language |
| **Translate to English** | Translate speech from any Indic language to English |
| **Transliterate (Roman)** | Romanize speech to Latin script |
| **Code Mixed** | English words in English, Indic words in native script |
| **Verbatim** | Exact word-for-word transcription without normalization |

## Supported Languages

**Speech to Text (23 languages):** Assamese, Bengali, Bodo, Dogri, English, Gujarati, Hindi, Kannada, Kashmiri, Konkani, Maithili, Malayalam, Manipuri, Marathi, Nepali, Odia, Punjabi, Sanskrit, Santali, Sindhi, Tamil, Telugu, Urdu.

**Text to Speech (11 languages):** Bengali, English, Gujarati, Hindi, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu.

**Chat:** Supports all languages via sarvam-105b (flagship). sarvam-30b remains available but is deprecated. Chat completions always send a `max_tokens` budget (default 1024) so sarvam-105b does not fail when Options → Max Tokens is left unset.

## Publishing (maintainers)

Releases go to npm from **GitHub Actions** with [npm provenance](https://docs.npmjs.com/generating-provenance-statements/), per [n8n’s publishing rules](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/).

1. On [npm](https://www.npmjs.com/), add **Trusted Publishers** for this package: GitHub Actions, repository `vinayak-sarvam/n8n-sarvam-node`, workflow **`publish.yml`**. Alternatively, store an **`NPM_TOKEN`** secret in GitHub (granular token with write access to this package).
2. Either:
   - **Tag the version already in `package.json`:** with `main` at the version you want (for example `0.1.6`), run `git tag 0.1.6 && git push origin 0.1.6`, **or**
   - **Interactive bump:** on `main`, run **`npm run release`** to bump the version, update the changelog, commit, tag, and push (nothing is published from your laptop).
3. Pushing a semver tag matching `*.*.*` triggers [`.github/workflows/publish.yml`](.github/workflows/publish.yml), which runs lint, build, and **`npm publish`** with provenance.

### Publish from your machine (interim)

For a **manual** publish while CI is sorted out, log in to npm (`npm login` or a valid `~/.npmrc` token), then from the repo root:

```bash
npm run publish:cli
```

That runs lint, build, then **`npm publish`** with **`RELEASE_MODE=true`** (so `prepublishOnly` passes) and **`--provenance=false`** (local publishes cannot satisfy `publishConfig.provenance` the way CI does). **n8n Cloud verification still expects** a GitHub Actions publish with provenance when you submit.

If **`npm whoami`** or publish returns **`401 Unauthorized`**, npm is using a **bad or revoked token** (or a stale line in an **`.npmrc`**). Run **`npm logout`**, delete any **`//registry.npmjs.org/`** auth lines in **`~/.npmrc`** and in **this repo’s `.npmrc`** if you created one, revoke the old token on [npmjs.com](https://www.npmjs.com/settings/~/tokens), then **`npm login`** or set a **new** granular write token. Do not commit **`.npmrc`** (it is gitignored).

Keep **`package.json` `version` and `nodes/` on `main` aligned** with what you intend to ship; the published tarball must match this repository.

If the **Publish** workflow shows provenance then **`E404` on `PUT …/n8n-nodes-sarvam`**: that response usually means **no publish permission** (not a missing package). Use **npm ≥11.5.1**, Node **≥22.14**, and a **`repository.url`** that matches this GitHub repo. For **Trusted Publishers (OIDC)** only: remove the **`environment: NPM_TOKEN`** line from [`.github/workflows/publish.yml`](.github/workflows/publish.yml) if you do not use that GitHub Environment (otherwise the job can fail before publish). Delete any unused **`NPM_TOKEN`** secret; the workflow uses **`NODE_AUTH_TOKEN=""`** with `registry-url` for OIDC (see [setup-node#1440](https://github.com/actions/setup-node/issues/1440)). For **token publish**, keep **`NPM_TOKEN`**. If that value is stored under **Settings → Environments → … → Environment secrets**, the workflow job must declare **`environment: <that-environment-name>`** (this repo uses **`NPM_TOKEN`**) or GitHub never injects the secret and you get **`ENEEDAUTH`**. Repository-level **Actions** secrets do not need `environment:`.

If the log shows **`NPM_TOKEN length: …`** but **`npm whoami` → 401**, the secret value is **not a valid npm credential** (revoked, expired, typo, or not **Read and write** for `n8n-nodes-sarvam`). Create a **new granular token** on [npmjs.com](https://www.npmjs.com/settings/~/tokens) while logged in as **`vinayak-sarvam`**, paste the full value into the **`NPM_TOKEN`** environment secret, and re-run the workflow. **`npm whoami`** in the log must succeed and print **`vinayak-sarvam`** before publish.

## Resources

- [Sarvam AI Documentation](https://docs.sarvam.ai)
- [API Reference](https://docs.sarvam.ai/api-reference-docs/introduction)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)
