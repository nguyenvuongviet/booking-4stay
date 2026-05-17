import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private model;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

    this.model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite',
    });
  }

  async generate(prompt: string) {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async stream(prompt: string) {
    const result = await this.model.generateContentStream(prompt);

    return result.stream;
  }
}
