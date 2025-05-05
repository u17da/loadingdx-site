/**
 * lib/ai/providers.ts
 * OpenAI モデル定義 + 画像生成モデル（DALL·E）を export
 */

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

/* ─────────── ① Chat / Text 系モデル ─────────── */

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
        // メインチャット → GPT-4o mini
        'chat-model': openai('gpt-4o-mini'),

        // 推論可視化 → GPT-4o mini + reasoning middleware
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('gpt-4o-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        // タイトル／ドキュメント生成 → GPT-3.5 turbo
        'title-model': openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },

      /* ─────── ② 画像生成モデル ─────── */
      imageModels: {
        /**
         * prompt-image:
         * generate({ prompt }) → { url, prompt }
         */
        'prompt-image': {
          async generate({ prompt: userPrompt }: { prompt: string }) {
            // 1) GPT-4o でプロンプト整形
            const refine = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content:
                    'あなたは画像生成のプロンプトエンジニアです。' +
                    '以下のユーザー入力を DALL·E 向けに詳細化してください。',
                },
                { role: 'user', content: userPrompt },
              ],
            });

            const refinedPrompt =
              refine.choices[0].message.content?.trim() || userPrompt;

            // 2) DALL·E-2 で 1 枚生成
            const img = await openai.images.generate({
              model: 'dall-e-2',
              prompt: refinedPrompt,
              n: 1,
              size: '1024x1024',
            });

            return { url: img.data[0].url, prompt: refinedPrompt };
          },
        },
      },
    }); // ←★ ここで customProvider のカッコを閉じる！

/* ─────────── ③ 外部へ export ─────────── */

export const imageModels = (myProvider as any).options?.imageModels;

export function isImagesEnabled(): boolean {
  return process.env.OPENAI_IMAGES_ENABLED === 'true';
}
