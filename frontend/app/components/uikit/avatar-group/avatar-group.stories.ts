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
      <lfx-avatar name="${args.name}" size="normal" />
      <lfx-avatar name="${args.name}" size="normal" />
      <lfx-avatar name="${args.name}" size="normal" />
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
      <lfx-avatar name="${args.name}" size="small" />
      <lfx-avatar name="${args.name}" size="small" />
      <lfx-avatar name="${args.name}" size="small" />
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
      <lfx-avatar name="${args.name}" size="large" />
      <lfx-avatar name="${args.name}" size="large" />
      <lfx-avatar name="${args.name}" size="large" />
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
      <lfx-avatar name="${args.name}" size="xlarge" />
      <lfx-avatar name="${args.name}" size="xlarge" />
      <lfx-avatar name="${args.name}" size="xlarge" />
    </lfx-avatar-group>`
  })
};
