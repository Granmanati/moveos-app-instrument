import { useState, useEffect, useCallback, useRef } from 'react';
import type { ExecutionStatus, ExecutionState, SessionBlock } from './executionEngine/types';

interface UseExecutionEngineProps {
    blocks: SessionBlock[];
    onComplete: (state: ExecutionState) => void;
}

export function useExecutionEngine({ blocks, onComplete }: UseExecutionEngineProps) {
    const [state, setState] = useState<ExecutionState>({
        status: 'READY',
        currentBlockIndex: 0,
        currentExerciseIndex: 0,
        currentSet: 1,
        elapsedSeconds: 0,
        isTimerRunning: false,
        metrics: {
            startTime: Date.now(),
            endTime: null,
            totalVolume: 0,
            averagePain: 0,
            perceivedDifficulty: 0,
        }
    });

    const timerRef = useRef<number | null>(null);

    const currentBlock = blocks[state.currentBlockIndex];
    const currentExercise = currentBlock?.exercises[state.currentExerciseIndex];

    const startTimer = useCallback(() => {
        if (state.isTimerRunning) return;
        setState(prev => ({ ...prev, isTimerRunning: true, status: 'EXECUTING' }));
    }, [state.isTimerRunning]);

    const pauseTimer = useCallback(() => {
        setState(prev => ({ ...prev, isTimerRunning: false, status: 'PAUSED' }));
    }, []);

    useEffect(() => {
        if (state.isTimerRunning && state.status === 'EXECUTING') {
            timerRef.current = window.setInterval(() => {
                setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [state.isTimerRunning, state.status]);

    const nextStep = useCallback(() => {
        setState(prev => {
            const block = blocks[prev.currentBlockIndex];
            const exercise = block.exercises[prev.currentExerciseIndex];

            // Increment set
            if (prev.currentSet < exercise.sets) {
                return { ...prev, currentSet: prev.currentSet + 1, status: 'EXECUTING' };
            }

            // Next exercise in block
            if (prev.currentExerciseIndex < block.exercises.length - 1) {
                return {
                    ...prev,
                    currentExerciseIndex: prev.currentExerciseIndex + 1,
                    currentSet: 1,
                    status: 'EXERCISE_COMPLETE'
                };
            }

            // Next block
            if (prev.currentBlockIndex < blocks.length - 1) {
                return {
                    ...prev,
                    currentBlockIndex: prev.currentBlockIndex + 1,
                    currentExerciseIndex: 0,
                    currentSet: 1,
                    status: 'BLOCK_COMPLETE'
                };
            }

            // Session complete
            const finalState = {
                ...prev,
                status: 'SESSION_COMPLETE' as ExecutionStatus,
                isTimerRunning: false,
                metrics: { ...prev.metrics, endTime: Date.now() }
            };
            onComplete(finalState);
            return finalState;
        });
    }, [blocks, onComplete]);

    const updateMetrics = useCallback((updates: Partial<ExecutionState['metrics']>) => {
        setState(prev => ({
            ...prev,
            metrics: { ...prev.metrics, ...updates }
        }));
    }, []);

    return {
        state,
        currentBlock,
        currentExercise,
        startTimer,
        pauseTimer,
        nextStep,
        updateMetrics,
        progress: state.status === 'SESSION_COMPLETE' ? 1 : (state.currentBlockIndex / blocks.length)
    };
}
