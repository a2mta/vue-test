<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import useSWRV from 'swrv';
import { getClients, getProviders } from '../api/queries';
import ClientModal from '../components/ClientModal.vue';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    slots: { title: 'customTitle' },
    scopedSlots: { customRender: 'name' },
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Phone',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Providers',
    key: 'providers',
    slots: {
      customRender: 'providers',
    },
  },
  {
    title: 'Action',
    key: 'action',
    slots: {
      customRender: 'action',
    },
  },
];

const router = useRouter();

const isModalVisible = ref(false);

const { data: clients } = useSWRV('clients', getClients, {
  refreshInterval: 0,
});

const { data: providers } = useSWRV('providers', getProviders, {
  refreshInterval: 0,
});

const handleClientEdit = (clientId) => {
  router.push({ query: { clientId } }).then(toggleModal);
};

const toggleModal = () => {
  isModalVisible.value = !isModalVisible.value;
};

</script>

<template>
  <a-row justify="center">
    <a-col :span="20">
      <a-row
        justify="space-between"
        style="margin: 10px 0;"
      >
        <a-typography-title :level="3">
          Clients
        </a-typography-title>
        <a-button
          type="primary"
          @click="toggleModal"
        >
          New client
        </a-button>
      </a-row>
      <a-table
        :columns="columns"
        :data-source="clients"
        row-key="_id"
      >
        <template #action="{ record }">
          <span>
            <a-button
              primary
              :size="small"
              @click="handleClientEdit(record._id)"
            >
              Edit
            </a-button>
          </span>
        </template>
        <template #providers="{ record }">
          <span
            v-for="({name, _id}, index) in record.providers"
            :key="_id"
          >
            {{
              name
            }}
            {{ index < record.providers.length-1 ? ',': '' }}
          </span>
        </template>
      </a-table>
      <ClientModal
        :providers="providers"
        :on-close="toggleModal"
        :is-visible="isModalVisible"
      />
    </a-col>
  </a-row>
</template>
