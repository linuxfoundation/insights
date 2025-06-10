// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '5s', target: 500 },
        { duration: '30s', target: 0 },
    ],
};

export default function () {
    const res = http.get('https://insights.staging.lfx.dev/project/crowd.dev');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'page contains crowd.dev': (r) => r.body.includes('crowd.dev'),
    });
    sleep(1);
}
