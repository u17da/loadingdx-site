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
        // メインチャット → GPT-4o
        'chat-model': openai('gpt-4o-mini'),

        // 推論可視化 → GPT-4o ＋ reasoning middleware
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('gpt-4o-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),

        // タイトル・ドキュメント生成 → GPT-3.5
        'title-model': openai('gpt-3.5-turbo'),
        'artifact-model': openai('gpt-3.5-turbo'),
      },
      // 画像生成を使わなければ次の imageModels ブロックごと削除してOK
      // imageModels: {
      //   'small-model': openai.image('dall-e-3'),
      // },
    });
