import { DocumentChunk } from './pdf-processor';

// Simple in-memory vector store for demonstration
// In production, you'd use a proper vector database like Pinecone, Weaviate, or Chroma
class InMemoryVectorStore {
  private documents: Map<string, DocumentChunk[]> = new Map();

  async storeDocuments(filename: string, chunks: DocumentChunk[]): Promise<void> {
    this.documents.set(filename, chunks);
  }

  async searchSimilar(
    queryEmbedding: number[], 
    filename?: string, 
    topK: number = 5
  ): Promise<DocumentChunk[]> {
    const allChunks: DocumentChunk[] = [];
    
    if (filename && this.documents.has(filename)) {
      allChunks.push(...this.documents.get(filename)!);
    } else {
      // Search across all documents
      const documentKeys = Array.from(this.documents.keys());
      for (const key of documentKeys) {
        const chunks = this.documents.get(key);
        if (chunks) {
          allChunks.push(...chunks);
        }
      }
    }

    // Filter chunks that have embeddings
    const chunksWithEmbeddings = allChunks.filter(chunk => chunk.embedding);

    // Calculate cosine similarity
    const similarities = chunksWithEmbeddings.map(chunk => ({
      chunk,
      similarity: this.cosineSimilarity(queryEmbedding, chunk.embedding!)
    }));

    // Sort by similarity and return top K
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.chunk);
  }

  async getDocuments(filename: string): Promise<DocumentChunk[]> {
    return this.documents.get(filename) || [];
  }

  async deleteDocument(filename: string): Promise<void> {
    this.documents.delete(filename);
  }

  async listDocuments(): Promise<string[]> {
    return Array.from(this.documents.keys());
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Singleton instance
export const vectorStore = new InMemoryVectorStore();
