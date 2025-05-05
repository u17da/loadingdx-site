/**
 * lib/ai/providers.ts
 * ──────────────────────────────────────────────
 * ❶ OpenAI  テキストモデル（GPT-4o など）
 * ❷ 画像生成モデル（DALL·E-2）
 * ❸ imageModels／isImagesEnabled を export
 */

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { openai } from '@ai-sdk/openai';          // ← ai-sdk ラッパ
import { generateText } from 'ai';                // ← テキスト生成ヘルパ
import { isTestEnvironment } from '../constants';

import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

/* ─────────────── ❶ Chat / Text 系モデル ─────────────── */

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

        // “推論可視化” 用 (middleware で <think>…</think> を抽出)
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('gpt-4o-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        // タイトル／ドキュメント生成 → GPT-3.5 turbo
        'title-model': openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },

      /* ─────────────── ❷ 画像生成モデル ─────────────── */
      imageModels: {
        /**
         * prompt-image
         * generate({ prompt }) → { url, prompt }
         */
        'prompt-image': {
          async generate({ prompt: userPrompt }: { prompt: string }) {
            /* 1) GPT-4o mini でプロンプト整形 */
            const { text: refinedPrompt } = await generateText({
              model: openai('gpt-4o-mini'),
              system:
                'あなたは画像生成のプロンプトエンジニアです。' +
                'ユーザー入力を DALL·E 向けに詳細化してください。',
              prompt: userPrompt,
            });

            /* 2) DALL·E-2 で 1 枚生成 */
            const { url } = await openai
              .image('dall-e-2')                // ← image モデルを取得
              .generate({
                prompt: refinedPrompt,
                size: '1024x1024',
              });                               // 返り値 { url }

            return { url, prompt: refinedPrompt };
          },
        } as any,                              // 型エラーを避けるため any
      },
    });

/* ─────────────── ❸ 外部へ export ─────────────── */

/** 画像モデル群を外から使いたい場合はこれを import */
export const imageModels = (myProvider as any).options?.imageModels;

/** 環境変数 OPENAI_IMAGES_ENABLED=true なら画像 API を有効化 */
export function isImagesEnabled(): boolean {
  return process.env.OPENAI_IMAGES_ENABLED === 'true';
}
