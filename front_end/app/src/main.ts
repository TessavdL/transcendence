import { createApp } from 'vue';
import App from '@/App.vue';
import router from './router';

import storeUser from "@/store";

import PrimeVue from "primevue/config";
import "primevue/resources/themes/md-dark-indigo/theme.css"; //theme
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; //PrimeFlex
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.js";

const app = createApp(App)

app.use(storeUser);

app.use(router);

app.use(PrimeVue);
app.use(ConfirmationService);
app.use(ToastService);
app.directive("tooltip", Tooltip);

app.mount('#app')
