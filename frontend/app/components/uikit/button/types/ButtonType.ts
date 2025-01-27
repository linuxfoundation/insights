export const buttonTypes = ["primary", "secondary", "success", "info", "warn", "help", "danger", "contrast"] as const;

export type ButtonType = (typeof buttonTypes)[number];
