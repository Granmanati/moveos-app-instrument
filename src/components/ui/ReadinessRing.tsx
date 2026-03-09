import React from 'react';
import { motion } from 'framer-motion';

interface ReadinessRingProps {
    score: number;
    status: string;
}

export const ReadinessRing: React.FC<ReadinessRingProps> = ({ score, status }) => {
    const radius = 90;
    const stroke = 1.5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center justify-center relative py-12">
            {/* Background Micro-Nodes */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-64 h-64 border-[0.5px] border-dashed border-[var(--mo-color-border-strong)] rounded-full animate-pulse" />
            </div>

            <svg
                height={radius * 2}
                width={radius * 2}
                className="rotate-[-90deg] relative z-10"
            >
                {/* Track */}
                <circle
                    stroke="var(--mo-color-border-subtle)"
                    fill="transparent"
                    strokeWidth={0.5}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress Fill */}
                <motion.circle
                    stroke="var(--mo-color-accent-system)"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-5xl font-light tracking-tight text-[var(--mo-color-text-primary)]"
                >
                    {score}
                </motion.span>
                <span className="mono text-[var(--mo-color-accent-system)] mt-1 tracking-widest">
                    {status}
                </span>
            </div>

            {/* Structural Nodes around the ring */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <div
                    key={angle}
                    className="absolute w-1 h-1 bg-[var(--mo-color-border-strong)] rounded-full z-10"
                    style={{
                        transform: `rotate(${angle}deg) translateY(-${radius}px)`
                    }}
                />
            ))}
        </div>
    );
};
