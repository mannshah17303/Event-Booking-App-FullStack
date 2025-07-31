<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import useVuelidate from "@vuelidate/core";
import { required, helpers, numeric, minValue } from "@vuelidate/validators";
import Button from "../reusableComponents/Button.vue";
import Input from "../reusableComponents/Input.vue";
import router from "../router/routes";
import { VueSpinner } from "vue3-spinners";
import axios from "axios";
import { toast } from "vue3-toastify";

const route = useRoute();
const store = useStore();
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
const formData = ref({
  quantity: 0,
});

const eventId: number = Number(route.params.id);

const eventDetail = ref<Event | null>(null);
watch(
  () => eventId,
  async (id) => {
    if (!id) return;
    const response = await axios.get(
      `${import.meta.env.VITE_EVENTS}/getEventDetailsByEventId`,
      {
        params: {
          eventId,
        },
        withCredentials: true,
      }
    );
    eventDetail.value = response.data.data;
  },
  { immediate: true }
);

let currentUser: any = ref(null);
watch(
  () => store.state.loggedInUser,
  (user) => {
    if (!currentUser.value) {
      currentUser.value = user;
    }
  },
  { immediate: true }
);

const spinnerLoading = computed(() => store.state.isLoading);

const submitEvent = async () => {
  if (currentUser.value == null) {
    alert("You must login to book the event");
    router.push("/");
  } else {
    const isFormValid = await v$.value.$validate();
    if (isFormValid) {
      const today = new Date().toISOString().split('T')[0];
      if(new Date(eventDetail.value!.event_date).toISOString().split('T')[0] < today){
        toast.error("cannot book because the date has gone");
        return;
      }
      const confirmBooking = confirm("Are You sure you want to Book?");
      if (confirmBooking) {
        const insertBookedData = {
          user_id: currentUser.value.user_id,
          event_id: eventId,
          booking_date: new Date().toISOString(),
          quantity: Number(formData.value.quantity),
          price_per_ticket: parseFloat(eventDetail.value!.price),
        };
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BOOKINGS}/create-payment-intent`,
            insertBookedData,
            { withCredentials: true }
          );
  
  
          const { paymentIntentId } = response.data.data;
  
          const completedBookingData = {
            ...insertBookedData,
            paymentIntentId,
          };
  
          store.dispatch("addBooking", completedBookingData);
          alert("Payment successful and booking confirmed!");
          cancelForm();
          
        } catch (error:any) {
          if(error.response && error.response.data.message === "event is already booked"){
            toast.error("event is already booked")
          }
        }
      }
    }
  }
};

const showEventForm = ref(false);

const openEventForm = async () => {
  showEventForm.value = true;
};

const cancelForm = () => {
  showEventForm.value = false;
  formData.value = {
    quantity: 0,
  };
};

const handleClickApartFromForm = () => {
  cancelForm();
};

const rules = computed(() => {
  return {
    quantity: {
      required: helpers.withMessage("please enter number of members", required),
      numeric,
      minValue: minValue(1),
    },
  };
});
const v$ = useVuelidate(rules, formData);

const eventButtonTagData = {
  class: "eventButton",
  spanContent: "Book Event",
};

const bookButtonTagData = {
  type: "submit",
  class: "eventButton",
  spanContent: "Book",
};

const cancelButtonTagData = {
  type: "button",
  class: "cancelButton",
  spanContent: "Cancel",
};

const titleNameInputData = {
  type: "text",
  name: "eventTitle",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-gray-200",
};

const quantityInputData = {
  type: "number",
  name: "quantity",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-gray-200",
};

const eventPriceInputData = {
  type: "text",
  name: "eventPrice",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-gray-200",
};
</script>

<template>
  <div v-if="spinnerLoading" class="spinner-overlay">
    <VueSpinner
      size="50"
      color="black"
      class="flex justify-between align-middle"
    />
  </div>
  <v-card
    v-else
    class="fill-height blurred-card"
    :style="`--v-image: url(${eventDetail!.image_url})`"
    color="surface-variant"
    style="min-height: 100vh"
  >
    <v-card-title>
      <strong>{{ eventDetail!.event_title }}</strong>
    </v-card-title>
    <v-card-subtitle>
      <strong>{{ eventDetail!.event_description }}</strong>
    </v-card-subtitle>
    <v-spacer></v-spacer>

    <v-card-text class="text-white">
      <v-row>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Date:</strong>
            {{ new Date(eventDetail!.event_date).toLocaleDateString() }}
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Location:</strong> {{ eventDetail!.event_location }}
          </div>
        </v-col>
      </v-row>
      <div class="text-h5 mt-4">
        <strong>₹{{ eventDetail!.price }}</strong>
      </div>
    </v-card-text>

    <template v-slot:actions>
      <Button
        v-if="!showEventForm"
        @click="openEventForm"
        :buttonTagData="eventButtonTagData"
      />
      <div
        v-if="showEventForm"
        class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50"
        @click="handleClickApartFromForm"
      >
        <div
          class="bg-black shadow-2xl pl-3 pr-3 rounded-2xl p-8 border-3 h-[500px] overflow-y-scroll border-white max-w-md w-full mx-4"
          @click.stop
        >
          <form @submit.prevent="submitEvent">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-white mb-2">Book Event</h2>
              <div class="w-16 h-1 mx-auto rounded-full gradientBg"></div>
            </div>

            <div class="mb-6">
              <label
                for="eventTitle"
                class="block text-sm font-semibold text-white mb-2"
              >
                Event Name
              </label>
              <Input
                v-model="eventDetail!.event_title"
                :readonly="true"
                :inputTagData="titleNameInputData"
              />
            </div>

            <div class="mb-6">
              <label
                for="quantity"
                class="block text-sm font-semibold text-white mb-2"
              >
                Quantity
              </label>
              <Input
                v-model.number="formData.quantity"
                :required="true"
                :inputTagData="quantityInputData"
              />
              <span v-if="v$.quantity.$error" class="text-red-500">{{
                v$.quantity.$errors[0].$message
              }}</span>
            </div>

            <div class="mb-6">
              <label
                for="eventPrice"
                class="block text-sm font-semibold text-white mb-2"
              >
                Event Price
              </label>
              <Input
                v-model="eventDetail!.price"
                :readonly="true"
                :inputTagData="eventPriceInputData"
              />
            </div>

            <div class="flex flex-col sm:flex-row gap-3">
              <div class="flex-1">
                <Button :buttonTagData="bookButtonTagData" />
              </div>
              <div class="flex-1">
                <Button
                  @click="cancelForm"
                  :buttonTagData="cancelButtonTagData"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </template>
  </v-card>
</template>

<style scoped>
.blurred-card {
  position: relative;
  overflow: hidden;
}
.blurred-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: var(--v-image);
  background-size: cover;
  background-position: center;
  filter: blur(12px);
  transform: scale(1.05);
  z-index: 1;
}
.blurred-card > * {
  position: relative;
  z-index: 2;
}

.gradientBg {
  background-image: linear-gradient(
    0deg,
    #ff512f 0%,
    #f09819 51%,
    #ff512f 100%
  );
}

.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(
    0,
    0,
    0,
    0.5
  ); /* Optional: semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
