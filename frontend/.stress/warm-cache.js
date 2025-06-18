// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
// warmup.js
import http from 'k6/http';
import { sleep, check } from 'k6';

const paths = ['', '/collections', '/open-source-index'];

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

const projectPaths = [
    '',
    '/contributors',
    '/popularity',
    '/development',
    '/security',
];

top200Projects.forEach((project) => {
    projectPaths.forEach((path) => {
        paths.push(`/project/${project}${path}`);
    });
});

export const options = {
    vus: 1,
    iterations: paths.length,
};

let i = 0;

export default function () {
    const path = paths[i];
    const url = `https://insights.linuxfoundation.org/${path}`;
    const res = http.get(url);
    check(res, {
        'status is 200': (r) => r.status === 200,
    });
    i += 1;
}
