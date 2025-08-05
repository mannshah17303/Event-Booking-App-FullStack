<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import Input from "../reusableComponents/Input.vue";
import useVuelidate from "@vuelidate/core";
import { required, email, helpers } from "@vuelidate/validators";
import { useStore } from "vuex";
import axios from "axios";
import ApexChart from "vue3-apexcharts";
import { toast } from "vue3-toastify";

const store = useStore();

let currentUser: any = ref(null);
const formData = ref({
  name: "",
  email: "",
});
watch(
  () => store.state.loggedInUser,
  (user) => {
    if (user) {
      currentUser.value = user;
      formData.value.name = user.name;
      formData.value.email = user.email;
    }
  },
  { immediate: true }
);

let bookedData: any = ref([]);

let paymentDetails = ref([]);
let getBookingDetailsForPieChart = ref([]);
onMounted(async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_PAYMENTS}/getPaymentDetailsForLineChart`,
      {
        params: {
          userId: currentUser.value.user_id,
        },
        withCredentials: true,
      }
    );
    paymentDetails.value = response.data.data;

    const getAllBookings = await axios.get(
      `${import.meta.env.VITE_BOOKINGS}/getAllBookingDetailsForPieChart`,
      {
        withCredentials: true,
      }
    );
    getBookingDetailsForPieChart.value = getAllBookings.data.data;

    const getBookingsOfLoggedInUser = await axios.get(
      `${import.meta.env.VITE_BOOKINGS}/getBookingsOfLoggedInUser`,
      {
        params: {
          userId: currentUser.value.user_id,
        },
        withCredentials: true,
      }
    );
    bookedData.value = getBookingsOfLoggedInUser.data.data;
  } catch (error) {
    toast.error("something went wrong!!");
  }
});

const chartData = computed(() => {
  return paymentDetails.value
    .map((payment: any) => {
      const booking = bookedData.value.find(
        (b: any) => b.booking_id === payment.booking_id
      );
      return {
        date: booking ? booking.booking_date.split("T")[0] : "Unknown",
        amount: Number(payment.amount),
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
});

const series = computed(() => [
  {
    name: "Total Spending",
    data: chartData.value.map((d) => d.amount),
  },
]);

const categories = computed(() => chartData.value.map((d) => d.date));

const chartOptions = computed(() => ({
  chart: {
    type: "line",
    height: 350,
    zoom: { enabled: false },
  },
  xaxis: {
    categories: categories.value,
    title: {
      text: "Booking Date",
    },
  },
  yaxis: {
    title: {
      text: "Amount (₹)",
    },
    min: 0,
  },
  tooltip: {
    enabled: true,
    y: {
      formatter: (val: any) => `₹${val.toLocaleString()}`,
    },
  },
}));

const series1 = computed(() =>
  getBookingDetailsForPieChart.value.map((d: any) => Number(d.bookingCount))
);
const labels = computed(() =>
  getBookingDetailsForPieChart.value.map((d: any) => d.event.event_location)
);

const chartOptions1 = computed(() => ({
  chart: {
    type: "pie",
    height: 350,
  },
  labels: labels.value,
  legend: {
    position: "bottom",
  },
  tooltip: {
    y: {
      formatter: (val: any) => `${val} bookings`,
    },
  },
}));

const totalAmountSpend = computed(() => {
  return paymentDetails.value.reduce(
    (total: number, b: any) => total + Number(b.amount),
    0
  );
});

let lastEventBooked = computed(() =>
  bookedData.value.sort(
    (a: any, b: any) =>
      new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
  )
);

const today = new Date().toISOString().split("T")[0];

const upcomingEvents = computed(() => {
  if (!bookedData) return [];
  return bookedData.value
    .filter((event: any) => new Date(event.event.event_date) >= new Date(today))
    .sort(
      (a: any, b: any) =>
        new Date(a.event.event_date).getTime() -
        new Date(b.event.event_date).getTime()
    );
});

const rules = computed(() => {
  return {
    name: {
      required: helpers.withMessage("please enter your name", required),
    },
    email: {
      required: helpers.withMessage("Please Enter email", required),
      email: helpers.withMessage("Please enter a valid email address.", email),
    },
  };
});
const v$ = useVuelidate(rules, formData);

const submitForm = async () => {
  const isFormValid = await v$.value.$validate();
  if (isFormValid) {
    const updatedUser = {
      name: formData.value.name,
      email: formData.value.email,
      role: currentUser.value.role,
    };
    store.dispatch("editUserData", {
      user_id: currentUser.value.user_id,
      updatedUser: updatedUser,
    });
  }
};
const userNameInputData = {
  type: "text",
  name: "userName",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg  focus:border-transparent  bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500",
  placeholder: "Enter your name...",
  autocomplete: "off",
};

const userEmailInputData = {
  type: "text",
  name: "email",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg  focus:border-transparent  bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500",
  placeholder: "Enter your email...",
  autocomplete: "off",
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-10 space-y-10">
    <div class="flex flex-col md:flex-row justify-between gap-6 mb-5">
      <div
        class="bg-white shadow-xl rounded-xl p-8 border border-gray-200 w-full md:max-w-xl"
      >
        <h2 class="text-3xl font-bold text-center text-blue-700 mb-6">
          Edit Profile
        </h2>
        <form @submit.prevent="submitForm">
          <div class="mb-5">
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <Input v-model="formData.name" :inputTagData="userNameInputData" />
            <p v-if="v$.name.$error" class="text-red-500 text-sm mt-1">
              {{ v$.name.$errors[0].$message }}
            </p>
          </div>

          <div class="mb-6">
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <Input
              v-model="formData.email"
              :inputTagData="userEmailInputData"
            />
            <p v-if="v$.email.$error" class="text-red-500 text-sm mt-1">
              {{ v$.email.$errors[0].$message }}
            </p>
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 rounded-lg shadow hover:shadow-lg transition"
          >
            Save Changes
          </button>
        </form>
      </div>

      <div class="bg-white shadow-xl rounded-xl p-6 w-full md:flex-1 h-fit">
        <p class="text-gray-500 text-center mb-2 font-medium">Total Spent</p>
        <p class="text-3xl font-extrabold text-center text-blue-700 mb-4">
          ₹{{ totalAmountSpend }}
        </p>

        <div
          class="flex space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-blue-500"
        >
          <img
            v-for="booking in bookedData"
            :key="booking.id"
            :src="booking.event.image_url"
            class="flex-grow h-40 object-cover rounded-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-1">
        <ApexChart
          type="line"
          :series="series"
          :options="chartOptions"
          height="338"
          class="rounded-md border border-gray-200"
        />
      </div>

      <div class="flex-1">
        <ApexChart
          :series="series1"
          :options="chartOptions1"
          height="350"
          class="rounded-md border border-gray-200"
        />
      </div>
    </div>

    <v-card
      v-if="bookedData.length === 0"
      class="text-center justify-between mt-5"
    >
      No booked events available
    </v-card>

    <div v-else-if="bookedData.length > 0" class="space-y-4 mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Total Events Booked</h2>
      <v-row>
        <v-col
          v-for="booking in bookedData"
          :key="booking.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :image="booking.event.image_url"
            class="rounded-lg overflow-hidden"
            style="min-height: 40vh; background-size: cover"
          >
            <div class="bg-black/50 p-4 text-white">
              <h3 class="text-lg font-bold">{{ booking.event.event_title }}</h3>
              <p class="text-sm">{{ booking.event.event_location }}</p>
              <p class="text-sm">
                📅 {{ new Date(booking.event.event_date).toLocaleDateString() }}
              </p>
              <p class="mt-2 font-semibold text-yellow-300">
                ₹{{ booking.event.price }}
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-card
      v-if="bookedData.length === 0"
      class="text-center justify-between mt-5"
    >
      No last booked event available
    </v-card>

    <div v-else-if="bookedData?.length > 0" class="space-y-4 mb-4">
      <h2 class="text-2xl font-bold text-gray-800">Last Event Booked</h2>
      <v-card
        color="surface-variant"
        :image="lastEventBooked[lastEventBooked.length - 1].event.image_url"
        style="min-height: 50vh; background-size: cover"
        class="rounded-xl overflow-hidden"
      >
        <v-card-title class="text-white bg-black/50">
          <strong>{{
            lastEventBooked[lastEventBooked.length - 1].event.event_title
          }}</strong>
        </v-card-title>
        <v-card-subtitle class="text-white px-4">
          {{ lastEventBooked[lastEventBooked.length - 1].event.event_location }}
          |
          {{
            new Date(
              lastEventBooked[lastEventBooked.length - 1].event.event_date
            ).toLocaleDateString()
          }}
        </v-card-subtitle>
        <div class="text-h5 ml-4 mt-3 text-white font-bold">
          ₹{{ lastEventBooked[lastEventBooked.length - 1].event.price }}
        </div>
        <div class="ml-4 mt-2 text-white">
          Payment Status:
          <span class="text-green-400 font-semibold">Completed</span>
        </div>
      </v-card>
    </div>

    <v-card
      v-if="upcomingEvents.length === 0"
      class="text-center justify-between mt-5"
    >
      No upcoming events available
    </v-card>

    <div v-else-if="upcomingEvents.length > 0" class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-800">Upcoming Events</h2>
      <v-row>
        <v-col
          v-for="event in upcomingEvents"
          :key="event.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            :image="event.event.image_url"
            class="rounded-lg overflow-hidden"
            style="min-height: 40vh; background-size: cover"
          >
            <div class="bg-black/50 p-4 text-white">
              <h3 class="text-lg font-bold">{{ event.event.event_title }}</h3>
              <p class="text-sm">{{ event.event.event_location }}</p>
              <p class="text-sm">
                📅 {{ new Date(event.event.event_date).toLocaleDateString() }}
              </p>
              <p class="mt-2 font-semibold text-yellow-300">
                ₹{{ event.event.price }}
              </p>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped></style>
