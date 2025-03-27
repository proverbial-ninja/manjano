<script>
  import { onMount } from "svelte";
  import { authClient } from "../lib/auth-client";
  import Swal from "sweetalert2";
  import { toast } from "@zerodevx/svelte-toast";
  import User from "./User.svelte";

  const baseURL = import.meta.env.BASE_URL;
  // State variables
  let journalEntries = [];
  let isLoading = true;
  let error = null;
  let userId;
  let title = "";
  let entry_id = "";
  let content = "";
  let isPublic = false;
  let tags = [];
  let tagInput = "";
  let mode;

  // UI state
  let loading = false;

  let success = false;

  const openEditModal = (entry) => {
    title = entry.title;
    content = entry.content;
    tags = entry.tags;
    entry_id = entry.id;
    mode = "edit";
    document.getElementById("my_modal").showModal();
  };

  function openCreateModal() {
    title = "";
    content = "";
    tags = [];
    mode = "create";
    document.getElementById("my_modal").showModal();
  }

  // Fetch journal entries from API
  onMount(async () => {
    const { data } = await authClient.getSession();
    userId = data.user.id;

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
        id: crypto.randomUUID(),
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

  async function deleteEntry(entryId) {
    const { isConfirmed } = await Swal.fire({
      title: "Delete Entry?",
      text: "Are you sure you want to delete this journal entry?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (isConfirmed) {
      const response = await authClient.$fetch(
        `${baseURL}/api/entries/${entryId}`,
        { method: "DELETE" }
      );
      journalEntries = journalEntries.filter((entry) => entry.id !== entryId);

      toast.push("Entry Deleted");
    }
  }

  function addTag() {
    if (tagInput.trim()) {
      tags = [...tags, tagInput.trim()];
      tagInput = "";
    }
  }

  function removeTag(index) {
    tags = tags.filter((_, i) => i !== index);
  }

  async function handleSubmit() {
    if (!title || !content || !userId) {
      error = "Please fill in all required fields";
      return;
    }

    loading = true;
    error = null;
    success = false;
    let url;
    let eid;
    if (mode === "edit") {
      eid = entry_id;
      url = `${baseURL}/api/entries/${entry_id}`;
    } else {
      eid = crypto.randomUUID();
      url = `${baseURL}/api/entries`;
    }

    try {
      const response = await authClient.$fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Replace with your actual user ID
          id: eid,
          title,
          content,
          isPublic,
          tags: tags.length ? tags : null,
          metadata: {}, // Empty metadata object
          userId,
        }),
      });

      // Add to array after submit
      if (mode === "edit") {
        const existingEntryIndex = journalEntries.findIndex(
          (entry) => entry.id === eid
        );
        if (existingEntryIndex !== -1) {
          journalEntries[existingEntryIndex] = {
            id: eid,
            title,
            content,
            isPublic,
            tags,
            metadata: {},
            userId: userId,
            createdAt: journalEntries[existingEntryIndex].createdAt,
            updatedAt: new Date().toISOString(),
          };
        }
      } else {
        const newEntry = {
          id: eid,
          title,
          content,
          isPublic: false,
          tags,
          metadata: {},
          userId: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        journalEntries = [newEntry, ...journalEntries];
      }

      // Optimistically add to UI

      // Reset form on success
      title = "";
      content = "";
      isPublic = false;
      tags = [];
      success = true;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<main class="max-w-4xl mx-auto p-4">
  <header class="mb-8 justify-between items-center flex flex-col md:flex-row">
    <span class="flex flex-row items-center gap-4">
      <img src="/favicon.png" class="w-12 h-12" alt="" />
      <div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Manjano</h1>
        <p class="text-gray-600">My Journal , My Reflectios</p>
      </div>
    </span>
    <div><User /></div>
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
        class="btn btn-md bg-yellow-400 text-black hover:bg-yellow-400 rounded-2xl shadow-md"
        on:click={openCreateModal}>New Entry</button
      >
      <dialog id="my_modal" class="modal">
        <div class="modal-box">
          <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 class="text-2xl font-bold mb-6 text-gray-800">
              {mode === "edit"
                ? "Edit Journal Entry"
                : "Create New Journal Entry"}
            </h2>

            {#if success}
              <div class="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
                {mode === "edit"
                  ? "Journal entry updated successfully!"
                  : "Journal entry created successfully!"}
              </div>
            {/if}

            {#if error}
              <div class="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            {/if}

            <form on:submit|preventDefault={handleSubmit} class="space-y-6">
              <div>
                <label
                  for="title"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  bind:value={title}
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter a title for your journal entry"
                  required
                />
              </div>

              <div>
                <label
                  for="content"
                  class="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content *
                </label>
                <textarea
                  id="content"
                  bind:value={content}
                  rows="6"
                  class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Write your journal entry here..."
                  required
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div class="flex items-center">
                  <input
                    type="text"
                    bind:value={tagInput}
                    class="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    on:click={addTag}
                    class="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Add
                  </button>
                </div>

                {#if tags.length > 0}
                  <div class="mt-2 flex flex-wrap gap-2">
                    {#each tags as tag, index}
                      <div
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {tag}
                        <button
                          type="button"
                          on:click={() => removeTag(index)}
                          class="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:text-indigo-600 focus:outline-none"
                        >
                          <span class="sr-only">Remove tag</span>
                          &times;
                        </button>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  class="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {#if loading}
                    Saving...
                  {:else}
                    Save Journal Entry
                  {/if}
                </button>
              </div>
            </form>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>

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
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-2xl font-medium"
                    >
                      {entry.mood}
                    </span>{entry.title}
                  </h3>
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

                  <button
                    class="text-blue-500 btn hover:text-blue-700 btn btn-md rounded-2xl bg-white shadow-md"
                    on:click={() => openEditModal(entry)}
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="text-red-500 hover:text-red-700 btn btn-md rounded-2xl bg-white shadow-md"
                    on:click={() => deleteEntry(entry.id)}
                  >
                    <i class="bi bi-trash3"></i>
                  </button>
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
