// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { formatNumber } from '~/components/shared/utils/formatter';

export interface OSIItem {
  name: string;
  count: number;
  softwareValue?: string;
  icon?: string;
  logoUrl?: string;
}

export interface OSIGroup {
  name: string;
  categoryName: string;
  count: number;
  softwareValue?: string;
  projects: OSIItem[];
  collections?: OSIItem[];
}

const valueDisplay = (value: string, icon: string) => [
    `<div class="value-display">`,
    `<i class="value-icon ${icon}"></i>`,
    `${value}`,
    `</div>`
  ].join('');

const itemDisplay = (item: OSIItem) => [
    `<div class="tooltip-row">`,
    `<div class="name-display">`,
    `<div class="name-icon">`,
    item.logoUrl
      ? `<img src="${item.logoUrl}" alt="${item.name}">`
      : `<i class="${item.icon}"></i>`,
    `</div>`,
    `<div class="name-text">${item.name}</div>`,
    `</div>`,
    valueDisplay(formatNumber(item.count || 0), 'fa-light fa-people-group'),
    item.softwareValue
      ? valueDisplay(item.softwareValue, 'fa-light fa-dollar-circle')
      : '',
    `</div>`
  ].join('');

const itemGroupDisplay = (items: OSIItem[], title: string) => [
    `<div class="flex flex-col gap-3 mt-4">`,
    `<div class="text-xs text-neutral-400 font-semibold">${title}</div>`,
    items.map((item) => itemDisplay(item)).join('') || '',
    `</div>`
  ].join('');

export const footerDisplay = () => [
    `<div class="footer-display">`,
    `<i class="footer-icon fa-light fa-circle-info"></i>`,
    `<div class="text-xs">Sorted by most contributors</div>`
  ].join('');

// This is the original tooltip template
// However, this is glitching the images because it refetches the images every time
// the user moves the mouse over the boxes
export const getOSITooltipTemplate = (group: OSIGroup) => [
    `<div class="osi-tooltip">`,
    `<div class="tooltip-group">${group.name}</div>`,
    `<div class="tooltip-title">${group.categoryName}</div>`,
    `<div class="flex flex-row gap-3">`,
    valueDisplay(formatNumber(group.count || 0), 'fa-light fa-people-group'),
    group.softwareValue
      ? valueDisplay(group.softwareValue, 'fa-light fa-dollar-circle')
      : '',
    `</div>`,
    `<hr class="mt-4">`,
    group.collections ? itemGroupDisplay(group.collections, 'Top collections') : '',
    itemGroupDisplay(group.projects, 'Top projects'),
    footerDisplay(),
    `</div>`,
    `</div>`
  ].join('');
