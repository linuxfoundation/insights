// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

// Full month names for DatePicker month view
const fullMonthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default {
  autoImport: false,
  components: {
    prefix: 'pv',
    include: [
      'Button',
      'DataTable',
      'Avatar',
      'AvatarGroup',
      'SelectButton',
      'Toast',
      'Select',
      'Skeleton',
      'DatePicker',
      'Accordion',
      'AccordionPanel',
      'AccordionHeader',
      'AccordionContent',
    ],
  },
  options: {
    theme: 'none', // This setting means we have to manually add styles to all the components
    locale: {
      monthNamesShort: fullMonthNames,
    },
  },
};
