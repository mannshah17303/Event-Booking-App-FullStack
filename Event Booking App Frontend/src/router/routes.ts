import { createRouter, createWebHistory } from "vue-router";
import Register from "../components/Register.vue";
import Login from "../components/Login.vue";
import EventCard from "../views/EventCard.vue";
import EventDetails from "../components/EventDetail.vue";
import GroupEventDetail from "../components/GroupEventDetail.vue";
import MyBookings from "../components/MyBookings.vue";
import Calendar from "../components/Calendar.vue";
import Account from "../components/Account.vue";
import Tickets from "../components/Tickets.vue";
import Favorites from "../components/Favorites.vue";
import store from "../store/eventStore";
import axios from "axios";
import ForgetPassword from "../components/ForgetPassword.vue";
import ResetPassword from "../components/ResetPassword.vue";

const checkAuth = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_USERS}/current-user`, {
      withCredentials: true,
    });
    store.commit("SET_LOGGED_IN_USER", res.data.user);
    return res.data.user;
  } catch (err) {
    store.commit("CLEAR_LOGGED_IN_USER");
    return null;
  }
};

const routes = [
  {
    path: "/",
    component: Login,
    beforeEnter: async (_to: any, _from: any, next: any) => {
      const user = await checkAuth();
      if (user) {
        next({
          path: "/events",
        });
      } else {
        next();
      }
    },
  },
  {
    path: "/register",
    component: Register,
    beforeEnter: async (_to: any, _from: any, next: any) => {
      const user = await checkAuth();
      if (user) {
        next({
          path: "/events",
        });
      } else {
        next();
      }
    },
  },
  { path: "/events", component: EventCard },
  { path: "/events/:id", component: EventDetails },
  {
    path: "/my-bookings",
    component: MyBookings,
    beforeEnter: async (_to: any, _from: any, next: any) => {
      const user = await checkAuth();
      if (!user) {
        alert("please login to see your bookings");
        next({
          path: "/",
        });
      } else {
        next();
      }
    },
  },
  { path: "/events/calendar", component: Calendar },
  {
    path: "/account",
    component: Account,
    beforeEnter: async (_to: any, _from: any, next: any) => {
      const user = await checkAuth();
      if (!user) {
        alert("no logged in user available");
        next({
          path: "/",
        });
      } else {
        next();
      }
    },
  },
  {
    path: "/tickets/:id",
    component: Tickets,
    beforeEnter: async (_to: any, _from: any, next: any) => {
      const user = await checkAuth();
      if (!user) {
        alert("please login to see your tickets");
        next({
          path: "/",
        });
      } else {
        next();
      }
    },
  },
  {
    path: "/favorites",
    component: Favorites,
    beforeEnter: async (_to: any, _from: any, next: any) => {
      const user = await checkAuth();
      if (!user) {
        alert(
          "no favorite events available for the user because you are not logged in"
        );
        next({
          path: "/",
        });
      } else {
        next();
      }
    },
  },
  { path: "/forget-password", component: ForgetPassword },
  { path: "/reset-password", component: ResetPassword },
  {
    path: "/group-events",
    component: () => import("../views/GroupEvents.vue"),
  },
  { path: "/group-event/:id", component: GroupEventDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
