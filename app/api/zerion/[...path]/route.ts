// app/api/zerion/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ZERION_API_BASE = 'https://api.zerion.io';
const ZERION_API_KEY = process.env.ZERION_API_KEY;

if (!ZERION_API_KEY) {
  console.error('ZERION_API_KEY environment variable is not set');
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  if (!ZERION_API_KEY) {
    return NextResponse.json(
      { error: 'Zerion API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Reconstruct the path
    const path = params.path.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${ZERION_API_BASE}/v1/${path}${searchParams ? `?${searchParams}` : ''}`;

    console.log(`Proxying request to: ${url}`);

    // Forward the request to Zerion API
    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Authorization': `Basic ${Buffer.from(ZERION_API_KEY).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Zerion API error: ${response.status} ${response.statusText}`, errorText);
      
      return NextResponse.json(
        { 
          error: `Zerion API error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Add CORS headers for frontend access
    const headers = new Headers({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json',
    });

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers,
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Handle all HTTP methods
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}