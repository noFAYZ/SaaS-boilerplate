// app/api/wallet/[address]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { zerionService } from '@/lib/services/ZerionService';
import { ValidationService, walletSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logger/Logger';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = ValidationService.validate(walletSchema, { address: params.address });
    
    const summary = await zerionService.getWalletSummary(address);
    
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    logger.error('Wallet API error', { error, address: params.address });
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'WALLET_FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}