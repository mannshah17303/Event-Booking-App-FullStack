<script setup lang="ts">
import { useStore } from "vuex";
import router from "../router/routes";
import { computed, onMounted, ref, watch } from "vue";
import { VueSpinner } from "vue3-spinners";
import SearchEvent from "./SearchEvent.vue";
import axios from "axios";

const store = useStore();

const showEventDetails = (id: number) => {
  router.push(`/events/${id}`);
};

const currentUser = computed(() => store.state.loggedInUser);

const spinnerLoading = computed(() => store.state.isLoading);
const searchValue = ref("");
const currentPage = ref(1);
const sortType = ref(null);
const sortBy = ref(null);
const eventsPerPage = 5;
const filteredEvents = ref<any>([]);
const totalCount = ref(0);

const fetchFavoriteEvents = async () => {
  store.commit("SPINNER_LOADING_VALUE", true);
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_FAVORITES}/search-sort-pagination`,
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

onMounted(fetchFavoriteEvents);

watch([currentPage, searchValue, sortType, sortBy], fetchFavoriteEvents);

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
  <div class="flex w-[100%] justify-between">
    <div>
      <SearchEvent @filter-event="searchedValue" />
    </div>
    <div class="flex mt-4">
      <v-select
        class="w-[150px] h-[50px] mr-2 rounded-3xl"
        v-model="sortBy"
        :items="['name', 'date', 'location', 'price']"
        label="sort by"
      ></v-select>
      <v-select
        class="w-[150px] h-[50px] mr-4 rounded-3xl"
        v-model="sortType"
        :items="['ASC', 'DESC']"
        label="sort type"
      ></v-select>
    </div>
  </div>
  <div v-if="spinnerLoading" class="spinner-overlay">
    <VueSpinner
      size="50"
      color="black"
      class="flex justify-between align-middle"
    />
  </div>
  <v-row
    v-else-if="filteredEvents.length > 0"
    v-for="favorite in filteredEvents"
  >
    <v-col cols="12">
      <v-card
        color="surface-variant"
        :key="favorite.event.event_id"
        :image="favorite.event.image_url"
        style="min-height: 50vh; background-size: cover; overflow: hidden"
        @click="showEventDetails(favorite.event.event_id)"
      >
        <v-card-title style="display: flex">
          <strong>{{ favorite.event.event_title }}</strong>
        </v-card-title>
        <v-card-subtitle>
          <strong>{{ favorite.event.event_description }}</strong>
        </v-card-subtitle>
        <v-card-subtitle class="mt-3">
          <strong>{{ favorite.event.event_location }}</strong>
        </v-card-subtitle>
        <v-card-subtitle class="mt-3">
          <strong>₹{{ favorite.event.price }}</strong>
        </v-card-subtitle>
      </v-card>
    </v-col>
  </v-row>
  <v-card v-else class="text-center justify-between mt-5"
    >No Favorite Events Available</v-card
  >
  <div class="pagination">
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
.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
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
</style>
