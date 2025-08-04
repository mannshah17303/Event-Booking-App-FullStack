<script setup lang="ts">
import { computed, ref } from "vue";
import Input from "../reusableComponents/Input.vue";
import useVuelidate from "@vuelidate/core";
import { required, helpers, email, minLength } from "@vuelidate/validators";
import router from "../router/routes";
import axios from "axios";
import { toast } from "vue3-toastify";

const formData = ref({
  name: "",
  email: "",
  role: "",
  password: "",
});

const rules = computed(() => {
  return {
    name: {
      required: helpers.withMessage("please enter your name", required),
    },
    email: {
      required: helpers.withMessage("Please Enter email", required),
      email: helpers.withMessage("Please enter a valid email address.", email),
    },
    role: {
      required: helpers.withMessage("Please select role", required),
    },
    password: {
      required: helpers.withMessage("Please enter password", required),
      hasUpperCase: helpers.withMessage(
        "Must contain at least one uppercase letter",
        (value: string) => /[A-Z]/.test(value)
      ),
      hasSpecialChar: helpers.withMessage(
        "Must contain at least one special character",
        (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value)
      ),
      minLength: minLength(6),
    },
  };
});
const v$ = useVuelidate(rules, formData);

const flag = ref(false);

const submitForm = async () => {
  if (flag.value) return;
  flag.value = true;
  try {
    const isFormValid = await v$.value.$validate();
    if (isFormValid) {
      setTimeout(() => {
        router.push("/");
      }, 2000);
      const insertUserData = {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role,
        password: formData.value.password,
      };
      await axios.post(
        `${import.meta.env.VITE_USERS}/insertUser`,
        insertUserData,
        {
          withCredentials: true,
        }
      );
      toast.success("Registered successfully", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  } catch (error) {
    flag.value = false;
  }
};

const goToLogin = () => {
  router.push("/");
};

const userNameInputData = {
  type: "text",
  name: "userName",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200",
  placeholder: "Enter your name...",
  autocomplete: "off",
};

const userEmailInputData = {
  type: "text",
  name: "email",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200",
  placeholder: "Enter your email...",
  autocomplete: "off",
};

const roleInputData = {
  type: "text",
  name: "role",
  class:
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white focus:bg-white text-gray-900 placeholder-gray-500 transition-all duration-200",
  placeholder: "Enter role...",
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
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 sm:px-6 md:px-8"
  >
    <div
      class="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 border border-gray-200 max-w-full sm:max-w-md w-full relative overflow-hidden"
    >
      <div
        class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"
      ></div>

      <form @submit.prevent="submitForm" class="relative z-10">
        <div class="text-center sm:text-left mt-3 mb-8">
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Register</h2>
          <p class="text-gray-600">Sign up with your account</p>
        </div>

        <div class="mb-6">
          <label
            for="userName"
            class="block text-sm font-semibold text-gray-700 mb-2"
          >
            Name
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
                  d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196zM12 12a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            </div>

            <Input
              v-model="formData.name"
              :required="true"
              :inputTagData="{ ...userNameInputData, class: userNameInputData.class + ' pl-10' }"
            />
          </div>
          <span v-if="v$.name.$error" class="text-red-500">{{
            v$.name.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-6">
          <label
            for="email"
            class="block text-sm font-semibold text-gray-700 mb-2 ml-2"
          >
            email
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
              :inputTagData="{ ...userEmailInputData, class: userEmailInputData.class + ' pl-10' }"
            />
          </div>
          <span v-if="v$.email.$error" class="text-red-500">{{
            v$.email.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-8">
          <label
            for="role"
            class="block text-sm font-semibold text-gray-700 mb-2 ml-2"
          >
            role
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
                  d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-8 0 4 4 0 008 0zm6 0a4 4 0 10-8 0 4 4 0 008 0z"
                />
              </svg>
            </div>
            <Input
              v-model="formData.role"
              :required="true"
              :inputTagData="{ ...roleInputData, class: roleInputData.class + ' pl-10' }"
            />
          </div>
          <span v-if="v$.role.$error" class="text-red-500">{{
            v$.role.$errors[0].$message
          }}</span>
        </div>

        <div class="mb-8">
          <label
            for="password"
            class="block text-sm font-semibold text-gray-700 mb-2 ml-2"
          >
            password
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
              :inputTagData="{ ...passwordInputData, class: passwordInputData.class + ' pl-10' }"
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
              Register
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
            Already have an account?
            <a
              @click="goToLogin"
              class="text-blue-600 hover:text-blue-700 font-semibold hover:underline cursor-pointer transition-colors duration-200 ml-1"
            >
              Sign in here
            </a>
          </p>
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


@media (max-width: 640px) {
  form > div.mb-6,
  form > div.mb-8 {
    margin-bottom: 1.25rem; /* 20px */
  }
}
</style>
