/**
 * lib/ai/providers.ts
 * ―――――――――――――――――――――――――――――――
 * OpenAI モデル定義と、画像生成モデル（DALL·E）＋有効判定関数を
 * export するだけのファイルです。
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

/* ─────────────── ① Chat / Text 系モデル ─────────────── */

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

        // タイトル・ドキュメント生成 → GPT-3.5 turbo
        'title-model': openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },

      /* ────────── ② 画像生成モデル ────────── */
      imageModels: {
        /**
         * ユーザープロンプトを GPT-4o で磨いてから
         * DALL·E-2 で画像を 1 枚生成するサンプル関数
         */
        async generateWithPromptEngineering(userPrompt: string) {
          // 1) プロンプト整形
          const refineRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'あなたは画像生成のプロンプトエンジニアです。' +
                  '以下のユーザー入力を DALL·E 向けの詳細な指示文に書き換えてください。',
              },
              { role: 'user', content: userPrompt },
            ],
          });

          const refinedPrompt =
            refineRes.choices[0].message.content?.trim() || userPrompt;

          // 2) DALL·E-2 で画像生成
          const imgRes = await openai.images.generate({
            model: 'dall-e-2',
            prompt: refinedPrompt,
            n: 1,
            size: '1024x1024',
          });

          return { url: imgRes.data[0].url, prompt: refinedPrompt };
        },
      },
    });

/* ─────────────── ③ 外部から使う export ─────────────── */

/** imageModels だけ個別に外へ出す */
export const imageModels = (myProvider as any).options?.imageModels;

/** 環境変数 OPENAI_IMAGES_ENABLED=true なら画像 API を有効にする */
export function isImagesEnabled(): boolean {
  return process.env.OPENAI_IMAGES_ENABLED === 'true';
}
