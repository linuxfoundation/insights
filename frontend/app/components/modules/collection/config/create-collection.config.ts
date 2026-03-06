// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type { Component } from 'vue';
import StepDetails from '../components/create-modal/steps/step-details.vue';
import StepProjects from '../components/create-modal/steps/step-projects.vue';
import StepVisibility from '../components/create-modal/steps/step-visibility.vue';

export interface CreateCollectionStep {
  label: string;
  component: Component;
}

export interface CollectionProject {
  name: string;
  slug: string;
  logo: string | null;
}

export interface CreateCollectionForm {
  name: string;
  description: string;
  projects: CollectionProject[];
  visibility: 'private' | 'public';
}

export const createCollectionSteps: CreateCollectionStep[] = [
  {
    label: 'Collection details',
    component: StepDetails,
  },
  {
    label: 'Add projects',
    component: StepProjects,
  },
  {
    label: 'Visibility',
    component: StepVisibility,
  },
];

export const createCollectionTemplate: CreateCollectionForm = {
  name: '',
  description: '',
  projects: [],
  visibility: 'private',
};
