<script setup lang="ts">
interface InputTagData {
  id?: string;
  type: string;
  name: string;
  class: string;
  placeholder?: string;
  autocomplete?: string;
}

const props = defineProps<{
  inputTagData: InputTagData;
  modelValue?: string | number;
  required?: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>

<template>
  <div>
    <form>
      <div class="mb-6">
        <input
          :id="props.inputTagData.id"
          :type="props.inputTagData.type"
          :name="props.inputTagData.name"
          :value="props.modelValue"
          :required="props.required"
          :readonly="props.readonly"
          :class="props.inputTagData.class"
          :placeholder="props.inputTagData.placeholder"
          :autocomplete="props.inputTagData.autocomplete"
          @input="handleInput"
        />
      </div>
    </form>
  </div>
</template>

<style scoped></style>
