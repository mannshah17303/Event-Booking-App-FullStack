<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import store from "./store/eventStore";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const loggedInUser = computed(() => store.state.loggedInUser);

const handleClick = () => {
  router.push("/events");
};

const handleGroupEventsClick = () => {
  router.push("/group-events");
};

const handleMyBookingsClick = () => {
  router.push("/my-bookings");
};

const handleFavoritesClick = () => {
  router.push("/favorites");
};

const handleCalendarIconClick = () => {
  router.push("/events/calendar");
};

const handleAccountIconClick = () => {
  router.push("/account");
};

const handleRegisterClick = () => {
  router.push("/");
};

const handleLogoutClick = async () => {
  await axios.post(
    `${import.meta.env.VITE_USERS}/logout`,
    {},
    { withCredentials: true }
  );
  store.commit("CLEAR_LOGGED_IN_USER");
  router.push("/");
};

const isLoading = ref(true);

onMounted(async () => {
  await store.dispatch("fetchFullUserData");
  isLoading.value = false;
  store.commit("SPINNER_LOADING_VALUE", isLoading.value);
  const events = await axios.get(import.meta.env.VITE_EVENTS);
  const staticEvents = events.data.data;
  store.dispatch("loadEvents", staticEvents);
});
</script>

<template>
  <v-app>
    <v-app-bar app flat elevation="2" class="px-4">
      <v-toolbar-title class="font-weight-bold text-h5 ml-0">
        Your Day, Your Way Events
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        @click="handleClick"
        variant="outlined"
        color="block"
        class="text-none mr-2"
      >
        Dashboard
      </v-btn>
      <v-btn
        @click="handleGroupEventsClick"
        variant="outlined"
        color="block"
        class="text-none mr-2"
      >
        Group events
      </v-btn>
      <v-btn
        @click="handleMyBookingsClick"
        variant="outlined"
        color="block"
        class="text-none mr-2"
      >
        My Bookings
      </v-btn>
      <v-btn
        @click="handleFavoritesClick"
        variant="outlined"
        color="block"
        class="text-none mr-2"
      >
        Favorites
      </v-btn>
      <v-btn
        v-if="!loggedInUser"
        variant="outlined"
        @click="handleRegisterClick"
        color="block"
        class="text-none mr-2"
        >Login/Register
      </v-btn>
      <div v-else-if="loggedInUser" class="flex justify-center align-middle">
        <v-btn
          variant="outlined"
          @click="handleLogoutClick"
          color="red"
          class="text-none mr-2"
          >Logout
        </v-btn>
        <h2 class="font-bold mt-2 mr-1">{{ loggedInUser.name }}</h2>
      </div>
      <i @click="handleCalendarIconClick" class="mdi mdi-calendar"></i>
      <i @click="handleAccountIconClick" class="mdi mdi-account"></i>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app class="border-t">
      <v-container>
        <v-row align="center" justify="center">
          <v-col class="text-center" cols="12">
            <span class="text-body-2 text-medium-emphasis">
              © {{ new Date().getFullYear() }} —
              <strong class="text-primary">Your Day, Your Way Events</strong>
            </span>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<style scoped>
.mdi-calendar {
  font-size: 30px;
}
.mdi-calendar:hover {
  cursor: pointer;
}

.mdi-account {
  font-size: 27px;
  margin-left: 9px;
}

.mdi-account:hover {
  cursor: pointer;
}
</style>
