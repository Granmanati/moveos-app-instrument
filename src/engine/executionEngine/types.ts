import type { SessionExercise } from '../../pages/TodayPage';

export type ExecutionStatus =
    | 'IDLE'
    | 'READY'
    | 'EXECUTING'
    | 'PAUSED'
    | 'EXERCISE_COMPLETE'
    | 'BLOCK_COMPLETE'
    | 'SESSION_COMPLETE';

export interface SessionBlock {
    name: string;
    exercises: SessionExercise[];
}

export interface ExecutionMetrics {
    startTime: number | null;
    endTime: number | null;
    totalVolume: number;
    averagePain: number;
    perceivedDifficulty: number;
}

export interface ExecutionState {
    status: ExecutionStatus;
    currentBlockIndex: number;
    currentExerciseIndex: number;
    currentSet: number;
    elapsedSeconds: number;
    isTimerRunning: boolean;
    metrics: ExecutionMetrics;
}
