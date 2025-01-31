export interface Tab {
  value: string;
  label: string;
  icon?: string;
}

export interface TabsProps {
  modelValue: string;
  tabs: Tab[];
}

export interface TabsEmits {
  (e: 'update:modelValue', value: string): void;
}
