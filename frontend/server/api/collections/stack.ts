const stack = [
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

export default defineEventHandler(async () => stack);
