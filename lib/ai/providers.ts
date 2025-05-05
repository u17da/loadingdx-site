/**
 * lib/ai/providers.ts
 * ―――――――――――――――――――――――――――――――
 * 1. OpenAI 言語モデル (GPT-4o / GPT-3.5)
 * 2. 画像生成モデル (DALL·E)        … imageModels に追加
 * 3. imageModels / isImagesEnabled … 外部から呼び出せるよう export
 */

import { generateText } from 'ai';              // ← prompt 整形用
import { openai }       from '@ai-sdk/openai';  // ← OpenAI SDK

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

/* ────────────── ① Chat / Text 系モデル ────────────── */

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model'            : chatModel,
        'chat-model-reasoning'  : reasoningModel,
        'title-model'           : titleModel,
        'artifact-model'        : artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // メインチャット → GPT-4o mini
        'chat-model': openai('gpt-4o-mini'),

        // 推論可視化 → GPT-4o mini + reasoning middleware
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('gpt-4o-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        // タイトル／ドキュメント生成 → GPT-3.5 turbo
        'title-model'   : openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },

      /* ────────────── ② 画像生成モデル ────────────── */
      imageModels: {
        /**
         * prompt-image:
         *   generate({ prompt }) → { url, prompt }
         */
        'prompt-image': {
          async generate({ prompt: userPrompt }: { prompt: string }) {
            /* 1) GPT-4o mini でプロンプト整形 */
            const { text: refinedPrompt } = await generateText({
              model : openai('gpt-4o-mini'),
              system:
                'あなたは画像生成のプロンプトエンジニアです。' +
                'ユーザー入力を DALL·E 向けに詳細化してください。',
              prompt: userPrompt,
            });

            /* 2) DALL·E-2 で画像生成 (1 枚) */
            const img = await openai.images.generate({
              model : 'dall-e-2',
              prompt: refinedPrompt,
              n     : 1,
              size  : '1024x1024',
            });

            return { url: img.data[0].url, prompt: refinedPrompt };
          },
        } as any,          // 型チェックをスキップ（SDK が v1 draft のため）
      },
    });                   // ★ customProvider の括弧を閉じる

/* ────────────── ③ 外部へ export ────────────── */

/** 画像モデル群を他ファイルから使えるよう公開 */
export const imageModels = (myProvider as any).options?.imageModels;

/** OPENAI_IMAGES_ENABLED=true のときだけ画像 API を有効化 */
export function isImagesEnabled(): boolean {
  return process.env.OPENAI_IMAGES_ENABLED === 'true';
}
