// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '5s', target: 50 },
        { duration: '30s', target: 0 },
    ],
};

export default function () {
    const res = http.get('https://insights.linuxfoundation.org/project/argo');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'page contains Argo': (r) => r.body.includes('Argo'),
    });
    sleep(1);
}
