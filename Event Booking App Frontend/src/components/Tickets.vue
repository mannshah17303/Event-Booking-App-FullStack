<script setup lang="ts">
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useRoute } from "vue-router";
import { useStore } from "vuex";
import Button from "../reusableComponents/Button.vue";
import { computed, ref, watch, type ComputedRef } from "vue";
import axios from "axios";

const route = useRoute();
const store = useStore();

const eventId:ComputedRef<number> = computed(()=>Number(route.params.id));

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

const bookedEventDetails: any = ref([]);
watch(()=>eventId,async(id)=>{
  if(!id)return;
  const response = await axios.get(`${import.meta.env.VITE_BOOKINGS}/getBookedEventDetailsByEventId`,{
    params:{
      eventId:id.value
    },
    withCredentials:true
  })
  bookedEventDetails.value = response.data.data

}, {immediate:true})

const downloadTicket = async () => {
  const doc = new jsPDF();

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  const bookingId = `${timestamp}-${randomString}`;
  const qrContent = `
        Booking ID: ${bookingId}
        Name: ${currentUser.value.name}
        Event: ${bookedEventDetails.value.event.event_title}
        Date: ${new Date(
          bookedEventDetails.value.event.event_date
        ).toLocaleDateString()}
        Location: ${bookedEventDetails.value.event.event_location}
        Price: ${bookedEventDetails.value.event.price}
        `.trim();
  const qrDataUrl = await QRCode.toDataURL(qrContent);

  doc.setFontSize(16);
  doc.text("Booking details", 20, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${currentUser.value.name}`, 20, 40);
  doc.text(`Event: ${bookedEventDetails.value.event.event_title}`, 20, 50);
  doc.text(
    `Date: ${new Date(
      bookedEventDetails.value.event.event_date
    ).toLocaleDateString()}`,
    20,
    60
  );
  doc.text(`Location: ${bookedEventDetails.value.event.event_location}`, 20, 70);
  doc.text(`Price: ${bookedEventDetails.value.event.price}`, 20, 80);

  doc.addImage(qrDataUrl, "PNG", 150, 35, 40, 40);

  doc.save(`${bookingId}.pdf`);
};

const pdfDownloadTagData = {
  type: "button",
  class:
    "bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform",
  spanContent: "🎫 Download Ticket",
};
</script>

<template>
  <v-card
    v-if="currentUser !== null"
    class="fill-height blurred-card"
    :style="`--v-image: url(${bookedEventDetails.event.image_url})`"
    color="surface-variant"
    style="min-height: 100vh"
  >
    <v-card-title>
      <strong>🎟️{{ bookedEventDetails.event.event_title }}</strong>
    </v-card-title>
    <v-card-subtitle>
      <strong>👤{{ currentUser.name }}</strong>
    </v-card-subtitle>
    <v-spacer></v-spacer>

    <v-card-text class="text-white">
      <v-row>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Date:</strong>
            {{
              new Date(bookedEventDetails.event.event_date).toLocaleDateString()
            }}
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Location:</strong>
            {{ bookedEventDetails.event.event_location }}
          </div>
        </v-col>
      </v-row>
      <div class="text-h5 mt-4">
        <strong>₹{{ bookedEventDetails.event.price }}</strong>
      </div>
    </v-card-text>

    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <Button @click="downloadTicket" :buttonTagData="pdfDownloadTagData" />
      </div>
    </div>
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
</style>
