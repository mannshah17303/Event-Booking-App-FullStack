<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useStore } from "vuex";
import { VueSpinner } from "vue3-spinners";
import VueCal from "vue-cal";
import Input from "../reusableComponents/Input.vue";
import Button from "../reusableComponents/Button.vue";
import router from "../router/routes";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { helpers, minValue, numeric, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import { toast } from "vue3-toastify";

const stripePromise = loadStripe(
  "pk_test_51RjaWe2e0TihKvREZD76nIOD1hwHDOlT2VpJV3BHtTrERPpTUa0Btp4goc3vUts0NIGpaFtWdbWH16T6fioqMW5O00sOwq2tio"
);

const stripe: any = ref(null);

onMounted(async () => {
  stripe.value = await stripePromise;
});

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

const store = useStore();

const currentUser = computed(()=>store.state.loggedInUser)
const allEvents = ref([])
onMounted(async()=>{
  const response = await axios.get(`${import.meta.env.VITE_EVENTS}`,{
    withCredentials:true
  })
  allEvents.value = response.data.data
})

const formattedEvents = computed(() =>
  allEvents.value.map((event: any) => ({
    title: event.event_title,
    start: new Date(event.event_date),
    end: new Date(event.event_date),
    allDay: true,
    content: `<br>${event.event_location}<br><br>${event.price}<br><br>${event.event_description}`,
    location: event.event_location,
    price: event.price,
    id: event.event_id,
    class: "event-item",
  }))
);

const openModelForm = ref(false);
let eventDataBasedOnId = ref<Event | null>(null);

const openForm = (event: { id: number }) => {
  openModelForm.value = true;
  watch(
    () => event.id,
    async (id) => {
      if (!id) return;
      const response = await axios.get(
        `${import.meta.env.VITE_EVENTS}/getEventDetailsByEventId`,
        {
          params: {
            eventId: event.id,
          },
          withCredentials: true,
        }
      );
      eventDataBasedOnId.value = response.data.data;
    },
    { immediate: true }
  );
};

const formData = ref({
  quantity: 0,
});

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

const cancelForm = () => {
  openModelForm.value = false;
  formData.value = {
    quantity: 0,
  };
};

const submitEvent = async () => {
  if (currentUser.value == null) {
    alert("please login to book the event");
    router.push("/");
  } else {
    const isFormValid = await v$.value.$validate();
    if (isFormValid) {
      const today = new Date().toISOString().split('T')[0];
      if(new Date(eventDataBasedOnId.value!.event_date).toISOString().split('T')[0] < today){
        toast.error("cannot book because the date has gone");
        return;
      }
      const confirmBooking = confirm("Are You sure you want to Book?");

      if (confirmBooking) {
        const insertBookedData = {
          user_id: currentUser.value.user_id,
          event_id: eventDataBasedOnId.value?.event_id,
          booking_date: new Date().toISOString(),
          quantity: Number(formData.value.quantity),
          price_per_ticket: parseFloat(eventDataBasedOnId.value!.price),
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

const handleClickApartFromForm = () => {
  cancelForm();
};

const eventPriceInputData = {
  type: "text",
  name: "eventPrice",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-gray-200",
};

const titleNameInputData = {
  type: "text",
  name: "eventTitle",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-gray-200",
};

const eventLocationInputData = {
  type: "text",
  name: "eventLocation",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-gray-200",
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

const quantityInputData = {
  type: "text",
  name: "quantity",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-white placeholder-gray-200",
};

const spinnerLoading = computed(() => store.state.isLoading);
</script>

<template>
  <div v-if="spinnerLoading" class="spinner-overlay">
    <VueSpinner
      size="50"
      color="black"
      class="flex justify-between align-middle"
    />
  </div>
  <div v-else class="calendar-container">
    <vue-cal
      v-if="formattedEvents.length > 0 || !openModelForm"
      @event-click="openForm"
      class="vuecal--blue-theme"
      :events="formattedEvents"
      :disable-views="['years', 'year']"
      :time="true"
      :editable-events="false"
    />
    <div
      v-if="openModelForm"
      class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50"
      @click="handleClickApartFromForm"
    >
      <div
        class="bg-black shadow-2xl pl-3 pr-3 rounded-2xl p-8 border-3 border-white max-w-md w-full mx-4"
        @click.stop
      >
        <form @submit.prevent="submitEvent">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-white mb-2">Book Event</h2>
            <div class="w-16 h-1 mx-auto rounded-full bg-white"></div>
          </div>

          <div class="mb-6">
            <label
              for="eventTitle"
              class="block text-sm font-semibold text-white mb-2"
            >
              Event Name
            </label>
            <Input
              v-model="eventDataBasedOnId!.event_title"
              :readonly="true"
              :inputTagData="titleNameInputData"
            />
          </div>

          <div class="mb-8">
            <label
              for="eventLocation"
              class="block text-sm font-semibold text-white mb-2"
            >
              Event Location
            </label>
            <Input
              v-model="eventDataBasedOnId!.event_location"
              :readonly="true"
              :inputTagData="eventLocationInputData"
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
              v-model="formData.quantity"
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
              v-model="eventDataBasedOnId!.price"
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
  </div>
</template>

<style scoped>
.calendar-container {
  padding: 20px;
}

.vuecal--blue-theme {
  height: 600px;
}

:deep(.event-item) {
  background-color: #1976d2 !important;
  color: white !important;
  border-radius: 4px;
  padding: 2px 6px;
  margin-top: 12px;
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
