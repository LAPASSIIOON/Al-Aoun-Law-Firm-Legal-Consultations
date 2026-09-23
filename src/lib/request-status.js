const WORKFLOWS = {
  consultations: {
    progress: ['cleared', 'contacted', 'assigned', 'in_progress'],
    complete: ['closed', 'completed', 'conflict_found', 'declined'],
  },
  referrals: {
    progress: ['cleared', 'contacted', 'partner_matching', 'partner_contacted', 'client_introduced', 'handled_internally', 'active'],
    complete: ['completed', 'closed', 'conflict_found', 'no_coverage', 'declined'],
  },
  partnerships: {
    progress: ['cleared', 'contacted'],
    complete: ['active', 'completed', 'closed', 'declined', 'conflict_found'],
  },
};

export function requestPhaseIndex(type, stage) {
  const workflow = WORKFLOWS[type] || WORKFLOWS.consultations;
  if (stage === 'new') return 0;
  if (workflow.progress.includes(stage)) return 2;
  if (workflow.complete.includes(stage)) return 3;
  return 1;
}
