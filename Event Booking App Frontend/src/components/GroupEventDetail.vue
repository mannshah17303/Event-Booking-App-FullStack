<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { VueSpinner } from "vue3-spinners";
import { useStore } from "vuex";

const route = useRoute();
const store = useStore();
interface GroupEvent {
  group_id: number;
  date: Date;
  name: string;
  location: string;
  description: string;
  price: string;
  image_url: string;
}

const groupId: number = Number(route.params.id);

const groupEventDetail = ref<GroupEvent | null>(null);
watch(
  () => groupId,
  async (id) => {
    if (!id) return;
    const response = await axios.get(
      `${import.meta.env.VITE_GROUP}/getGroupEventDetailsByGroupId`,
      {
        params: {
          groupId,
        },
        withCredentials: true,
      }
    );
    groupEventDetail.value = response.data.data;
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
const totalMembersInGroupEvent = ref(0);
onMounted(async () => {
  const response = await axios.get(`${import.meta.env.VITE_GROUP}/calculateMembers`, {
    params:{
      groupId
    },
    withCredentials: true,
  });
  totalMembersInGroupEvent.value = response.data.data.length
  console.log(totalMembersInGroupEvent.value);
});

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
  <v-card
    v-else
    class="fill-height blurred-card"
    :style="`--v-image: url(${groupEventDetail!.image_url})`"
    color="surface-variant"
    style="min-height: 100vh"
  >
    <v-card-title>
      <strong>{{ groupEventDetail!.name }}</strong>
    </v-card-title>
    <v-card-subtitle>
      <strong>{{ groupEventDetail!.description }}</strong>
    </v-card-subtitle>
    <v-spacer></v-spacer>

    <v-card-text class="text-white">
      <v-row>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Date:</strong>
            {{ new Date(groupEventDetail!.date).toLocaleDateString('en-GB',{
              day:"2-digit",
              month:"short",
              year:"numeric"
            }) }}
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="mb-2">
            <strong>Location:</strong> {{ groupEventDetail!.location }}
          </div>
        </v-col>
      </v-row>
      <div class="text-h5 mt-4">
        <div class="mb-2"><strong>Members joined till now:</strong> {{ totalMembersInGroupEvent || 0 }}</div>
      </div>
    </v-card-text>
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
