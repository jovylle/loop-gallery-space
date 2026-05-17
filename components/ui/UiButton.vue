<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :class="[variant === 'primary' ? 'btn-primary' : 'btn-ghost', $attrs.class]"
    :disabled="disabled"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost'
    tag?: 'button' | 'a' | 'NuxtLink'
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', tag: 'button', type: 'button', disabled: false },
)
</script>
