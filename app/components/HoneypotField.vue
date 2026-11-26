<template>
  <div class="hp-field" aria-hidden="true">
    <input
      type="text"
      name="website"
      tabindex="-1"
      autocomplete="off"
      aria-hidden="true"
      class="hp-input"
    />
  </div>
</template>

<style scoped>
.hp-field {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.hp-input {
  position: absolute;
  left: -9999px;
}
</style>
