<template>
  <div class="stats">
    <div class="stat-item">
      <span class="stat-label">总账户数：</span>
      <span class="stat-value">{{ totalCount }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">有效Token：</span>
      <span class="stat-value">{{ validTokenCount }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalCount: {
    type: Number,
    default: 0
  },
  validTokenCount: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.stats {
  display: flex;
  gap: 2rem;
  flex: 0 0 auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .stats {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>


