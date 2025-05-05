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

      // ← ここから imageModels ブロック
      imageModels: {
        // ユーザー入力を GPT-4o で磨いてから DALL·E で生成
        async generateWithPromptEngineering(userPrompt: string) {
          // 1) プロンプト整形
          const refineRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'あなたは画像生成のプロンプトエンジニアです。' +
                  '以下のユーザー入力を、DALL·E 向けの詳細な指示文に書き換えてください。',
              },
              { role: 'user', content: userPrompt },
            ],
          });
          const refinedPrompt = refineRes.choices[0].message.content;

          // 2) DALL·E で画像生成
          const imgRes = await openai.images.generate({
            model: 'dall-e-2',
            prompt: refinedPrompt,
            n: 1,
            size: '1024x1024',
          });
          return { url: imgRes.data[0].url, prompt: refinedPrompt };
        },
      }, // ← imageModels ブロックここまで

    });

// imageModels の有効／無効をチェックする関数は customProvider の外に置く
export function isImagesEnabled(): boolean {
  return process.env.OPENAI_IMAGES_ENABLED === 'true';
}
