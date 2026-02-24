"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    isSparkle?: boolean;
    life?: number;
}

export default function NeuronBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let sparkles: Particle[] = [];
        const particleCount = 100;
        const connectionDistance = 160;
        const mouse = { x: -1000, y: -1000 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 2 + 1,
                });
            }
        };

        const createSparkle = () => {
            if (Math.random() > 0.98) { // Rare event
                sparkles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    size: Math.random() * 3 + 2,
                    isSparkle: true,
                    life: 1.0,
                });
            }
        };

        const drawSparkle = (ctx: CanvasRenderingContext2D, s: Particle) => {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.beginPath();
            // Draw a cross/star shape for the sparkle
            const r = s.size * 2 * (s.life || 1);
            ctx.moveTo(-r, 0);
            ctx.lineTo(r, 0);
            ctx.moveTo(0, -r);
            ctx.lineTo(0, r);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * (s.life || 1)})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Inner glow
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2);
            gradient.addColorStop(0, `rgba(20, 184, 166, ${0.4 * (s.life || 1)})`);
            gradient.addColorStop(1, "rgba(20, 184, 166, 0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, r * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            createSparkle();

            // Update and draw sparkles
            sparkles = sparkles.filter(s => {
                s.x += s.vx;
                s.y += s.vy;
                s.life = (s.life || 0) - 0.02;
                if (s.life > 0) {
                    drawSparkle(ctx, s);
                    return true;
                }
                return false;
            });

            // Update and draw particles
            particles.forEach((p, i) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(20, 184, 166, 0.5)";
                ctx.fill();

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(20, 184, 166, ${0.3 * (1 - dist / connectionDistance)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }

                // Mouse interaction
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < connectionDistance * 1.5) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(20, 184, 166, ${0.2 * (1 - mdist / (connectionDistance * 1.5))})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[1]"
            style={{ mixBlendMode: "screen" }}
        />
    );
}
