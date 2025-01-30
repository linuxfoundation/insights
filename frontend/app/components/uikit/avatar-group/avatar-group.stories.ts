import LfxAvatar from '../avatar/avatar.vue';
import LfxAvatarGroup from './avatar-group.vue';

export default {
  title: 'LinuxFoundation/AvatarGroup',
  component: LfxAvatarGroup,
  tags: ['autodocs'],
  argTypes: {
    // Slots
    default: {
      description: 'List of avatars',
      control: {
        type: null
      }
    }
  }
};

export const Default = {
  args: {
    default: 'Sample Name'
  },
  render: (args) => ({
    components: { LfxAvatarGroup, LfxAvatar },
    template: `<lfx-avatar-group>
      <lfx-avatar name="${args.name}" size="normal" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="normal" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="normal" class="bg-brand-500" />
    </lfx-avatar-group>`
  })
};

export const Small = {
  args: {
    default: 'Sample Name'
  },
  render: (args) => ({
    components: { LfxAvatarGroup, LfxAvatar },
    template: `<lfx-avatar-group>
      <lfx-avatar name="${args.name}" size="small" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="small" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="small" class="bg-brand-500" />
    </lfx-avatar-group>`
  })
};

export const Large = {
  args: {
    default: 'Sample Name'
  },
  render: (args) => ({
    components: { LfxAvatarGroup, LfxAvatar },
    template: `<lfx-avatar-group>
      <lfx-avatar name="${args.name}" size="large" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="large" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="large" class="bg-brand-500" />
    </lfx-avatar-group>`
  })
};

export const XLarge = {
  args: {
    default: 'Sample Name'
  },
  render: (args) => ({
    components: { LfxAvatarGroup, LfxAvatar },
    template: `<lfx-avatar-group>
      <lfx-avatar name="${args.name}" size="xlarge" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="xlarge" class="bg-brand-500" />
      <lfx-avatar name="${args.name}" size="xlarge" class="bg-brand-500" />
    </lfx-avatar-group>`
  })
};
