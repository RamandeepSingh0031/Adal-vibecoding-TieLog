import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/healthz
 * Lightweight liveness + readiness probe.
 * Returns 200 { status: "ok" } when the app and DB are healthy.
 * Returns 503 { status: "degraded", detail: "..." } when Supabase is unreachable.
 */
export async function GET() {
    try {
        // Lightweight probe — does not require auth, just checks Supabase reachability.
        const { error } = await supabase.auth.getSession();

        if (error) {
            return NextResponse.json(
                { status: 'degraded', detail: error.message },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { status: 'ok', timestamp: new Date().toISOString() },
            { status: 200 }
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json(
            { status: 'degraded', detail: message },
            { status: 503 }
        );
    }
}
