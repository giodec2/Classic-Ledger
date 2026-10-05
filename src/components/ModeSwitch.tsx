import { useNavigation } from '@/hooks/NavigationContext';

export function ModeSwitch() {
  const { mode, switchMode } = useNavigation();
  return (
    <div className="course-mode-switch" role="group" aria-label="Course mode">
      {(['financial', 'managerial'] as const).map(value => (
        <button key={value} type="button" aria-pressed={mode === value} onClick={() => switchMode(value)}>
          {value === 'financial' ? 'Financial' : 'Managerial'}
          {mode === value && <span className="sr-only"> — active</span>}
        </button>
      ))}
    </div>
  );
}
