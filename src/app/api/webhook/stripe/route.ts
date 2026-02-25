import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan as string;

                if (userId && plan) {
                    const customerId = session.customer as string | undefined;
                    const subscriptionId = session.subscription as string | undefined;

                    await prisma.profile.update({
                        where: { id: userId },
                        data: {
                            plan,
                            stripeCustomerId: customerId || null,
                            stripeSubscriptionId: subscriptionId || null,
                            subscriptionStatus: 'active',
                            subscriptionStartDate: new Date(),
                        },
                    });
                    console.log(`Updated user ${userId} to ${plan} plan`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const profile = await prisma.profile.findFirst({
                    where: { stripeCustomerId: customerId },
                });

                if (profile) {
                    const status = subscription.status === 'active' ? 'active'
                        : subscription.status === 'past_due' ? 'past_due'
                        : subscription.status === 'canceled' ? 'canceled'
                        : subscription.status === 'trialing' ? 'trialing'
                        : subscription.status;

                    // Access current_period_end safely - may differ across Stripe API versions
                    const periodEnd = (subscription as any).current_period_end
                        ?? (subscription as any).items?.data?.[0]?.current_period_end;

                    await prisma.profile.update({
                        where: { id: profile.id },
                        data: {
                            subscriptionStatus: status,
                            subscriptionEndDate: periodEnd
                                ? new Date(periodEnd * 1000)
                                : null,
                        },
                    });
                    console.log(`Updated subscription status for user ${profile.id}: ${status}`);
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                const profile = await prisma.profile.findFirst({
                    where: { stripeCustomerId: customerId },
                });

                if (profile) {
                    await prisma.profile.update({
                        where: { id: profile.id },
                        data: {
                            plan: 'free',
                            subscriptionStatus: 'canceled',
                            stripeSubscriptionId: null,
                        },
                    });
                    console.log(`Downgraded user ${profile.id} to free plan`);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                const profile = await prisma.profile.findFirst({
                    where: { stripeCustomerId: customerId },
                });

                if (profile) {
                    await prisma.profile.update({
                        where: { id: profile.id },
                        data: {
                            subscriptionStatus: 'past_due',
                        },
                    });
                    console.log(`Marked payment failed for user ${profile.id}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Error processing webhook:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
