import { NextResponse } from 'next/server';
import { imageModels, isImagesEnabled } from '../../../../lib/ai/providers';

export async function POST(request: Request) {
  // 画像生成機能が有効かチェック
  if (!isImagesEnabled()) {
    return NextResponse.json(
      { error: 'Image generation disabled' },
      { status: 403 }
    );
  }

  // リクエストからプロンプトを取得
  const { prompt: userPrompt } = await request.json();

  try {
    // GPT-4o でプロンプト整形 → DALL·E で画像生成
    const { url, prompt: finalPrompt } = await imageModels.generateWithPromptEngineering(userPrompt);

    // 生成結果を返却
    return NextResponse.json({ url, prompt: finalPrompt });
  } catch (err) {
    console.error('Image generation error', err);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
