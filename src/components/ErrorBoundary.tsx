'use client';

import React from 'react';
import { logger } from '@/lib/logger';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    errorMessage: string;
}

/**
 * ErrorBoundary – catches unhandled render errors in the React tree,
 * logs them via the structured logger, and shows a friendly fallback UI.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <SomeComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, errorMessage: '' };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, errorMessage: error.message };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        logger.error('Unhandled render error caught by ErrorBoundary', {
            error: error.message,
            stack: error.stack,
            componentStack: info.componentStack ?? undefined,
        });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[200px] p-8 bg-[#141419] border border-[#2A2A35] rounded-2xl text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-[#F4F4F5] mb-2">Something went wrong</h3>
                    <p className="text-sm text-[#71717A] mb-6 max-w-sm">
                        An unexpected error occurred. Your data is safe — please refresh the page to continue.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, errorMessage: '' })}
                        className="px-4 py-2 bg-[#14B8A6] text-[#0A0A0F] rounded-xl font-medium hover:bg-[#0D9488] transition-colors text-sm"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
