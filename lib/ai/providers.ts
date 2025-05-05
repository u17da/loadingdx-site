/**
 * lib/ai/providers.ts
 * ───────────────────────────────────────────
 * ① GPT-4o / GPT-3.5 のチャットモデル
 * ② DALL·E-2 を使う画像モデル (prompt-image)
 * ③ 画像 API 有効判定と外部 export
 */

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  type ImageModelV1,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

/* ─────────── ① テキスト系モデル ─────────── */

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openai('gpt-4o-mini'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('gpt-4o-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },

      /* ─────────── ② 画像モデル群 ─────────── */
      imageModels: {
        'prompt-image': {
          /** 必須フィールド５つを全部入れる */
          specificationVersion: 1,
          provider: 'openai',
          modelId: 'dall-e-2',
          maxImagesPerCall: 1,

          /** 実際に 1 枚生成して URL を返す */
          async doGenerate({ prompt: userPrompt }: { prompt: string }) {
            /* 1) GPT-4o mini でプロンプト整形 */
            const refine = await openai.chat.generateText({
              model: openai('gpt-4o-mini'),
              system:
                'あなたは画像生成のプロンプトエンジニアです。' +
                '以下のユーザー入力を DALL·E 向けの詳細な英語プロンプトに書き換えてください。',
              prompt: userPrompt,
            });
            const refinedPrompt = refine.text.trim() || userPrompt;

            /* 2) DALL·E-2 で生成 */
            const img = await openai.image('dall-e-2').generate({
              prompt: refinedPrompt,
              size: '1024x1024',
            });

            return { url: img.url, prompt: refinedPrompt };
          },
        } satisfies ImageModelV1,
      },
    });

/* ─────────── ③ 外部 export ─────────── */

export const imageModels = (myProvider as any).options!.imageModels;
/** 環境変数 OPENAI_IMAGES_ENABLED=true なら画像 API を有効化 */
export function isImagesEnabled(): boolean {
  return process.env.OPENAI_IMAGES_ENABLED === 'true';
}
