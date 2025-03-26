<script>
  import { onMount } from "svelte";
  import { authClient } from "../lib/auth-client";
  const baseURL = import.meta.env.BASE_URL;
  // State variables
  let journalEntries = [];
  let isLoading = true;
  let error = null;

  // Fetch journal entries from API
  onMount(async () => {
    try {
      const response = await authClient.$fetch(baseURL + "/api/entries");
      journalEntries = response.data;
      isLoading = false;
    } catch (err) {
      error = err.message;
      isLoading = false;
    }
  });

  // Computed statistics
  $: totalEntries = journalEntries.length;
  $: averageContentLength =
    totalEntries > 0
      ? Math.round(
          journalEntries.reduce((sum, entry) => sum + entry.content.length, 0) /
            totalEntries
        )
      : 0;
  $: moodCounts = journalEntries.reduce((counts, entry) => {
    if (entry.mood) {
      counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    }
    return counts;
  }, {});

  // Handle tags (which might be null in the API response)
  $: processedEntries = journalEntries.map((entry) => ({
    ...entry,
    tags: entry.tags || [], // Convert null tags to empty array
  }));

  $: allTags = [
    ...new Set(
      processedEntries.flatMap((entry) => entry.tags).filter((tag) => tag) // Filter out any null/undefined tags
    ),
  ];

  $: tagCounts = processedEntries
    .flatMap((entry) => entry.tags)
    .filter((tag) => tag)
    .reduce((counts, tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      return counts;
    }, {});

  // Filter state
  let searchTerm = "";
  let selectedTag = "";

  // Filtered entries
  $: filteredEntries = processedEntries.filter((entry) => {
    const matchesSearch =
      searchTerm === "" ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      selectedTag === "" || (entry.tags && entry.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  // Format date helper
  function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  // Add new entry
  let showNewEntryForm = false;
  let newEntry = {
    title: "",
    content: "",
    mood: "",
    tags: "",
  };

  function addNewEntry() {
    if (newEntry.title && newEntry.content) {
      const entry = {
        id: crypto.randomUUID(), // Temporary ID until server assigns one
        title: newEntry.title,
        content: newEntry.content,
        mood: newEntry.mood || "Neutral",
        isPublic: false,
        tags: newEntry.tags
          ? newEntry.tags.split(",").map((tag) => tag.trim())
          : [],
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Optimistically add to UI
      journalEntries = [entry, ...journalEntries];

      // In a real app, you would POST to the API here
      // fetch('/api/entries', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });

      resetNewEntryForm();
    }
  }

  function resetNewEntryForm() {
    newEntry = {
      title: "",
      content: "",
      mood: "",
      tags: "",
    };
    showNewEntryForm = false;
  }
</script>

<main class="max-w-4xl mx-auto p-4">
  <header class="mb-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">My Journal</h1>
    <p class="text-gray-600">Track your thoughts, moods, and reflections</p>
  </header>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <!-- Journal Stats Component -->
    <div class="md:col-span-3 bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Journal Statistics</h2>

      {#if isLoading}
        <!-- Stats Shimmer Loading Effect -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {#each Array(4) as _, i}
            <div class="bg-gray-100 p-4 rounded-lg animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div class="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          {/each}
        </div>

        <!-- Tag Cloud Shimmer -->
        <div class="mt-6">
          <div class="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div class="flex flex-wrap gap-2">
            {#each Array(8) as _, i}
              <div
                class="h-7 bg-gray-200 rounded-full w-16 animate-pulse"
              ></div>
            {/each}
          </div>
        </div>
      {:else if error}
        <div class="p-4 bg-red-50 text-red-700 rounded-lg">
          Failed to load statistics: {error}
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-sm text-purple-600 font-medium">Total Entries</p>
            <p class="text-2xl font-bold text-purple-800">{totalEntries}</p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-600 font-medium">Avg. Entry Length</p>
            <p class="text-2xl font-bold text-blue-800">
              {averageContentLength} chars
            </p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-green-600 font-medium">Most Common Mood</p>
            <p class="text-2xl font-bold text-green-800">
              {Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
                "None"}
            </p>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-sm text-yellow-600 font-medium">Unique Tags</p>
            <p class="text-2xl font-bold text-yellow-800">{allTags.length}</p>
          </div>
        </div>

        <!-- Tag Cloud -->
        {#if allTags.length > 0}
          <div class="mt-6">
            <h3 class="text-md font-medium mb-2">Popular Tags</h3>
            <div class="flex flex-wrap gap-2">
              {#each allTags as tag}
                <button
                  class="px-3 py-1 text-sm rounded-full transition-colors {selectedTag ===
                  tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}"
                  on:click={() =>
                    (selectedTag = selectedTag === tag ? "" : tag)}
                >
                  {tag} ({tagCounts[tag]})
                </button>
              {/each}
              {#if selectedTag}
                <button
                  class="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 hover:bg-red-200"
                  on:click={() => (selectedTag = "")}
                >
                  Clear filter
                </button>
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Journal Controls -->
    <div
      class="md:col-span-3 flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"
    >
      <div class="w-full sm:w-auto">
        <input
          type="text"
          placeholder="Search entries..."
          bind:value={searchTerm}
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          disabled={isLoading}
        />
      </div>
      <button
        on:click={() => (showNewEntryForm = !showNewEntryForm)}
        class="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
        disabled={isLoading}
      >
        {showNewEntryForm ? "Cancel" : "New Entry"}
      </button>
    </div>

    <!-- New Entry Form -->
    {#if showNewEntryForm && !isLoading}
      <div class="md:col-span-3 bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">New Journal Entry</h2>
        <form on:submit|preventDefault={addNewEntry} class="space-y-4">
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-1">Title</label
            >
            <input
              id="title"
              type="text"
              bind:value={newEntry.title}
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label
              for="content"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Content</label
            >
            <textarea
              id="content"
              bind:value={newEntry.content}
              required
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            ></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                for="mood"
                class="block text-sm font-medium text-gray-700 mb-1">Mood</label
              >
              <input
                id="mood"
                type="text"
                bind:value={newEntry.mood}
                placeholder="How are you feeling?"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label
                for="tags"
                class="block text-sm font-medium text-gray-700 mb-1"
                >Tags (comma separated)</label
              >
              <input
                id="tags"
                type="text"
                bind:value={newEntry.tags}
                placeholder="work, ideas, etc."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              on:click={resetNewEntryForm}
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    {/if}

    <!-- Journal Entries List -->
    <div class="md:col-span-3">
      <h2 class="text-xl font-semibold mb-4">
        Journal Entries
        {!isLoading && filteredEntries.length !== totalEntries
          ? `(${filteredEntries.length} of ${totalEntries})`
          : ""}
      </h2>

      {#if isLoading}
        <!-- Entries Shimmer Loading Effect -->
        <div class="space-y-4">
          {#each Array(4) as _, i}
            <div
              class="bg-white rounded-lg shadow overflow-hidden animate-pulse"
            >
              <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                  <div class="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div class="h-5 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div class="space-y-2">
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                  <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div class="flex flex-wrap gap-1 my-4">
                  {#each Array(3) as _, j}
                    <div class="h-5 bg-gray-200 rounded w-12"></div>
                  {/each}
                </div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          {/each}
        </div>
      {:else if error}
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <p class="text-red-500">Error loading entries: {error}</p>
          <button
            class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            on:click={() => {
              isLoading = true;
              error = null;
              // Retry loading
              onMount();
            }}
          >
            Retry
          </button>
        </div>
      {:else if filteredEntries.length === 0}
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <p class="text-gray-500">
            No entries found. {searchTerm || selectedTag
              ? "Try adjusting your filters."
              : "Create your first entry!"}
          </p>
        </div>
      {:else}
        <div class="space-y-4">
          {#each filteredEntries as entry (entry.id)}
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="p-6">
                <div class="flex justify-between items-start mb-2">
                  <h3 class="text-lg font-semibold text-gray-800">
                    {entry.title}
                  </h3>
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                  >
                    {entry.mood}
                  </span>
                </div>
                <p class="text-gray-600 mb-4">{entry.content}</p>

                {#if entry.tags && entry.tags.length > 0}
                  <div class="flex flex-wrap gap-1 mb-3">
                    {#each entry.tags as tag}
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 cursor-pointer hover:bg-gray-200"
                        on:click={() =>
                          (selectedTag = selectedTag === tag ? "" : tag)}
                      >
                        #{tag}
                      </span>
                    {/each}
                  </div>
                {/if}

                <div
                  class="flex justify-between items-center text-xs text-gray-500"
                >
                  <span>{formatDate(entry.createdAt)}</span>
                  {#if entry.isPublic}
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                    >
                      Public
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  /* Shimmer animation */
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
