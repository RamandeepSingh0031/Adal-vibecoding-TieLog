import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    try {
        const { plan, userId } = await req.json();
        const origin = req.headers.get('origin');

        let sessionParams: Stripe.Checkout.SessionCreateParams;

        if (plan === 'pro') {
            sessionParams = {
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'TieLog Pro Plan',
                                description: 'Advanced features for power networkers.',
                            },
                            unit_amount: 500, // $5.00
                            recurring: {
                                interval: 'month',
                            },
                        },
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/pricing`,
                metadata: {
                    userId: userId || '',
                    plan: 'pro',
                },
            };
        } else if (plan === 'lifetime') {
            sessionParams = {
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: 'TieLog Lifetime Membership',
                                description: 'One-time payment for eternal access.',
                            },
                            unit_amount: 9900, // $99.00
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/pricing`,
                metadata: {
                    userId: userId || '',
                    plan: 'lifetime',
                },
            };
        } else {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
