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
  <v-container fluid class="events-container pa-2 pa-sm-4">
   
    <div class="controls-section">
      <div class="search-wrapper">
        <SearchEvent @filter-event="searchedValue" />
      </div>
      
      <div class="filters-wrapper">
        <v-select
          class="filter-select"
          v-model="sortBy"
          :items="['name', 'date', 'location', 'price', 'ratings']"
          label="Sort by"
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
        
        <v-select
          class="filter-select"
          v-model="sortType"
          :items="['ASC', 'DESC']"
          label="Sort type"
          variant="outlined"
          density="compact"
          hide-details
        ></v-select>
      </div>
    </div>

    
    <div v-if="spinnerLoading" class="spinner-overlay">
      <VueSpinner size="50" color="#1976d2" />
    </div>

    
    <div v-else-if="filteredEvents.length > 0" class="events-grid">
      <v-card
        v-for="(event, index) in filteredEvents"
        :key="event.event_id"
        class="event-card"
        v-fade-in="index * 100"
        @click="showEventDetails(event.event_id)"
        elevation="4"
      >
        <div class="image-wrapper">
          <v-img
            :src="event.image_url"
            class="background-image"
            cover
            :height="$vuetify.display.xs ? '200px' : '300px'"
          />
          
          <div class="card-overlay">
            <div class="card-content">
              
              <div class="content-header">
                <h2 class="event-title">{{ event.event_title }}</h2>
                <v-btn
                  icon
                  size="small"
                  class="heart-btn"
                  @click="toggleHeart(event.event_id, $event)"
                  :color="isFavorite(event.event_id) ? 'red' : 'white'"
                  variant="text"
                >
                  <v-icon>
                    {{ isFavorite(event.event_id) ? 'mdi-heart' : 'mdi-heart-outline' }}
                  </v-icon>
                </v-btn>
              </div>

             
              <div class="event-details">
                <div class="detail-item">
                  <v-icon size="small" class="detail-icon">mdi-text-box-outline</v-icon>
                  <span class="detail-text">{{ event.event_description }}</span>
                </div>
                
                <div class="detail-item">
                  <v-icon size="small" class="detail-icon">mdi-map-marker</v-icon>
                  <span class="detail-text">{{ event.event_location }}</span>
                </div>
                
                <div class="detail-item">
                  <v-icon size="small" class="detail-icon">mdi-currency-inr</v-icon>
                  <span class="detail-text price-text">{{ event.price }}</span>
                </div>
                
                <div class="detail-item">
                  <v-icon size="small" class="detail-icon">mdi-star</v-icon>
                  <span class="detail-text">{{ showAvgRatings(event.event_id) || 'No ratings' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card>
    </div>

   
    <v-card v-else class="no-events-card text-center pa-8 ma-4">
      <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-calendar-remove</v-icon>
      <h3 class="text-h5 mb-2">No Events Available</h3>
      <p class="text-body-1 text-medium-emphasis">
        Try adjusting your search or filter criteria
      </p>
    </v-card>

    
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        :total-visible="$vuetify.display.xs ? 5 : 7"
        class="custom-pagination"
        @update:model-value="goToPage"
      ></v-pagination>
    </div>
  </v-container>
</template>

<style scoped>

.events-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}


.controls-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .controls-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    padding: 20px;
  }
}

.search-wrapper {
  flex: 1;
  max-width: 100%;
}

@media (min-width: 768px) {
  .search-wrapper {
    max-width: 400px;
  }
}

.filters-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

@media (min-width: 480px) {
  .filters-wrapper {
    flex-direction: row;
    gap: 16px;
  }
}

@media (min-width: 768px) {
  .filters-wrapper {
    width: auto;
    min-width: 320px;
  }
}

.filter-select {
  min-width: 140px;
}

@media (max-width: 479px) {
  .filter-select {
    min-width: 100%;
  }
}

/* Events Grid */
.events-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .events-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (min-width: 1200px) {
  .events-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 28px;
  }
}


.event-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
}

.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  position: relative;
  overflow: hidden;
}

.background-image {
  transition: transform 0.3s ease;
}

.event-card:hover .background-image {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.8) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  z-index: 2;
}

.card-content {
  padding: 16px;
  color: white;
}

@media (min-width: 768px) {
  .card-content {
    padding: 20px;
  }
}


.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.event-title {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
  flex: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

@media (min-width: 768px) {
  .event-title {
    font-size: 1.5rem;
  }
}

.heart-btn {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.heart-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}


.event-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 768px) {
  .event-details {
    gap: 10px;
  }
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .detail-item {
    font-size: 0.95rem;
  }
}

.detail-icon {
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
}

.detail-text {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;               
  -webkit-box-orient: vertical;
  box-orient: vertical;       
  -webkit-line-clamp: 2;
  line-clamp: 2;             
}


.price-text {
  font-weight: 600;
  color: #4ade80;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}


.spinner-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}


.no-events-card {
  max-width: 400px;
  margin: 0 auto;
  border-radius: 16px;
}


.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding: 0 16px;
}

.custom-pagination {
  background: white;
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


@media (max-width: 479px) {
  .event-title {
    font-size: 1.1rem;
  }
  
  .detail-item {
    font-size: 0.8rem;
  }
  
  .card-content {
    padding: 12px;
  }
  
  .content-header {
    margin-bottom: 12px;
  }
}


@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-card {
  animation: fadeInUp 0.6s ease-out forwards;
}
</style>