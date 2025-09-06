# PDF Q&A Application

A Next.js application that allows users to upload PDF documents and ask questions about their content using OpenAI's API with RAG (Retrieval-Augmented Generation).

## Features

- **PDF Upload**: Upload PDF documents with text extraction
- **Vector Embeddings**: Generate embeddings using OpenAI's text-embedding-ada-002 model
- **Vector Search**: In-memory vector storage with cosine similarity search
- **Q&A Interface**: Ask questions and get AI-powered answers based on document content
- **Protected API Routes**: Secure API endpoints with authentication
- **Multiple Documents**: Support for multiple PDF uploads with document-specific search

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **AI**: OpenAI API (GPT-3.5-turbo, text-embedding-ada-002)
- **PDF Processing**: pdf-parse
- **Vector Storage**: In-memory (can be extended to Pinecone, Chroma, etc.)
- **Authentication**: API Key + JWT tokens

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

#### How to Generate Required Keys:

**APP_API_KEY** - Generate a secure 32-byte random hex string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**JWT_SECRET** - Generate another secure 32-byte random hex string:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OPENAI_API_KEY** - Get your API key from OpenAI:
1. Go to https://platform.openai.com/api-keys
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the generated key (starts with `sk-`)

#### Complete .env file example:

```env
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
APP_API_KEY=10cf6c05c255e17bee6ebfbc7db483e23c14d3f40d6b3e998ae38f91c18eb9ba
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
NEXT_PUBLIC_API_URL=http://localhost:3000

# Vector Database Configuration (using in-memory for simplicity)
VECTOR_DB_TYPE=memory

# Optional: If you want to use Pinecone
# PINECONE_API_KEY=your-pinecone-api-key
# PINECONE_ENVIRONMENT=your-environment
# PINECONE_INDEX=pdf-qa-index
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`.

## 🔑 **Important: Which API Key Does the App Ask For?**

When you first open the application at `http://localhost:3000`, it will ask you to enter an **API Key**. This is specifically asking for the **APP_API_KEY** (not the OpenAI API key).

### **Frontend Login:**
- **Required Key**: `APP_API_KEY` 
- **Where to get it**: Generate using the command below or use the pre-configured one
- **Pre-configured value**: `10cf6c05c255e17bee6ebfbc7db483e23c14d3f40d6b3e998ae38f91c18eb9ba`

### **Backend Configuration:**
- **OPENAI_API_KEY**: Used internally by the server to communicate with OpenAI
- **JWT_SECRET**: Used for token generation (if implementing JWT auth)
- **APP_API_KEY**: Used for frontend authentication and API route protection

**Quick Start**: Use `10cf6c05c255e17bee6ebfbc7db483e23c14d3f40d6b3e998ae38f91c18eb9ba` when the app asks for the API key.

## API Documentation

### Authentication

All API routes are protected and require either:
- **API Key**: Include `x-api-key` header with your API key
- **JWT Token**: Include `Authorization: Bearer <token>` header

### Endpoints

#### 1. Upload PDF (`POST /api/upload`)

Upload and process a PDF document.

**Headers:**
```
x-api-key: your-api-key
Content-Type: multipart/form-data
```

**Body:**
```
FormData with 'file' field containing PDF
```

**Response:**
```json
{
  "message": "PDF processed successfully",
  "filename": "document.pdf",
  "chunks": 15,
  "textLength": 5420
}
```

#### 2. Ask Question (`POST /api/ask`)

Ask a question about uploaded documents.

**Headers:**
```
x-api-key: your-api-key
Content-Type: application/json
```

**Body:**
```json
{
  "question": "What is the main topic discussed?",
  "filename": "document.pdf" // Optional: search specific document
}
```

**Response:**
```json
{
  "answer": "The main topic discussed is...",
  "sources": [
    {
      "filename": "document.pdf",
      "chunkIndex": 2,
      "content": "Relevant text excerpt..."
    }
  ],
  "context": "Context used for generating answer..."
}
```

#### 3. List Documents (`GET /api/documents`)

Get list of uploaded documents.

**Headers:**
```
x-api-key: your-api-key
```

**Response:**
```json
{
  "documents": [
    {
      "filename": "document.pdf",
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 4. Delete Document (`DELETE /api/documents?filename=document.pdf`)

Delete a specific document.

**Headers:**
```
x-api-key: your-api-key
```

**Response:**
```json
{
  "message": "Document document.pdf deleted successfully"
}
```

## Usage Guide

### 1. Get API Key

1. Generate a secure API key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Add it to your `.env` file as `APP_API_KEY`

### 2. Upload PDF

1. Open the application
2. Enter your API key when prompted
3. Click or drag-and-drop a PDF file to upload
4. Wait for processing to complete

### 3. Ask Questions

1. Once a PDF is uploaded, use the Q&A section
2. Optionally select a specific document (if multiple uploaded)
3. Type your question and click "Ask Question"
4. View the AI-generated answer with source references

## Architecture

### PDF Processing Pipeline

1. **File Upload**: Accept PDF file via multipart form data
2. **Text Extraction**: Use pdf-parse to extract text content
3. **Text Chunking**: Split text into manageable chunks with overlap
4. **Embedding Generation**: Create vector embeddings using OpenAI
5. **Vector Storage**: Store embeddings in vector database

### Q&A Pipeline

1. **Question Processing**: Generate embedding for user question
2. **Similarity Search**: Find most relevant document chunks
3. **Context Assembly**: Combine relevant chunks as context
4. **Answer Generation**: Use OpenAI GPT to generate answer
5. **Source Attribution**: Return answer with source references

### Security Features

- API key authentication for all routes
- File type validation (PDF only)
- File size limits (10MB max)
- Input sanitization and validation
- Error handling and logging

## Extending the Application

### Vector Database Integration

Replace the in-memory vector store with a proper vector database:

```typescript
// Example: Pinecone integration
import { PineconeClient } from 'pinecone-client';

class PineconeVectorStore {
  private client: PineconeClient;
  
  constructor() {
    this.client = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
      environment: process.env.PINECONE_ENVIRONMENT!,
    });
  }
  
  async storeDocuments(filename: string, chunks: DocumentChunk[]) {
    // Implementation for Pinecone
  }
  
  async searchSimilar(queryEmbedding: number[], topK: number = 5) {
    // Implementation for Pinecone
  }
}
```

### Additional Features

- User authentication and sessions
- Document management (edit, delete, organize)
- Conversation history
- Different AI models support
- Batch processing for multiple files
- Real-time processing status
- Document previews
- Advanced search filters

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
