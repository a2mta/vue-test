<script setup>
import { reactive, toRaw, watch, createVNode } from 'vue';
import { Modal, Form, message } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { getClients, getProviders } from '../api/queries';
import Provider from './Provider.vue';
import axios from '../api';
import useSWRV from 'swrv';
import { computed } from '@vue/reactivity';

const useForm = Form.useForm;

const props = defineProps({
  clientId: {
    type: Number,
    required: true,
    default: 0,
  },
  onClose: {
    type: Function,
    required: true,
    default: () => null,
  },
  isVisible: Boolean,
});

const providerFormRules = {
  name: [
    {
      required: true,
      message: 'Name is required',
      trigger: 'blur',
    },
  ],
};

const clientFormRules = {
  name: [
    {
      required: true,
      message: 'Name is required',
      trigger: 'blur',
    },
  ],
  email: [
    {
      required: true,
      type: 'email',
      message: 'Email is required',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      required: true,
      message: 'Phone is required',
      trigger: 'blur',
    },
  ],
};

const route = useRoute();
const router = useRouter();

const { data: providers, mutate: refetchProviders } = useSWRV(
  'providers',
  getProviders
);

const { mutate: refetchClients } = useSWRV('clients', getClients);

const state = reactive({
  clientForm: {
    name: '',
    email: '',
    phone: '',
    providers: [],
  },
  providerForm: {
    name: '',
  },
});

const handleProviderStatusChange = (checked, id) => {
  const provs = [...state.clientForm.providers];
  if (checked) {
    provs.push(id);
  } else {
    provs.splice(provs.indexOf(id), 1);
  }
  state.clientForm.providers = provs;
};

const isProviderActive = (id) =>
  state.clientForm.providers.includes(id) || false;

const {
  resetFields: resetClientForm,
  validate: validateClientForm,
  validateInfos: clientValidation,
} = useForm(state.clientForm, clientFormRules);

const {
  resetFields: resetProvForm,
  validate: validateProvForm,
  validateInfos: providerValidation,
} = useForm(state.providerForm, providerFormRules);

watch(
  () => route.query.clientId,
  (clientId) => {
    if (clientId) {
      axios.get(`/clients/${clientId}`).then(({ data }) => {
        if (data) {
          state.clientForm.name = data.name;
          state.clientForm.phone = data.phone;
          state.clientForm.email = data.email;
          state.clientForm.providers = data.providers;
        }
      });
    }
  }
);

const confirmDelete = () => {
  Modal.confirm({
    title: 'Confirm',
    icon: createVNode(ExclamationCircleOutlined),
    content: 'You sure u wanna delete ?',
    okText: 'Delete',
    cancelText: 'Cancel',
    onOk: handleClientDelete,
  });
};

const handleClientDelete = () => {
  if (route.query.clientId) {
    axios
      .delete(`/clients/delete/${route.query.clientId}`)
      .then(() => {
        refetchClients().then(() => {
          message.success('Client was successfully deleted');
          handleCloseModal();
        });
      })
      .catch((error) => message.error(error));
  }
};

const onSubmit = () => {
  validateClientForm()
    .then(async () => {
      try {
        if (route.query.clientId) {
          await axios.put(
            '/clients/update',
            toRaw({ ...state.clientForm, _id: route.query.clientId })
          );
          message.success('User was successfully updated');
        } else {
          await axios.post('/clients/create', toRaw(state.clientForm));
          message.success('User was successfully created');
        }
        handleCloseModal();
        refetchClients();
      } catch (error) {
        console.error(error);
      }
    })
    .catch((err) => {
      console.log('error', err);
    });
};

const handleCloseModal = () => {
  resetProvForm();
  resetClientForm();
  router.push('/').then(props.onClose);
};

const onProviderSubmit = () => {
  validateProvForm()
    .then(() => {
      axios.post('/providers/create', toRaw(state.providerForm)).then(() => {
        refetchProviders();
        state.providerForm.name = '';
      });
    })
    .catch((err) => {
      console.log('error', err);
    });
};

const modalTitle = computed(() =>
  route.query.clientId ? 'Edit client' : 'New client'
);
</script>

<template>
  <a-modal
    :visible="props.isVisible"
    :title="modalTitle"
    @cancel="handleCloseModal"
  >
    <template #footer>
      <a-row justify="space-between">
        <a-button
          v-if="route.query.clientId"
          danger
          type="primary"
          @click="confirmDelete"
        >
          Delete
        </a-button>
        <a-col flex="1">
          <a-button
            type="primary"
            @click="handleCloseModal"
          >
            Cancel
          </a-button>

          <a-button
            type="primary"
            @click="onSubmit"
          >
            Save
          </a-button>
        </a-col>
      </a-row>
    </template>
    <a-form :layout="horizontal">
      <a-form-item
        label="Name"
        v-bind="clientValidation.name"
      >
        <a-input v-model:value="state.clientForm.name" />
      </a-form-item>
      <a-form-item
        label="Email"
        v-bind="clientValidation.email"
      >
        <a-input v-model:value="state.clientForm.email" />
      </a-form-item>
      <a-form-item
        label="Phone"
        v-bind="clientValidation.phone"
      >
        <a-input v-model:value="state.clientForm.phone" />
      </a-form-item>
    </a-form>
    <a-row
      type="flex"
      justify="space-between"
    >
      <a-col
        flex="1"
        style="margin-right: 20px;"
      >
        <a-form :layout="horizontal">
          <a-form-item
            label="Providers"
            v-bind="providerValidation.name"
          >
            <a-input v-model:value="state.providerForm.name" />
          </a-form-item>
        </a-form>
      </a-col>
      
      <a-button
        type="primary"
        @click="onProviderSubmit"
      >
        Add provider
      </a-button>
    </a-row>
    <div
      v-if="providers"
      style="padding-left: 85px"
    >
      <Provider
        v-for="provider in providers"
        :key="provider._id"
        :is-active="isProviderActive(provider._id)"
        :on-status-change="handleProviderStatusChange"
        :on-delete="handleProviderStatusChange"
        v-bind="provider"
      />
    </div>
  </a-modal>
</template>
