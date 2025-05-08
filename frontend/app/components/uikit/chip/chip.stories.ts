// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxIcon from '../icon/icon.vue';
import LfxAvatar from '../avatar/avatar.vue';
import LfxChip from './chip.vue';
import { chipSizes, chipTypes } from './types/chip.types';

export default {
  title: 'LinuxFoundation/Chip',
  component: LfxChip,
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Size of the chip',
      control: 'select',
      options: chipSizes
    },
    type: {
      description: 'Type of the chip',
      control: 'select',
      options: chipTypes
    },
    removable: {
      description: 'Whether the chip is removable',
      control: 'boolean'
    },
    // slot
    default: {
      description: 'Label of the chip',
      control: {
        type: null
      }
    }
  }
};

export const Default = {
  args: {
    default: 'Chip',
    size: 'default',
    type: 'default'
  }
};

export const Bordered = {
  args: {
    default: 'Chip',
    size: 'normal',
    type: 'bordered'
  }
};

export const Small = {
  args: {
    default: 'Small Chip',
    size: 'small'
  }
};

const withIconTmpl = `
<lfx-chip v-bind="propsObj">
  <lfx-icon name="compass" />
  With Icon
</lfx-chip>`;

export const WithIcon = {
  args: {
    size: 'default',
    type: 'bordered'
  },
  render: (args, { argTypes }) => ({
    components: { LfxChip, LfxIcon },
    props: Object.keys(argTypes),
    template: withIconTmpl,
    computed: {
      propsObj() {
        return args;
      }
    }
  }),
  parameters: {
    docs: {
      source: {
        code: `
<template>
  ${withIconTmpl}
</template>`
      }
    }
  }
};

const withAvatarTmpl = `
<lfx-chip v-bind="propsObj">
  <lfx-avatar type="member" 
  src="https://primefaces.org/cdn/primevue/images/organization/walter.jpg" size="xsmall" />
  With Avatar
</lfx-chip>`;

export const WithAvatar = {
  args: {
    size: 'default',
    type: 'bordered'
  },
  render: (args, { argTypes }) => ({
    components: { LfxChip, LfxAvatar },
    props: Object.keys(argTypes),
    template: withAvatarTmpl,
    computed: {
      propsObj() {
        return args;
      }
    }
  }),
  parameters: {
    docs: {
      source: {
        code: `
<template>
  ${withAvatarTmpl}
</template>`
      }
    }
  }
};

const withLogoTmpl = `
<lfx-chip v-bind="propsObj">
  <lfx-avatar type="member" 
  src="https://static-00.iconduck.com/assets.00/linux-icon-256x256-773o7tyd.png" size="xsmall" />
  With Logo
</lfx-chip>`;

export const WithLogo = {
  args: {
    size: 'default',
    type: 'bordered'
  },
  render: (args, { argTypes }) => ({
    components: { LfxChip, LfxAvatar },
    props: Object.keys(argTypes),
    template: withLogoTmpl,
    computed: {
      propsObj() {
        return args;
      }
    }
  }),
  parameters: {
    docs: {
      source: {
        code: `
<template>
  ${withLogoTmpl}
</template>`
      }
    }
  }
};

export const Dismissable = {
  args: {
    default: 'Chip dismissable',
    size: 'default',
    removable: true
  }
};
