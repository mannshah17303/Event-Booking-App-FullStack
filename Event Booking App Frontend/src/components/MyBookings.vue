<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import useVuelidate from "@vuelidate/core";
import {
  required,
  email,
  helpers,
  minLength,
  maxLength,
  numeric,
} from "@vuelidate/validators";
import Button from "../reusableComponents/Button.vue";
import Input from "../reusableComponents/Input.vue";
import router from "../router/routes";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import axios from "axios";
import SearchEvent from "./SearchEvent.vue";

const store = useStore();

const currentUser = computed(() => store.state.loggedInUser);

const formData = ref({
  name: "",
  email: "",
  number: "",
  event_name: "",
  message: "",
});

const showContactForm = ref(false);

const rules = computed(() => {
  return {
    name: {
      required: helpers.withMessage("Please Enter your Name", required),
    },
    email: {
      required: helpers.withMessage("Please Enter email", required),
      email: helpers.withMessage("Please enter a valid email address.", email),
    },
    number: {
      required: helpers.withMessage("Please Enter your phone number", required),
      numeric,
      minLength: minLength(10),
      maxLength: maxLength(10),
    },
    event_name: {
      required: helpers.withMessage("Please Enter Name of Event", required),
    },
    message: {
      required: helpers.withMessage("Please Enter valid reason", required),
    },
  };
});

const v$ = useVuelidate(rules, formData);

const openContactForm = async () => {
  showContactForm.value = true;
};

const cancelForm = () => {
  showContactForm.value = false;
  formData.value = {
    name: "",
    email: "",
    number: "",
    event_name: "",
    message: "",
  };
};

const handleClickApartFromForm = () => {
  cancelForm();
};

const submitContact = async () => {
  if (currentUser.value == null) {
    alert("please login to contact organizer");
  } else {
    const isFormValid = await v$.value.$validate();
    if (isFormValid) {
      const insertDataIntoContact = {
        name: formData.value.name,
        email: formData.value.email,
        phone_number: formData.value.number,
        event_name: formData.value.event_name,
        message: formData.value.message,
      };
      store.dispatch("addContact", insertDataIntoContact);
      cancelForm();
    }
  }
};

const removeBookedEvent = async (id: string, event: Event) => {
  event.stopPropagation();
  const confirmCancelBooking = confirm(
    "Are you sure you want to cancel the booking?"
  );
  if (confirmCancelBooking) {
    await store.dispatch("cancelBooking", id);
    await fetchMyBookingEvents();
  }
};

const maxRating = 5;

const setRating = async (id: number, star: number, event: Event) => {
  event.stopPropagation();
  await store.dispatch("ratings", { id, star });
  await fetchMyBookingEvents();
};

const downloadBookings = async () => {
  const doc = new jsPDF();
  let qrContent = ``;
  let adjust = 20;
  filteredEvents.value.map((data: any) => {
    qrContent += `
          Booking ID: ${data.booking_id}
          Event: ${data.event.event_title}
          Date: ${new Date(data.event.event_date).toLocaleDateString()}
          Location: ${data.event.event_location}
          Price: ${data.event.price}
          `.trim();
    doc.setFontSize(16);
    doc.text("Booking details", 20, adjust);
    doc.setFontSize(12);
    doc.text(`Event: ${data.event.event_title}`, 20, adjust + 10);
    doc.text(
      `Date: ${new Date(data.event.event_date).toLocaleDateString()}`,
      20,
      adjust + 20
    );
    doc.text(`Location: ${data.event.event_location}`, 20, adjust + 30);
    doc.text(`Price: ${data.event.price}`, 20, adjust + 40);
    adjust += 60;
  });
  const qrDataUrl = await QRCode.toDataURL(qrContent);
  doc.addImage(qrDataUrl, "PNG", 150, 35, 40, 40);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bookingId = `${timestamp}-${randomString}`;
  doc.save(`${bookingId}.pdf`);
};

const showTickets = (id: number) => {
  router.push(`/tickets/${id}`);
};

const openContactFormButtonTagData = {
  class: "contactButton mt-4",
  spanContent: "Contact Organizer",
};

const submitButtonTagData = {
  type: "submit",
  class: "submitButton",
  spanContent: "Submit",
};

const cancelButtonTagData = {
  type: "button",
  class: "cancelButton",
  spanContent: "Cancel",
};

const eventNameInputData = {
  type: "text",
  name: "eventName",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-red",
  placeholder: "Enter event name...",
  autocomplete: "off",
};

const nameInputData = {
  type: "text",
  name: "name",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-red",
  placeholder: "Enter Your name...",
  autocomplete: "off",
};

const emailInputData = {
  type: "text",
  name: "email",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-red",
  placeholder: "Enter Your email...",
  autocomplete: "off",
};

const phoneNumberInputData = {
  type: "text",
  name: "number",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-red",
  placeholder: "Enter Your phone number...",
  autocomplete: "off",
};

const messageInputData = {
  type: "text",
  name: "message",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-white bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-red",
  placeholder: "Enter valid reason...",
  autocomplete: "off",
};

const pdfDownloadTagData = {
  type: "button",
  class:
    "bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-4 rounded-xl shadow-md hover:scale-105 transition-transform mt-4 ml-2",
  spanContent: "🎫 Download Bookings",
};

const searchValue = ref("");
const currentPage = ref(1);
const sortType = ref(null);
const sortBy = ref(null);
const eventsPerPage = 5;
const filteredEvents = ref<any>([]);
const totalCount = ref(0);

const fetchMyBookingEvents = async () => {
  store.commit("SPINNER_LOADING_VALUE", true);
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BOOKINGS}/search-sort-pagination`,
      {
        params: {
          value: searchValue.value,
          page: currentPage.value,
          pageSize: eventsPerPage,
          sortType: sortType.value,
          sortBy: sortBy.value,
          user_id: currentUser.value.user_id,
        },
        withCredentials: true,
      }
    );
    filteredEvents.value = response.data.data;
    totalCount.value = response.data.totalCount;
  } catch (error) {
    console.error("Error fetching paginated events:", error);
  } finally {
    store.commit("SPINNER_LOADING_VALUE", false);
  }
};

onMounted(fetchMyBookingEvents);

watch([currentPage, searchValue, sortType, sortBy], fetchMyBookingEvents);

const totalPages = computed(() => Math.ceil(totalCount.value / eventsPerPage));

const searchedValue = (searchTerm: string) => {
  searchValue.value = searchTerm;
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};
</script>

<template>
  <div
    class="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-4 mb-4"
  >
    <div class="flex flex-col sm:flex-row flex-wrap gap-2 w-full">
      <SearchEvent @filter-event="searchedValue" />
      <div class="flex flex-wrap gap-2">
        <Button @click="downloadBookings" :buttonTagData="pdfDownloadTagData" />
        <Button
          v-if="!showContactForm"
          @click="openContactForm"
          :buttonTagData="openContactFormButtonTagData"
        />
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-2 ml-0 sm:ml-3 mt-2 sm:mt-4">
      <v-select
        class="w-full sm:w-[150px] h-[50px] mr-0 sm:mr-2 rounded-3xl"
        v-model="sortBy"
        :items="['name', 'date', 'location', 'price', 'ratings']"
        label="sort by"
      ></v-select>
      <v-select
        class="w-full sm:w-[150px] h-[50px] rounded-3xl"
        v-model="sortType"
        :items="['ASC', 'DESC']"
        label="sort type"
      ></v-select>
    </div>
  </div>

  <div
    v-if="showContactForm"
    class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
    @click="handleClickApartFromForm"
  >
    <div
      class="bg-black shadow-2xl rounded-2xl p-8 border-3 border-white w-full max-w-md sm:max-w-lg h-[90vh] overflow-y-auto"
      @click.stop
    >
      <form @submit.prevent="submitContact">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-white mb-2">Contact Us</h2>
          <div class="w-16 h-1 mx-auto rounded-full bg-white"></div>
        </div>

        <div class="mb-6">
          <label for="name" class="block text-sm font-semibold text-white mb-2">
            Your Name
          </label>
          <Input v-model="formData.name" :inputTagData="nameInputData" />
          <span v-if="v$.name.$error" class="text-red-500">{{
            v$.name.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-6">
          <label for="email" class="block text-sm font-semibold text-white mb-2"
            >Email</label
          >
          <Input v-model="formData.email" :inputTagData="emailInputData" />
          <span v-if="v$.email.$error" class="text-red-500">{{
            v$.email.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-6">
          <label
            for="number"
            class="block text-sm font-semibold text-white mb-2"
            >Phone Number</label
          >
          <Input
            v-model="formData.number"
            :inputTagData="phoneNumberInputData"
          />
          <span v-if="v$.number.$error" class="text-red-500">{{
            v$.number.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-6">
          <label
            for="eventTitle"
            class="block text-sm font-semibold text-white mb-2"
            >Event Name</label
          >
          <Input
            v-model="formData.event_name"
            :inputTagData="eventNameInputData"
          />
          <span v-if="v$.event_name.$error" class="text-red-500">{{
            v$.event_name.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-6">
          <label
            for="message"
            class="block text-sm font-semibold text-white mb-2"
            >Message</label
          >
          <Input v-model="formData.message" :inputTagData="messageInputData" />
          <span v-if="v$.message.$error" class="text-red-500">{{
            v$.message.$errors[0].$message
          }}</span>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <Button :buttonTagData="submitButtonTagData" />
          </div>
          <div class="flex-1">
            <Button @click="cancelForm" :buttonTagData="cancelButtonTagData" />
          </div>
        </div>
      </form>
    </div>
  </div>

  <v-row v-if="filteredEvents.length > 0" v-for="booking in filteredEvents">
    <v-col cols="12">
      <v-card
        @click="showTickets(booking.event.event_id)"
        color="surface-variant"
        :key="booking.event.event_id"
        :image="booking.event.image_url"
        style="min-height: 50vh; background-size: cover"
      >
        <div class="flex justify-between">
          <v-card-title>
            <strong>{{ booking.event.event_title }}</strong>
          </v-card-title>
          <div class="star-rating">
            <span
              v-for="star in maxRating"
              :key="star"
              @click="setRating(booking.event.event_id, star, $event)"
              :class="{ filled: star <= (booking.ratings || 0) }"
            >
              &#9733;
            </span>
            <i
              @click="removeBookedEvent(booking.booking_id, $event)"
              class="mdi mdi-close"
            ></i>
          </div>
        </div>
        <v-card-title>
          {{ booking.event.event_location }}
        </v-card-title>
        <v-card-subtitle>
          <strong>{{
            new Date(booking.event.event_date).toLocaleDateString()
          }}</strong>
        </v-card-subtitle>
        <div class="text-h5 ml-3 mt-3">
          <strong>₹{{ booking.event.price }}</strong>
        </div>
        <div class="text-h7 ml-3 mt-3">
          Payment Status: <strong class="text-green-500">Completed</strong>
        </div>
      </v-card>
    </v-col>
  </v-row>

  <v-card v-else class="text-center justify-between mt-5">
    No booked events available
  </v-card>

  <div class="pagination flex flex-wrap justify-center items-center gap-2 mt-6">
    <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
      Previous
    </button>
    <button
      v-for="page in totalPages"
      :key="page"
      :class="{ active: page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page }}
    </button>
    <button
      :disabled="currentPage >= totalPages || totalPages == 0"
      @click="goToPage(currentPage + 1)"
    >
      Next
    </button>
  </div>
</template>

<style scoped>
.mdi-close {
  color: red;
  font-size: 30px;
  margin-right: 12px;
}

.mdi-close:hover {
  cursor: pointer;
}

.star-rating span {
  font-size: 2em;
  cursor: pointer;
  color: #ccc;
}
.star-rating span.filled {
  color: gold;
}

.pagination button {
  padding: 10px 14px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  min-width: 40px;
}

button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

@media (max-width: 640px) {
  .star-rating span {
    font-size: 1.5em;
  }

  .mdi-close {
    font-size: 24px;
  }
}
</style>
