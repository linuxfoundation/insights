export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  modelValue?: string;
  options: DropdownOption[];
  optionLabel?: string;
  optionValue?: string;
  placeholder?: string;
  disabled?: boolean;
  type?: 'field' | 'transparent';
  size?: 'default' | 'small';
}
