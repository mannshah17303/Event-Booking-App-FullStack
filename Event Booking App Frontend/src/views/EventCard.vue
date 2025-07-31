<script setup lang="ts">
import { useStore } from "vuex";
import router from "../router/routes";
import SearchEvent from "../components/SearchEvent.vue";
import { computed, onMounted, ref, watch } from "vue";
import { VueSpinner } from "vue3-spinners";
import axios from "axios";
import { toast } from "vue3-toastify";

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

const currentUser = computed(() => store.state.loggedInUser);

const showRedColorInFavoriteEvents: any = ref([]);
watch(
  currentUser,
  async (newUser) => {
    if (!newUser) return;
    const response = await axios.get(
      `${import.meta.env.VITE_FAVORITES}/showRedColorInFavoriteEvents`,
      {
        params: { userId: newUser.user_id },
        withCredentials: true,
      }
    );
    showRedColorInFavoriteEvents.value = response.data.data;
  },
  { immediate: true }
);

const isFavorite = (eventId: number) => {
  if (!showRedColorInFavoriteEvents.value) return false;
  return showRedColorInFavoriteEvents.value.some(
    (fav: any) => fav.event_id === eventId
  );
};

const searchValue = ref("");
const sortType = ref(null);
const sortBy = ref(null);
const currentPage = ref(1);
const itemsPerPage = 5;

const filteredEvents = ref<Event[]>([]);

const spinnerLoading = computed(() => store.state.isLoading);

const totalCount = ref(0);
const fetchEvents = async () => {
  store.commit("SPINNER_LOADING_VALUE", true);
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_EVENTS}/search-sort-pagination`,
      {
        params: {
          value: searchValue.value,
          page: currentPage.value,
          pageSize: itemsPerPage,
          sortType: sortType.value,
          sortBy: sortBy.value,
        },
      }
    );
    filteredEvents.value = response.data.data;
    totalCount.value = response.data.totalCount;
    console.log(response.data.data);
  } catch (error) {
    console.error("Error fetching paginated events:", error);
  } finally {
    store.commit("SPINNER_LOADING_VALUE", false);
  }
};

onMounted(fetchEvents);

watch([currentPage, searchValue, sortType, sortBy], fetchEvents);

const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage));

const showEventDetails = (id: number) => {
  router.push(`/events/${id}`);
};

const vFadeIn = {
  mounted(el: HTMLElement, binding: { value: number }) {
    const delay = binding.value || 0;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, delay);
  },
};

const toggleHeart = (id: number, event: { stopPropagation: () => void }) => {
  event.stopPropagation();
  const index = showRedColorInFavoriteEvents.value.findIndex(
    (fav: { event_id: number }) => fav.event_id === id
  );
  if (index !== -1) {
    showRedColorInFavoriteEvents.value.splice(index, 1);
    store.dispatch("removeFavorite", id);
  } else if (currentUser.value === null) {
    toast.error("No user available! please login!");
  } else {
    showRedColorInFavoriteEvents.value.push({
      favorite_id: "",
      user_id: currentUser.value.user_id,
      event_id: id,
    });
    store.dispatch("addFavorite", id);
  }
};

const searchedValue = (searchTerm: string) => {
  searchValue.value = searchTerm;
  currentPage.value = 1;
};

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

const averageRatingsPerEvent = ref([]);
onMounted(async () => {
  const avgRatings = await axios.get(
    `${import.meta.env.VITE_BOOKINGS}/averageRatings`,
    {
      withCredentials: true,
    }
  );
  averageRatingsPerEvent.value = avgRatings.data.data;
});

const showAvgRatings = (eventId: number) => {
  const isAvgRatingAvailable: any = averageRatingsPerEvent.value.find(
    (r: any) => r.event_id === eventId
  );
  return isAvgRatingAvailable ? isAvgRatingAvailable.avg_ratings : 0;
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
        :items="['name', 'date', 'location', 'price', 'ratings']"
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
    v-for="(event, index) in filteredEvents"
    :key="event.event_id"
  >
    <v-col cols="12">
      <v-card
        class="event-card"
        v-fade-in="index * 100"
        @click="showEventDetails(event.event_id)"
      >
        <div class="image-wrapper">
          <v-img
            :src="event.image_url"
            class="background-image"
            cover
            height="50vh"
          />
          <div class="card-content">
            <v-card-title style="display: flex">
              <strong>{{ event.event_title }}</strong>
              <i
                @click="toggleHeart(event.event_id, $event)"
                :class="
                  isFavorite(event.event_id)
                    ? 'mdi mdi-heart text-red-500'
                    : 'mdi mdi-heart'
                "
              ></i>
            </v-card-title>
            <v-card-subtitle>
              <strong>{{ event.event_description }}</strong>
            </v-card-subtitle>
            <v-card-subtitle class="mt-3">
              <strong>{{ event.event_location }}</strong>
            </v-card-subtitle>
            <v-card-subtitle class="mt-3">
              <strong>₹{{ event.price }}</strong>
            </v-card-subtitle>
            <v-card-subtitle class="mt-3">
              ⭐ <strong>{{ showAvgRatings(event.event_id) }}</strong>
            </v-card-subtitle>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>

  <v-card v-else class="text-center justify-between mt-5">
    No Events Available
  </v-card>

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
      :disabled="currentPage === totalPages"
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

.image-wrapper {
  position: relative;
  height: 50vh;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  filter: blur(8px);
  z-index: 0;
}

.card-content {
  position: relative;
  z-index: 1;
  color: white;
  background-color: rgba(0, 0, 0, 0.3);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mdi-heart {
  margin-left: auto;
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
  background-color: #3b82f6; /* blue */
  color: white;
  border-color: #3b82f6;
}
</style>
