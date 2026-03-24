import { GoogleGenAI, Type } from "@google/genai";

export async function generateArticles() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not found. Please ensure GEMINI_API_KEY is set in your environment variables.');
  }
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "请搜索并整理关于'漳州正兴学校'的最新新闻、办学特色、校园活动、师资力量等信息，并基于这些信息生成10篇高质量的校园新闻文章。每篇文章包含：title (标题), summary (摘要), content (正文, Markdown格式), category (分类: 校园新闻, 通知公告, 教学动态, 学子风采), coverImage (封面图URL, 使用picsum.photos生成相关的图)。请以JSON数组格式返回。",
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING },
            coverImage: { type: Type.STRING }
          },
          required: ["title", "summary", "content", "category", "coverImage"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
