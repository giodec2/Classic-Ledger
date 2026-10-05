import { useId } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ManagerialSelect<T extends string>({ label, accessibleLabel, value, options, onChange }: {
  label: string;
  accessibleLabel?: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const id = useId();
  return <div className="mp-select-field">
    <label htmlFor={id}>{label}</label>
    <Select value={value} onValueChange={value => onChange(value as T)}>
      <SelectTrigger id={id} className="mp-select-trigger" aria-label={accessibleLabel}><SelectValue /></SelectTrigger>
      <SelectContent className="mp-select-content" position="popper" align="start" sideOffset={4}>
        {options.map(option => <SelectItem className="mp-select-option" key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>;
}
