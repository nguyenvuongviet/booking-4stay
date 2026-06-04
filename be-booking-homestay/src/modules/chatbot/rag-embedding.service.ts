import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RagEmbeddingService {
  private readonly logger = new Logger(RagEmbeddingService.name);
  private embeddingModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    this.embeddingModel = genAI.getGenerativeModel({
      model: 'gemini-embedding-2',
    });
  }

  /**
   * Tạo embedding vector từ văn bản
   */
  async embedText(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      this.logger.error(`Failed to embed text: ${error}`);
      throw error;
    }
  }

  /**
   * Tính cosine similarity giữa 2 vector
   * Kết quả trong khoảng [-1, 1], càng gần 1 càng tương đồng
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dot = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}
