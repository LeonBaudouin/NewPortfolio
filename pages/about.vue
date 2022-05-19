<template>
  <TextContent :title="title" :texts="texts" />
</template>

<script lang="ts" setup>
const title = 'What is Lorem Ipsum?'
const texts = [
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem <strong>dummy text ever</strong> since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem <strong>dummy text ever</strong> since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
]
</script>
