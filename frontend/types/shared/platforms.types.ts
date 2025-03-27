export interface ActivityType {
  key: string;
  label: string;
}

export interface PlatformConfig {
  key: string;
  label: string;
  image: string;
  activityTypes: ActivityType[];
}
