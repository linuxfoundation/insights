import type {FieldMessageType} from "~/components/uikit/field/types/FieldMessageType";

interface FieldMessageTypeData{
  icon: string
}

export const fieldMessageTypeData: Record<FieldMessageType, FieldMessageTypeData> = {
  error: {
    icon: 'circle-exclamation',
  },
  hint: {
    icon: '',
  },
  warning: {
    icon: 'triangle-exclamation',
  },
  info: {
    icon: 'circle-info',
  },
};
