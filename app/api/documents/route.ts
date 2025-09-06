import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { vectorStore } from '@/lib/vector-store';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const documents = await vectorStore.listDocuments();
    
    return NextResponse.json({
      documents: documents.map(filename => ({
        filename,
        uploadedAt: new Date().toISOString(), // In a real app, you'd store this
      })),
    });

  } catch (error) {
    console.error('Documents list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    if (!authenticateRequest(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    await vectorStore.deleteDocument(filename);
    
    return NextResponse.json({
      message: `Document ${filename} deleted successfully`,
    });

  } catch (error) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
