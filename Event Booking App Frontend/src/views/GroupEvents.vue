<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { VueSpinner } from "vue3-spinners";
import { useStore } from "vuex";
import router from "../router/routes";
import { toast } from "vue3-toastify";

interface GroupEvent {
  group_id: number;
  date: Date;
  name: string;
  location: string;
  description: string;
  price: string;
  image_url: string;
}

const store = useStore();
const currentUser = computed(() => store.state.loggedInUser);

let groupEvents = ref<GroupEvent[]>([]);
let allGroupEventMembers = ref<any>([]);
onMounted(async () => {
  const response = await axios.get("https://event-booking-app-fullstack.onrender.com/group", {
    withCredentials: true,
  });
  const groupEventMembers = await axios.get(
    "https://event-booking-app-fullstack.onrender.com/group/members",
    {
      withCredentials: true,
    }
  );
  groupEvents.value = response.data.data;
  allGroupEventMembers.value = groupEventMembers.data.data;
});

const spinnerLoading = computed(() => store.state.isLoading);

const showGroupEventDetails = (groupId: number) => {
  router.push(`/group-event/${groupId}`);
};

const handleJoinClick = async (
  groupId: number,
  event: { stopPropagation: () => void }
) => {
  event.stopPropagation();
  if (currentUser.value === null) {
    toast.error("No user available! please login!");
  } else {
    const index = allGroupEventMembers.value.findIndex(
      (isGroupJoinedOrNot: any) =>
        isGroupJoinedOrNot.group_id === groupId &&
        isGroupJoinedOrNot.user_id === currentUser.value.user_id
    );
    if (index !== -1) {
      const memberToRemove = {
        groupId,
        userId: currentUser.value.user_id,
      };
      await axios.delete("https://event-booking-app-fullstack.onrender.com/group/removeMember", {
        data: memberToRemove,
        withCredentials: true,
      });
      allGroupEventMembers.value.splice(index, 1);
      toast.success("removed from group event");
    } else {
      const memberToAdd = {
        groupId,
        userId: currentUser.value.user_id,
      };
      await axios.post("https://event-booking-app-fullstack.onrender.com/group/addMember", memberToAdd, {
        withCredentials: true,
      });
      allGroupEventMembers.value.push({
        group_event_member_id: "",
        group_id: groupId,
        user_id: currentUser.value.user_id,
      });
      toast.success("added to group event");
    }
  }
};

const isJoinedGroupOrNot = (groupId: number) => {
  if (!allGroupEventMembers.value) return false;
  if(currentUser.value === null){
    return false;
  }else{

    return allGroupEventMembers.value.some(
      (member: any) => member.group_id === groupId && member.user_id === currentUser.value.user_id
    );
  }
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

  <v-row
    v-else-if="groupEvents.length > 0"
    v-for="event in groupEvents"
    :key="event.group_id"
  >
    <v-col cols="12">
      <v-card class="event-card" @click="showGroupEventDetails(event.group_id)">
        <div class="image-wrapper">
          <v-img
            :src="event.image_url"
            class="background-image"
            cover
            height="50vh"
          />
          <div class="card-content">
            <v-card-title style="display: flex; justify-content: space-between">
              <strong>{{ event.name }}</strong>
              <v-btn @click="handleJoinClick(event.group_id, $event)" :color="isJoinedGroupOrNot(event.group_id) ? 'green' : 'white'">{{
                isJoinedGroupOrNot(event.group_id) ? "Joined" : "Join"
              }}</v-btn>
            </v-card-title>
            <v-card-subtitle>
              <strong>{{ event.description }}</strong>
            </v-card-subtitle>
            <v-card-subtitle class="mt-3">
              <strong>{{ event.location }}</strong>
            </v-card-subtitle>
            <v-card-subtitle class="mt-3">
              <strong>₹{{ event.price }}</strong>
            </v-card-subtitle>
          </div>
        </div>
      </v-card>
    </v-col>
  </v-row>

  <v-card v-else class="text-center justify-between mt-5">
    No Events Available
  </v-card>
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
