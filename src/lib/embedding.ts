import { GoogleGenAI } from "@google/genai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

type TaskType = "RETRIEVAL_DOCUMENT" | "QUESTION_ANSWERING";

export async function generateEmbedding(
  content: string,
  taskType: TaskType = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const result = await genai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: content,
    config: {
      taskType,
      outputDimensionality: EMBEDDING_DIMENSIONS,
    },
  });
  const values = result.embeddings?.[0]?.values;
  if (!values) {
    throw new Error("Embedding生成に失敗しました");
  }
  return values;
}
