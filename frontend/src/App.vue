<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <header class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold">Kauvery Supermarket</h1>
    </header>
    <main class="max-w-4xl mx-auto mt-6">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>
