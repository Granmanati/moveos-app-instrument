import { useState, useEffect, useCallback, useRef } from 'react';
import type { ExecutionStatus, ExecutionState, SessionBlock } from './executionEngine/types';

interface UseExecutionEngineProps {
    blocks: SessionBlock[];
    onComplete: (state: ExecutionState) => void;
    rehydrationData?: {
        currentBlockIndex: number;
        currentExerciseIndex: number;
        currentSet: number;
    };
}

export function useExecutionEngine({ blocks, onComplete, rehydrationData }: UseExecutionEngineProps) {
    const [state, setState] = useState<ExecutionState>({
        status: 'SET_READY',
        currentBlockIndex: rehydrationData?.currentBlockIndex ?? 0,
        currentExerciseIndex: rehydrationData?.currentExerciseIndex ?? 0,
        currentSet: rehydrationData?.currentSet ?? 1,
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


    const pauseTimer = useCallback(() => {
        setState(prev => ({ ...prev, isTimerRunning: false }));
    }, []);

    const resetTimer = useCallback(() => {
        setState(prev => ({ ...prev, isTimerRunning: false, elapsedSeconds: 0 }));
    }, []);

    useEffect(() => {
        if (state.isTimerRunning) {
            timerRef.current = window.setInterval(() => {
                setState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [state.isTimerRunning]);

    const startSet = useCallback(() => {
        resetTimer();
        setState(prev => ({ ...prev, status: 'SET_EXECUTING', isTimerRunning: true }));
    }, [resetTimer]);

    const completeSet = useCallback(() => {
        pauseTimer();
        setState(prev => {
            const block = blocks[prev.currentBlockIndex];
            const exercise = block.exercises[prev.currentExerciseIndex];

            if (prev.currentSet < exercise.sets) {
                // More sets: Resting
                return { ...prev, status: 'RESTING', elapsedSeconds: 0, isTimerRunning: true };
            } else {
                // Last set of exercise
                return { ...prev, status: 'EXERCISE_COMPLETE' };
            }
        });
    }, [blocks, pauseTimer]);

    const skipRest = useCallback(() => {
        setState(prev => ({
            ...prev,
            status: 'SET_READY',
            currentSet: prev.currentSet + 1,
            elapsedSeconds: 0,
            isTimerRunning: false
        }));
    }, []);

    const nextExercise = useCallback(() => {
        setState(prev => {
            const block = blocks[prev.currentBlockIndex];

            if (prev.currentExerciseIndex < block.exercises.length - 1) {
                return {
                    ...prev,
                    currentExerciseIndex: prev.currentExerciseIndex + 1,
                    currentSet: 1,
                    status: 'SET_READY',
                    elapsedSeconds: 0,
                    isTimerRunning: false
                };
            } else if (prev.currentBlockIndex < blocks.length - 1) {
                return {
                    ...prev,
                    currentBlockIndex: prev.currentBlockIndex + 1,
                    currentExerciseIndex: 0,
                    currentSet: 1,
                    status: 'SET_READY',
                    elapsedSeconds: 0,
                    isTimerRunning: false
                };
            } else {
                const finalState = {
                    ...prev,
                    status: 'SESSION_COMPLETE' as ExecutionStatus,
                    isTimerRunning: false,
                    metrics: { ...prev.metrics, endTime: Date.now() }
                };
                onComplete(finalState);
                return finalState;
            }
        });
    }, [blocks, onComplete]);

    const updateMetrics = useCallback((updates: Partial<ExecutionState['metrics']>) => {
        setState(prev => ({
            ...prev,
            metrics: { ...prev.metrics, ...updates }
        }));
    }, []);

    const totalExercises = blocks.reduce((acc, b) => acc + b.exercises.length, 0);
    let completedExercises = 0;
    for (let i = 0; i < state.currentBlockIndex; i++) {
        completedExercises += blocks[i].exercises.length;
    }
    completedExercises += state.currentExerciseIndex;

    return {
        state,
        currentBlock,
        currentExercise,
        startSet,
        completeSet,
        skipRest,
        nextExercise,
        updateMetrics,
        progress: state.status === 'SESSION_COMPLETE' ? 1 : (completedExercises / totalExercises)
    };
}
