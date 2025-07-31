import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import Vue3Toastify, { type ToastContainerOptions } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import router from "./router/routes";
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vue-cal/dist/vuecal.css';
import store from "./store/eventStore";
const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
  icons:{
    defaultSet:'mdi',
    aliases,
    sets:{
      mdi,
    }
  }
});

app.use(Vue3Toastify, {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  newestOnTop: false,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  theme: "light",
} as ToastContainerOptions);

app.use(store)
app.use(vuetify)
app.use(router);
app.mount("#app");
