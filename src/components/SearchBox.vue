<template>
  <div class="search-box">
    <input 
      type="text" 
      :value="modelValue"
      placeholder="🔍 搜索邮箱..."
      @input="handleInput"
    >
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'search'])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
  emit('search')
}
</script>

<style scoped>
.search-box {
  flex: 1 1 300px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}
</style>


