import { useState } from 'react';
import styles from './VideoHUDPreview.module.css';
import { Icon } from './Icon';

interface VideoHUDPreviewProps {
    videoUrl: string | null;
    pattern: string;
    name: string;
    sets?: number;
    repsMin?: number;
    repsMax?: number;
    repsText?: string;
    restSeconds?: number;
    className?: string;
}

export function VideoHUDPreview({
    videoUrl,
    pattern,
    name,
    sets,
    repsMin,
    repsMax,
    repsText,
    restSeconds,
    className = ''
}: VideoHUDPreviewProps) {
    const [isMuted, setIsMuted] = useState(true);

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const hasMeta = !!sets || !!repsMin || !!repsText || !!restSeconds;

    return (
        <div className={`${styles.videoContainer} ${className}`}>
            {videoUrl ? (
                <video
                    src={videoUrl}
                    playsInline
                    muted={isMuted}
                    loop
                    autoPlay
                    preload="metadata"
                    className={styles.thumbnailVideo}
                />
            ) : (
                <div className={styles.thumbnailPlaceholder}>
                    <Icon name="play_circle" style={{ color: 'rgba(255,255,255,0.5)' }} size={48} />
                </div>
            )}

            <div className={styles.scrim}></div>

            <div className={styles.topRow}>
                <div className={styles.patternChip}>{pattern || 'Movement'}</div>
                {videoUrl && (
                    <button className={styles.muteToggle} onClick={toggleMute} aria-label="Toggle mute">
                        <Icon name={isMuted ? "volume_off" : "volume_up"} size={18} />
                    </button>
                )}
            </div>

            <div className={styles.overlayContent}>
                <h3 className={styles.cardTitle}>{name}</h3>

                {hasMeta && (
                    <div className={styles.metaPillRow}>
                        {sets && <span className={styles.metaPill}>{sets} Sets</span>}
                        {(repsText || repsMin) && (
                            <span className={styles.metaPill}>
                                {repsText ? repsText : (repsMax ? `${repsMin}-${repsMax} Reps` : `${repsMin} Reps`)}
                            </span>
                        )}
                        {restSeconds && <span className={styles.metaPill}>{restSeconds}s Rest</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
