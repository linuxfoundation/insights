export interface Tab {
  value: string;
  label: string;
  icon?: string;
}

export interface TabsProps {
  modelValue: string;
  tabs: Tab[];
  widthType?: 'full' | 'inline';
}

export interface TabsEmits {
  (e: 'update:modelValue', value: string): void;
}
