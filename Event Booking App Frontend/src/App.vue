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

const drawer = ref(false);
</script>

<template>
  <v-app>
    <v-app-bar app flat elevation="2" class="px-4 header-bar">
      <v-toolbar-title class="font-weight-bold text-h5 ml-0">
        Your Day, Your Way Events
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <div class="nav-buttons">
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
        <div
          v-else-if="loggedInUser"
          class="user-info flex justify-center align-middle"
        >
          <v-btn
            variant="outlined"
            @click="handleLogoutClick"
            color="red"
            class="text-none mr-2"
            >Logout
          </v-btn>
          <h2 class="font-bold mt-2 mr-1">{{ loggedInUser.name }}</h2>
        </div>
      </div>

      <v-btn
        icon
        class="hamburger-btn"
        aria-label="Open navigation menu"
        @click="drawer = !drawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>

      <i @click="handleCalendarIconClick" class="mdi mdi-calendar"></i>
      <i @click="handleAccountIconClick" class="mdi mdi-account"></i>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary class="mobile-drawer">
      <v-list nav dense>
        <v-list-item
          @click="
            () => {
              handleClick();
              drawer = false;
            }
          "
        >
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="
            () => {
              handleGroupEventsClick();
              drawer = false;
            }
          "
        >
          <v-list-item-title>Group events</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="
            () => {
              handleMyBookingsClick();
              drawer = false;
            }
          "
        >
          <v-list-item-title>My Bookings</v-list-item-title>
        </v-list-item>
        <v-list-item
          @click="
            () => {
              handleFavoritesClick();
              drawer = false;
            }
          "
        >
          <v-list-item-title>Favorites</v-list-item-title>
        </v-list-item>

        <v-divider></v-divider>

        <v-list-item
          v-if="!loggedInUser"
          @click="
            () => {
              handleRegisterClick();
              drawer = false;
            }
          "
        >
          <v-list-item-title>Login/Register</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-else-if="loggedInUser"
          @click="
            () => {
              handleLogoutClick();
              drawer = false;
            }
          "
        >
          <v-list-item-title
            >Logout ({{ loggedInUser.name }})</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

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
.hamburger-btn {
  display: none;
}

.mobile-drawer {
  display: none;
}

@media (max-width: 960px) {
  .nav-buttons {
    display: none;
  }

  .hamburger-btn {
    display: inline-flex;
  }

  .mobile-drawer {
    display: block;
  }
}

.mdi-calendar {
  font-size: 30px;
  cursor: pointer;
}
.mdi-account {
  font-size: 27px;
  margin-left: 9px;
  cursor: pointer;
}

.user-info h2 {
  margin: 0;
  line-height: 36px;
}

.v-btn--icon {
  margin-right: 12px;
}

.v-list-item {
  cursor: pointer;
}
</style>
