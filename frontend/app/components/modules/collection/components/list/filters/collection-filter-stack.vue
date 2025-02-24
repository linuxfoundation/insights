<template>
  <lfx-dropdown v-model="value" :options="options" icon="fa-layer-group fa-light" type="filled" dropdown-position="left"
    prefix="Stack" placeholder="All" :split-lines="[1]" />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import LfxDropdown from "~/components/uikit/dropdown/dropdown.vue";

const props = defineProps<{
  modelValue: string;
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const value = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
});

const options = [
  {
    label: '',
    items: [
      { label: 'All Stacks', value: 'all-stacks' },
    ]
  },
  {
    label: "Application Definition and Development",
    items: [
      {
        label: "Application Definition & Image Build",
        value: "application-definition-image-build"
      },
      {
        label: "Continuous Integration & Delivery",
        value: "continuous-integration-delivery"
      }
    ]
  },
  {
    label: "Databases",
    items: [
      {
        label: "Databases",
        value: "databases"
      }
    ]
  },
  {
    label: "Streaming & Messaging",
    items: [
      {
        label: "Streaming & Messaging",
        value: "streaming-messaging"
      }
    ]
  },
  {
    label: "Feature Flagging & Progressive Delivery",
    items: [
      {
        label: "Feature Flagging & Progressive Delivery",
        value: "feature-flagging-progressive-delivery"
      }
    ]
  },
  {
    label: "Orchestration & Management",
    items: [
      {
        label: "Scheduling & Orchestration",
        value: "scheduling-orchestration"
      },
      {
        label: "API Gateway",
        value: "api-gateway"
      },
      {
        label: "Service Proxy",
        value: "service-proxy"
      },
      {
        label: "Remote Procedure Call (RPC)",
        value: "remote-procedure-call-rpc"
      },
      {
        label: "Service Mesh",
        value: "service-mesh"
      },
      {
        label: "Service Discovery & Coordination",
        value: "service-discovery-coordination"
      }
    ]
  },
  {
    label: "Runtime",
    items: [
      {
        label: "Cloud Native Storage",
        value: "cloud-native-storage"
      }
    ]
  }
]

</script>

<script lang="ts">
export default {
  name: 'LfxCollectionFilterStack'
};
</script>
