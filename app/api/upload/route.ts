import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { extractTextFromPDF, createDocumentChunks } from '@/lib/pdf-processor';
import { generateEmbeddings } from '@/lib/openai';
import { vectorStore } from '@/lib/vector-store';
import formidable from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const text = await extractTextFromPDF(buffer, file.name);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content found in PDF' },
        { status: 400 }
      );
    }

    // Create document chunks
    const chunks = createDocumentChunks(text, file.name);

    // Generate embeddings for each chunk
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await generateEmbeddings(chunk.content);
        return { ...chunk, embedding };
      })
    );

    // Store in vector database
    await vectorStore.storeDocuments(file.name, chunksWithEmbeddings);

    return NextResponse.json({
      message: 'PDF processed successfully',
      filename: file.name,
      chunks: chunks.length,
      textLength: text.length,
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
