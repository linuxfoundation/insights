// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import http from 'k6/http';
import { check, sleep } from 'k6';

const top200Projects = [
    'k8s', 'flutter', 'ojsf-nodejs', 'helm', 'korg', 'ptproject', 'project-eve', 'Next.js', 'definitelytyped',
    'ant-design-ant-design', 'python-cpython', 'opentelemetry', 'godotengine-godot', 'laravel-framework', 'argo',
    'grpc', 'pandas-dev-pandas', 'angular', 'NixOS', 'prometheus', 'golang-website', 'react', 'dotnet', 'jupyter',
    'keycloak', 'mui-material-ui', 'zep', 'odoo', 'vllm', 'opensearch-foundation', 'gql', 'ojsf-express', 'istio',
    'cncf', 'fluentd', 'storybookjs-storybook', 'symfony-framework-bundle', 'lf-decentralized-trust',
    'spring-projects-spring-boot', 'raspberrypi-linux', 'aws-constructs', 'easycla', 'islet', 'systemd', 'envoy',
    'servo-llc', 'scipy', 'harbor', 'ipython', 'getsentry-sentry', 'jupyter-frontends', 'kubeflow', 'lfedge', 'px4',
    'numpy', 'julialang-julia', 'etcd', 'fluxcd', 'lfai-onnx', 'matplotlib', 'backstage', 'cephfoundation', 'nats',
    'cert-manager', 'osjf-fastify', 'platformio-platform-espressif32', 'jupyterhub', 'MLF', 'cilium', 'babel',
    'ojsf-jquery', 'risc-v-international', 'homebrew-brew', 'spring-projects-spring-framework', 'cncf-distribution',
    'model-context-protocol-mcp', 'dapr', 'test', 'quarkusio-quarkus', 'k3s', 'app-runtime-interfaces', 'opentf',
    'spack', 'jaeger', 'expensify-app', 'containerd', 'netty', 'cdf-spinnaker', 'deepspeed', 'presto',
    'multipath-tcp-mptcp_net-next', 'asyncapi', 'sonic-foundation', 'aswf', 'openpolicyagent', 'lfai-milvus', 'yocto',
    'openapi', 'rook', 'fabric', 'ojsf-moment', 'onap-music', 'linkerd', 'foundational-infrastructure',
    'cms-sw-cmssw', 'KEDA', 'onap', 'thanos', 'odl-plastic', 'mavlink', 'knative', 'deltalake', 'meshery', 'networkx',
    'atlantis', 'connect', 'amd-rocm', 'strimzi', 'longhorn', 'typescript-eslint-typescript-eslint', 'oneapi',
    'cdf-jenkins-x', 'perspective', 'score', 'gentoo', 'dolibarr', 'externalsecretsoperator', 'tekton', 'kyverno',
    'kubevirt', 'exodus', 'odl-genius', 'grid', 'ojsf-electron', 'moon', 'tikv', 'coredns', 'o3de-project',
    'scikit-image-scikit-image', 'falco', 'delta', 'opnfv-fuel', 'claude-code', 'jupyter-widgets', 'jenkins',
    'deeprec', 'onap-holmes', 'odl-telemetry', 'admin-and-legacy-cff', 'fluid', 'notary', 'qgroundcontrol',
    'ojsf-jqui', 'lf-decentralized-trust-labs', 'opencontainers', 'openebs', 'federatedai', 'webkit', 'cortex', 'c7n',
    'hiero', 'Volcano', 'horovod', 'explorer', 'everest', 'hpc-toolkit', 'p4-fund', 'kubeedge', 'telepresence', 'd7y',
    'zowe-binary-project', 'mscs', 'vitess', 'symphony-java-toolkit', 'sigstore', 'claimed', 'jupyter-server',
    'opendaylight', 'dex', 'litmuschaos', 'kubescape', 'kserve', 'app-runtime-platform', 'valkey', 'curve', 'dpdk',
    'openbao-2', 'emissary', 'fdio-llc', 'canon', 'flyte', 'xen', 'capsule', 'aether-project', 'crossplane',
    'ojsf-intern', 'dronecode', 'agl', 'cobol-working-group', 'metallb',
];

const paths = [
    '',
    '/contributors',
    '/popularity',
    '/development',
    '/security',
]

const top30projects = top200Projects.slice(0, 30);

export const options = {
    stages: [
        { duration: '10s', target: 100 },
        { duration: '20s', target: 100 },
        { duration: '20s', target: 0 },
    ],
};

export default function () {
    const project = top30projects[Math.floor(Math.random() * top30projects.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];

    const res = http.get(`https://insights.linuxfoundation.org/project/${project}${path}`, {tags: {page: path}});
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    sleep(1);
}
