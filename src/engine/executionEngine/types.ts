export type ExecutionStatus =
    | 'IDLE'
    | 'SET_READY'
    | 'SET_EXECUTING'
    | 'RESTING'
    | 'EXERCISE_COMPLETE'
    | 'BLOCK_COMPLETE'
    | 'SESSION_COMPLETE';

export interface SessionExercise {
    id: string;
    name: string;
    description?: string;
    sets: number;
    reps: string;
    rest: number;
    completed_sets?: number;
    is_completed?: boolean;
}

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
