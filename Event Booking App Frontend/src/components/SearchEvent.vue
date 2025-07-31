<script setup lang="ts">
import { ref, watch } from "vue";
import Input from "../reusableComponents/Input.vue";
import debounceFunc from "../utils/debounce";

const emit = defineEmits<{
  filterEvent: [searchTerm: string];
}>();

const searchValue = ref("");

const debounceEmit = debounceFunc(() => {
  emit("filterEvent", searchValue.value);
}, 1000);

watch(searchValue, () => {
  debounceEmit();
});

const searchInputData = {
  id: "search",
  type: "text",
  name: "eventName",
  class:
    "px-4 py-3 ml-2 mt-5 border border-gray-300 rounded-lg focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500 shadow-2xl",
  placeholder: "Search based on title, location...",
  autocomplete: "off",
};
</script>

<template>
  <div>
    <form>
      <div class="mb-6">
        <Input
          v-model="searchValue"
          :required="true"
          :inputTagData="searchInputData"
        />
      </div>
    </form>
  </div>
</template>
