import { useToast } from 'primevue/usetoast';
import type { ToastOptions, ToastSeverity, ToastType } from './types/toast.types';

export default class ToastService {
  private toast = useToast();

  constructor() {
    this.toast = useToast();
  }

  public showToast(message: string, toastType: ToastType, icon?: string, delay?: number) {
    const test: ToastOptions = {
      severity: toastType as ToastSeverity,
      summary: toastType,
      detail: message,
      closable: false,
      icon,
      life: delay
    };
    this.toast.add(test);
  }
}
