import pdf from 'pdf-parse';

export interface DocumentChunk {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    filename: string;
    pageNumber?: number;
    chunkIndex: number;
  };
}

export async function extractTextFromPDF(buffer: Buffer, filename: string): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

export function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;
    
    // If we're not at the end, try to break at a sentence or paragraph
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end);
      const lastNewline = text.lastIndexOf('\n', end);
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > start + chunkSize * 0.5) {
        end = breakPoint + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter(chunk => chunk.length > 0);
}

export function createDocumentChunks(
  text: string, 
  filename: string, 
  chunkSize: number = 1000
): DocumentChunk[] {
  const chunks = chunkText(text, chunkSize);
  
  return chunks.map((content, index) => ({
    id: `${filename}-chunk-${index}`,
    content,
    metadata: {
      filename,
      chunkIndex: index,
    },
  }));
}
