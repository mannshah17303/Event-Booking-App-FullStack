<script setup lang="ts">
import { computed, ref } from "vue";
import Input from "../reusableComponents/Input.vue";
import { toast } from "vue3-toastify";

import router from "../router/routes";
import axios from "axios";
import { useRoute } from "vue-router";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const formData = ref({
  password: "",
});

const route = useRoute();
const resetToken = route.query.token;

const rules = computed(() => {
  return {
    password: {
      required: helpers.withMessage("please enter password", required),
    },
  };
});

const v$ = useVuelidate(rules, formData);

const flag = ref(false);

const submitForm = async () => {
  const isFormValid = await v$.value.$validate();
  if (isFormValid) {
    if (flag.value) return;

    flag.value = true;
    try {
      await axios.post(
        `${import.meta.env.VITE_USERS}/reset-password`,
        { password: formData.value.password, token: resetToken },
        {
          withCredentials: false,
        }
      );

      toast.success("password set successful", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (err) {
      toast.error("You cannot reuse a previously used password.", {
        position: "top-right",
        autoClose: 2000,
      });
      flag.value = false;
    }
  }
};

const resetPasswordInputData = {
  type: "password",
  name: "reset-password",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200",
  placeholder: "Enter new password...",
  autocomplete: "off",
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4"
  >
    <div
      class="bg-white shadow-2xl rounded-2xl p-8 border border-gray-200 max-w-md w-full relative overflow-hidden"
    >
      <div
        class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"
      ></div>

      <form @submit.prevent="submitForm" class="relative z-10">
        <div class="text-center mt-3 mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
        </div>
        <div class="mb-6">
          <label
            for="reset password"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            reset password
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
            </div>
            <Input
              v-model="formData.password"
              :required="true"
              :inputTagData="{
                ...resetPasswordInputData,
                class: resetPasswordInputData.class + ' pl-10',
              }"
            />
          </div>
          <span v-if="v$.password.$error" class="text-red-500">{{
            v$.password.$errors[0].$message
          }}</span>
        </div>
        <div class="mb-6">
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            :disabled="flag"
          >
            <span class="flex items-center justify-center gap-2">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                ></path>
              </svg>
              reset password
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: fadeIn 0.5s ease-out;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

* {
  transition-property: color, background-color, border-color, transform,
    box-shadow;
  transition-duration: 200ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
