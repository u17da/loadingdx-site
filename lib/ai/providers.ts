/**
 * lib/ai/providers.ts
 * OpenAI モデル定義 + 画像生成モデル（DALL·E）を export
 */
import { generateText } from 'ai';
import type { ImageModel } from 'ai';        // ← 追加

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

/* ────────── ① Chat / Text 系モデル ────────── */
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

      /* ────────── ② 画像生成モデル ────────── */
      imageModels: {
        'prompt-image': {
          async doGenerate(
            { prompt: userPrompt }: { prompt: string },
          ) {
            // 1) GPT-4o mini でプロンプト整形
            const { text: refinedPrompt } = await generateText({
              model: openai('gpt-4o-mini'),
              system:
                'あなたは画像生成のプロンプトエンジニアです。' +
                'ユーザー入力を DALL·E 向けに詳細化してください。',
              prompt: userPrompt,
            });

            // 2) DALL·E-2 で画像生成
            const img = await openai
              .image('dall-e-2')
              .generateImage({
                prompt: refinedPrompt,
                size: '1024x1024',
              });

            return { url: img.url, prompt: refinedPrompt };
          },
        } satisfies ImageModel,   // ← 型チェック
      },
    });

/* ────────── ③ 外部へ export ────────── */
export const imageModels = (myProvider as any).options?.imageModels;
export function isImagesEnabled(): boolean {
  return process.env.OPENAI_IMAGES_ENABLED === 'true';
}
