import styles from './GradientRule.module.css';

/**
 * @param {{ centered?: boolean }} props
 */
export function GradientRule({ centered = false }) {
  return (
    <div
      className={`${styles.rule} ${centered ? styles['rule--center'] : ''}`}
      aria-hidden="true"
    />
  );
}
