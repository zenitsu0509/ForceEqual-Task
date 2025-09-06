import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { generateEmbeddings, generateAnswer } from '@/lib/openai';
import { vectorStore } from '@/lib/vector-store';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { question, filename } = body;

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the question
    const questionEmbedding = await generateEmbeddings(question);

    // Search for similar chunks
    const similarChunks = await vectorStore.searchSimilar(
      questionEmbedding,
      filename, // Optional: search only in specific document
      5 // Top 5 most similar chunks
    );

    if (similarChunks.length === 0) {
      return NextResponse.json({
        answer: 'No relevant information found in the uploaded documents.',
        sources: [],
      });
    }

    // Combine relevant chunks as context
    const context = similarChunks
      .map((chunk, index) => `[${index + 1}] ${chunk.content}`)
      .join('\n\n');

    // Generate answer using OpenAI
    const answer = await generateAnswer(question, context);

    // Prepare source information
    const sources = similarChunks.map((chunk) => ({
      filename: chunk.metadata.filename,
      chunkIndex: chunk.metadata.chunkIndex,
      content: chunk.content.substring(0, 200) + '...', // Preview
    }));

    return NextResponse.json({
      answer,
      sources,
      context: context.substring(0, 500) + '...', // Preview of context used
    });

  } catch (error) {
    console.error('Q&A error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
