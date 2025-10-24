// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import LfxTag from '../tag/tag.vue';
import LfxTable from './table.vue';

export default {
  title: 'LinuxFoundation/Table',
  component: LfxTable,
  tags: ['autodocs'],
  argTypes: {
    // Slots
    default: {
      description: 'Table content (use standard HTML table elements: thead, tbody, tr, th, td)',
      control: {
        type: null,
      },
    },
  },
};

export const Default = {
  render: () => ({
    components: { LfxTable },
    template: `
    <lfx-table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>John Doe</td>
          <td>john@example.com</td>
          <td>Developer</td>
        </tr>
        <tr>
          <td>Jane Smith</td>
          <td>jane@example.com</td>
          <td>Designer</td>
        </tr>
        <tr>
          <td>Bob Johnson</td>
          <td>bob@example.com</td>
          <td>Manager</td>
        </tr>
      </tbody>
    </lfx-table>`,
  }),
};

export const WithManyColumns = {
  render: () => ({
    components: { LfxTable },
    template: `
    <lfx-table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Stars</th>
          <th>Forks</th>
          <th>Contributors</th>
          <th>Health Score</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Kubernetes</td>
          <td>95,234</td>
          <td>35,421</td>
          <td>2,847</td>
          <td>87.5</td>
        </tr>
        <tr>
          <td>Prometheus</td>
          <td>48,123</td>
          <td>12,345</td>
          <td>1,234</td>
          <td>82.3</td>
        </tr>
        <tr>
          <td>Envoy</td>
          <td>22,456</td>
          <td>4,567</td>
          <td>789</td>
          <td>79.1</td>
        </tr>
      </tbody>
    </lfx-table>`,
  }),
};

export const WithTags = {
  render: () => ({
    components: { LfxTable, LfxTag },
    template: `
    <lfx-table>
      <thead>
        <tr>
          <th>Project</th>
          <th>Status</th>
          <th>Type</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Kubernetes</td>
          <td><lfx-tag variation="positive" size="small">Active</lfx-tag></td>
          <td><lfx-tag variation="info" size="small">Infrastructure</lfx-tag></td>
          <td><lfx-tag variation="warning" size="small">High</lfx-tag></td>
        </tr>
        <tr>
          <td>React</td>
          <td><lfx-tag variation="positive" size="small">Active</lfx-tag></td>
          <td><lfx-tag variation="info" size="small">Framework</lfx-tag></td>
          <td><lfx-tag variation="default" size="small">Medium</lfx-tag></td>
        </tr>
        <tr>
          <td>Vue.js</td>
          <td><lfx-tag variation="warning" size="small">Pending</lfx-tag></td>
          <td><lfx-tag variation="info" size="small">Framework</lfx-tag></td>
          <td><lfx-tag variation="default" size="small">Low</lfx-tag></td>
        </tr>
      </tbody>
    </lfx-table>`,
  }),
};

export const LargeDataset = {
  render: () => ({
    components: { LfxTable },
    setup() {
      const data = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Project ${i + 1}`,
        stars: Math.floor(Math.random() * 100000),
        contributors: Math.floor(Math.random() * 5000),
        score: (Math.random() * 100).toFixed(1),
      }));
      return { data };
    },
    template: `
    <lfx-table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Project Name</th>
          <th>Stars</th>
          <th>Contributors</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.stars.toLocaleString() }}</td>
          <td>{{ item.contributors.toLocaleString() }}</td>
          <td>{{ item.score }}</td>
        </tr>
      </tbody>
    </lfx-table>`,
  }),
};

export const WithFooter = {
  render: () => ({
    components: { LfxTable },
    template: `
    <lfx-table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Product A</td>
          <td>5</td>
          <td>$10.00</td>
          <td>$50.00</td>
        </tr>
        <tr>
          <td>Product B</td>
          <td>3</td>
          <td>$25.00</td>
          <td>$75.00</td>
        </tr>
        <tr>
          <td>Product C</td>
          <td>2</td>
          <td>$15.00</td>
          <td>$30.00</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" class="font-semibold">Grand Total</td>
          <td class="font-semibold">$155.00</td>
        </tr>
      </tfoot>
    </lfx-table>`,
  }),
};

export const Empty = {
  render: () => ({
    components: { LfxTable },
    template: `
    <lfx-table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="3" class="text-center text-neutral-400 py-8">
            No data available
          </td>
        </tr>
      </tbody>
    </lfx-table>`,
  }),
};
