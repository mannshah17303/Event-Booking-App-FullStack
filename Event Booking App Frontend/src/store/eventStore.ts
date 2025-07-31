import axios from "axios";
import { toast } from "vue3-toastify";
import { createStore, Store } from "vuex";
import router from "../router/routes";

interface Event {
  event_id: number;
  event_date: Date;
  event_title: string;
  event_location: string;
  event_description: string;
  price: string;
  image_url: string;
  ratings: number;
}

interface Contact {
  name: string;
  email: string;
  phoneNumber: string;
  event_name: string;
  message: string;
}

interface State {
  events: Event[];
  contactsData: Contact[];
  isLoading: boolean;
  loggedInUser: any | null;
}

const store: Store<State> = createStore({
  state: {
    events: [],
    contactsData: [],
    isLoading: true,
    loggedInUser: null,
  },
  mutations: {
    SET_EVENT(state: State, events: Event[]) {
      state.events = events;
    },
    SET_LOGGED_IN_USER(state: State, user: any) {
      state.loggedInUser = user;
    },
    SPINNER_LOADING_VALUE(state: State, loading: boolean) {
      state.isLoading = loading;
    },
    EDITED_DATA(state: State, editedData: any) {
      state.loggedInUser = editedData;
      toast.success("Edited successful", {
        position: "top-right",
        autoClose: 3000,
      });
    },
    ADD_CONTACT(state: State, contactData: Contact) {
      state.contactsData.push(contactData);
      toast.success(
        "Contact is successfully submitted, We will revert back to you shortly",
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
    },
    CLEAR_LOGGED_IN_USER(state: State) {
      state.loggedInUser = null;
    },
  },
  actions: {
    loadEvents({ commit }, events: Event[]) {
      commit("SET_EVENT", events);
    },
    async fetchFullUserData({ commit }) {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_USERS}/current-user`,
          {
            withCredentials: true,
          }
        );
        const userId = res.data.user.user_id;

        const fullUser = await axios.get(
          `${import.meta.env.VITE_USERS}/getDataOfLoggedInUser`,
          {
            params: {
              userId,
            },
            withCredentials: true,
          }
        );

        const userData = fullUser.data.data[0];

        commit("SET_LOGGED_IN_USER", userData);
      } catch (error) {
        const currentPath = router.currentRoute.value.path;
        const publicRoutes = [
          "/",
          "/register",
          "/reset-password",
          "/forget-password",
          "/events",
        ];
        if (!publicRoutes.includes(currentPath)) {
          toast.error("Token expired. Please login again", {
            position: "top-right",
            autoClose: 1000,
          });
          router.push("/");
        }
      }
    },
    async addFavorite({ state }, event_id: number) {
      await axios.post(
        `${import.meta.env.VITE_FAVORITES}/addFavorite`,
        { event_id, currentUserId: state.loggedInUser.user_id },
        {
          withCredentials: true,
        }
      );
    },
    async removeFavorite({ state }, event_id: number) {
      await axios.post(
        `${import.meta.env.VITE_FAVORITES}/removeFavorite`,
        { event_id, currentUserId: state.loggedInUser.user_id },
        {
          withCredentials: true,
        }
      );
    },
    async ratings({ state }, rating: { id: number; star: number }) {
      await axios.post(
        `${import.meta.env.VITE_BOOKINGS}/updateRatings`,
        { rating, currentUserId: state.loggedInUser.user_id },
        {
          withCredentials: true,
        }
      );
    },
    async addContact({ commit }, contactData: Contact) {
      const response = await axios.post(
        `${import.meta.env.VITE_CONTACTS}/addContact`,
        contactData,
        {
          withCredentials: true,
        }
      );
      commit("ADD_CONTACT", response.data.data);
    },
    async addBooking({ }, bookedEvent: any) {
      await axios.post(
        `${import.meta.env.VITE_BOOKINGS}/addBooking`,
        bookedEvent,
        {
          withCredentials: true,
        }
      );

      toast.success("Event Booked successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    },
    async cancelBooking({ }, bookingToRemove: number) {
      await axios.delete(
        `${import.meta.env.VITE_BOOKINGS}/delete/${bookingToRemove}`,
        {
          withCredentials: true,
        }
      );
      toast.success("Your booking has been successfully canceled!", {
        position: "top-right",
        autoClose: 3000,
      });
    },
    async editUserData(
      { commit },
      editedData: {
        user_id: string;
        updatedUser: { name: string; email: string; role: string };
      }
    ) {
      const response = await axios.put(
        `${import.meta.env.VITE_USERS}/update/${editedData.user_id}`,
        editedData.updatedUser,
        {
          withCredentials: true,
        }
      );
      commit("EDITED_DATA", response.data.data);
    },
  },
  getters: {},
});

export default store;
