export interface DropdownOption {
  label: string;
  value: string;
  description?: string;
}

export interface DropdownGroupOptions {
  label: string;
  items: DropdownOption[];
}

export const dropdownSizes = ['default', 'small'] as const;
export const dropdownTypes = ['filled', 'transparent'] as const;

export type DropdownSize = (typeof dropdownSizes)[number];
export type DropdownType = (typeof dropdownTypes)[number];

export interface DropdownProps {
  modelValue?: string;
  options: DropdownOption[] | DropdownGroupOptions[];
  placeholder?: string;
  disabled?: boolean;
  type?: DropdownType;
  size?: DropdownSize;
  showFilter?: boolean;
  showGroupBreaks?: boolean;
  icon?: string;
}
