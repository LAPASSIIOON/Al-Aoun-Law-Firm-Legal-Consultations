import styles from './RequestStatusTimeline.module.css';
import { requestPhaseIndex } from '@/lib/request-status.js';

export default function RequestStatusTimeline({ type, stage, labels }) {
  const current = requestPhaseIndex(type, stage);
  const phases = labels.phases[type] || labels.phases.consultations;

  return (
    <div className={styles.timeline} role="group" aria-label={labels.timelineLabel}>
      <ol className={styles.steps}>
        {phases.map((phase, index) => {
          const state = index < current ? 'complete' : index === current ? 'current' : 'upcoming';
          return (
            <li key={phase} className={`${styles.step} ${styles[state]}`} aria-current={state === 'current' ? 'step' : undefined}>
              <span className={styles.marker} aria-hidden="true">{state === 'complete' ? '✓' : index + 1}</span>
              <span className={styles.phase}>{phase}</span>
            </li>
          );
        })}
      </ol>
      <p className={styles.next}><strong>{labels.nextLabel}</strong> {labels.help[current]}</p>
    </div>
  );
}
