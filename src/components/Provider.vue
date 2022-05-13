<script setup>
/* eslint-disable vue/prop-name-casing */
import { createVNode, reactive } from 'vue';
import {
  CheckCircleTwoTone,
  DeleteTwoTone,
  EditTwoTone,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue';
import axios from '../api';
import { Modal, message } from 'ant-design-vue';
import useSWRV from 'swrv';
import { getProviders } from '../api/queries';

const props = defineProps({
  name: {
    type: String,
    required: true,
    default: '',
  },
  _id: {
    type: String,
    required: true,
    default: '',
  },
  onStatusChange: {
    type: Function,
    required: true,
    default: () => null,
  },
  isActive: Boolean,
});

const { mutate: refetchProviders } = useSWRV('providers', getProviders);

const state = reactive({
  editMode: false,
  providerName: props.name,
});

const toggleEditMode = () => {
  state.editMode = !state.editMode;
};

const handleProviderStatusChange = ({ target }) => {
  props.onStatusChange(target.checked, props._id);
};

const handleProviderNameChange = async () => {
  try {
    await axios.put('providers/update', {
      _id: props._id,
      name: state.providerName,
    });
    message.success('Provider was successfully updated');
    refetchProviders();
    toggleEditMode();
  } catch (error) {
    console.error(error);
  }
};

const handleProviderDelete = async () => {
  try {
    await axios.delete(`providers/delete/${props._id}`);
    message.success('Provider was successfully deleted');
    props.onStatusChange(false, props._id);
    refetchProviders();
  } catch (error) {
    console.error(error);
  }
};

const confirmDelete = () => {
  Modal.confirm({
    title: 'Confirm',
    icon: createVNode(ExclamationCircleOutlined),
    content: 'Confirm deletion',
    okText: 'Delete',
    cancelText: 'Cancel',
    onOk: handleProviderDelete,
  });
};
</script>

<template>
  <a-row>
    <template v-if="state.editMode">
      <a-col :span="10">
        <a-input
          v-model:value="state.providerName"
          size="small"
          placeholder="Basic usage"
        />
      </a-col>
      <a-col
        :span="2"
        justify="center"
        align="center"
      >
        <CheckCircleTwoTone
          style="cursor: pointer"
          @click="handleProviderNameChange"
        />
      </a-col>
    </template>
    <template v-else>
      <a-col :span="2">
        <a-checkbox
          :checked="props.isActive"
          @change="handleProviderStatusChange"
        />
      </a-col>
      <a-col :span="6">
        {{ state.providerName }}
      </a-col>
      <a-col :span="3">
        <EditTwoTone
          style="cursor: pointer; margin-right: 10px"
          @click="toggleEditMode"
        />
        <DeleteTwoTone
          style="cursor: pointer"
          @click="confirmDelete"
        />
      </a-col>
    </template>
  </a-row>
</template>
