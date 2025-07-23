// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { zerionService } from '@/lib/services/ZerionService';

export async function GET() {
  try {
    const checks = {
      api: true,
      zerion: await zerionService.healthCheck(),
      timestamp: new Date().toISOString(),
    };

    const isHealthy = Object.values(checks).every(check => 
      typeof check === 'boolean' ? check : true
    );

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      checks,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Health check failed' },
      { status: 500 }
    );
  }
}