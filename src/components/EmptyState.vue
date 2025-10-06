<template>
  <div class="empty-state">
    <div class="empty-icon">📋</div>
    <h3>暂无数据</h3>
    <p>请点击"导入JSON文件"按钮加载数据文件，或点击"粘贴JSON文本"直接导入</p>
    <p class="hint-text">
      💡 提示：导入数据后，点击右上角按钮启用API查询功能
    </p>
  </div>
</template>

<style scoped>
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  margin-bottom: 0.75rem;
}

.hint-text {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--warning-color);
}
</style>

