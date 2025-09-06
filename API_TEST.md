# API Test Script

This script demonstrates how to test the PDF Q&A application API endpoints.

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Set your environment variables in `.env`:
```bash
APP_API_KEY=your-secure-api-key-here
OPENAI_API_KEY=sk-your-openai-api-key-here
JWT_SECRET=your-jwt-secret-here
```

## Test Cases

### 1. Upload PDF Document

```bash
curl -X POST \
  http://localhost:3000/api/upload \
  -H "x-api-key: your-secure-api-key-here" \
  -F "file=@path/to/your/document.pdf"
```

Expected Response:
```json
{
  "message": "PDF processed successfully",
  "filename": "document.pdf",
  "chunks": 15,
  "textLength": 5420
}
```

### 2. Ask Question About Uploaded Document

```bash
curl -X POST \
  http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secure-api-key-here" \
  -d '{
    "question": "What is the main topic discussed in the document?",
    "filename": "document.pdf"
  }'
```

Expected Response:
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

### 3. List Uploaded Documents

```bash
curl -X GET \
  http://localhost:3000/api/documents \
  -H "x-api-key: your-secure-api-key-here"
```

Expected Response:
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

### 4. Delete Document

```bash
curl -X DELETE \
  "http://localhost:3000/api/documents?filename=document.pdf" \
  -H "x-api-key: your-secure-api-key-here"
```

Expected Response:
```json
{
  "message": "Document document.pdf deleted successfully"
}
```

## Frontend Testing

1. Open http://localhost:3000 in your browser
2. Enter your API key when prompted
3. Upload a PDF document
4. Ask questions about the document content
5. View the AI-generated answers with source references

## Error Handling

### Authentication Errors
```json
{
  "error": "Unauthorized"
}
```

### File Upload Errors
```json
{
  "error": "Only PDF files are allowed"
}
```

### Processing Errors
```json
{
  "error": "No text content found in PDF"
}
```

### Q&A Errors
```json
{
  "error": "Question is required"
}
```

## Security Features Tested

- ✅ API key authentication on all routes
- ✅ File type validation (PDF only)
- ✅ Input sanitization and validation
- ✅ Error handling and logging
- ✅ Content-Type validation
- ✅ File size limitations
