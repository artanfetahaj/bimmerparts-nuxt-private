<template>
  <div class="animate-pulse">
    <!-- Header Skeleton -->
    <div class="mb-8">
      <div class="h-8 bg-gray-200 rounded-lg w-64 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-96"></div>
    </div>

    <!-- Filters Skeleton -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Search Skeleton -->
        <div class="md:col-span-2">
          <div class="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div class="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        
        <!-- Category Filter Skeleton -->
        <div>
          <div class="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div class="h-10 bg-gray-200 rounded-lg"></div>
        </div>
        
        <!-- Sort Skeleton -->
        <div>
          <div class="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div class="h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
      
      <!-- Price Range Skeleton -->
      <div class="mt-6">
        <div class="h-4 bg-gray-200 rounded w-24 mb-4"></div>
        <div class="h-2 bg-gray-200 rounded-full"></div>
        <div class="flex justify-between mt-2">
          <div class="h-4 bg-gray-200 rounded w-12"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Products Grid Skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="n in 8" :key="n" class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <!-- Product Image Skeleton -->
        <div class="h-48 bg-gray-200"></div>
        
        <!-- Product Info Skeleton -->
        <div class="p-4">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          
          <!-- Price Skeleton -->
          <div class="flex items-baseline gap-2 mb-2">
            <div class="h-6 bg-gray-200 rounded w-16"></div>
            <div class="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          
          <!-- Badge Skeleton -->
          <div class="h-5 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>

    <!-- Pagination Skeleton -->
    <div class="flex justify-center mt-12">
      <div class="flex space-x-2">
        <div class="h-10 w-10 bg-gray-200 rounded"></div>
        <div class="h-10 w-10 bg-gray-200 rounded"></div>
        <div class="h-10 w-10 bg-gray-200 rounded"></div>
        <div class="h-10 w-10 bg-gray-200 rounded"></div>
        <div class="h-10 w-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
