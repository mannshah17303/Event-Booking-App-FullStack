<script setup lang="ts">
import { computed, ref } from "vue";
import Input from "../reusableComponents/Input.vue";
import { toast } from "vue3-toastify";

import router from "../router/routes";
import store from "../store/eventStore";
import axios from "axios";
import { email, helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

const formData = ref({
  email: "",
  password: "",
});
const rules = computed(() => {
  return {
    email: {
      required: helpers.withMessage("please enter email", required),
      email: helpers.withMessage("please enter valid email", email),
    },
    password: {
      required: helpers.withMessage("please enter password", required),
    },
  };
});

const v$ = useVuelidate(rules, formData);
const flag = ref(false);

const submitForm = async () => {
  try {
    const isFormValid = await v$.value.$validate();
    if (isFormValid) {
      if (flag.value) return;

      flag.value = true;
      const res = await axios.post(
        `${import.meta.env.VITE_USERS}/login`,
        formData.value,
        {
          withCredentials: true,
        }
      );
      store.commit("SET_LOGGED_IN_USER", res.data.data);

      toast.success("Login successful", {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => {
        router.push("/events");
      }, 1000);
    }
  } catch (err) {
    toast.error("Invalid email or password", {
      position: "top-right",
      autoClose: 2000,
    });
    flag.value = false;
  }
};

const goToRegister = () => {
  router.push("/register");
};

const forgetPassword = () => {
  router.push("/forget-password");
};

const userEmailInputData = {
  type: "text",
  name: "email",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200",
  placeholder: "Enter your email...",
  autocomplete: "off",
};

const passwordInputData = {
  type: "password",
  name: "password",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200",
  placeholder: "Enter password...",
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
          <p class="text-gray-600">Sign in to your account</p>
        </div>

        <div class="mb-6">
          <label
            for="email"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Email Address
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
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                ></path>
              </svg>
            </div>
            <Input
              v-model="formData.email"
              :required="true"
              :inputTagData="{
                ...userEmailInputData,
                class: userEmailInputData.class + ' pl-10',
              }"
            />
          </div>
          <span v-if="v$.email.$error" class="text-red-500">{{
            v$.email.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-6">
          <label
            for="password"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Password
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
                ...passwordInputData,
                class: passwordInputData.class + ' pl-10',
              }"
            />
          </div>
          <span v-if="v$.password.$error" class="text-red-500">{{
            v$.password.$errors[0].$message
          }}</span>
        </div>

        <div class="flex justify-end mb-6">
          <a
            @click="forgetPassword"
            class="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200"
          >
            Forgot password?
          </a>
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
              Sign In
            </span>
          </button>
        </div>

        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div class="text-center">
          <p class="text-gray-600">
            Don't have an account?
            <a
              @click="goToRegister"
              class="text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer transition-colors duration-200 ml-1"
            >
              Sign up here
            </a>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Additional custom styles if needed */
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
