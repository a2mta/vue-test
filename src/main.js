import { createApp } from 'vue'
import App from "./App.vue";
import router from "./router";
import 'ant-design-vue/dist/antd.css';
import Antd from "ant-design-vue/es";

createApp(App).use(router).use(Antd).mount('#app')

