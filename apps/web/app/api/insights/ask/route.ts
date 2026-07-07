import { NextRequest, NextResponse } from 'next/server';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_SECRET = process.env.AI_SERVICE_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let res: Response;
    try {
      res = await fetch(`${AI_SERVICE_URL}/insights/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': AI_SERVICE_SECRET,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: { message: 'Could not generate insight' } },
        { status: res.status }
      );
    }
    return NextResponse.json(data);
  } catch (error) {
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json(
      { error: { message: isTimeout ? 'Request timed out' : 'Something went wrong' } },
      { status: 503 }
    );
  }
}
