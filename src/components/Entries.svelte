<script>
  import { onMount } from "svelte";
  import { authClient } from "../lib/auth-client";
  const baseURL = import.meta.env.BASE_URL;
  let entriesList = {};
  // Form data
  let title = "";
  let content = "";
  let isPublic = false;
  let tags = [];
  let tagInput = "";

  // UI state
  let loading = false;
  let error = null;
  let success = false;

  // User ID (in a real app, you'd get this from your auth system)
  let userId = "";

  onMount(() => {
    // In a real application, you would get the userId from your auth system
    // This is just a placeholder
    authClient.getSession().then((session) => {
      console.log(session.data.user.id);
      userId = session.data.user.id;
    });
  });

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

    try {
      const response = await authClient.$fetch(baseURL + "/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Replace with your actual user ID
          id: crypto.randomUUID(),
          title,
          content,
          isPublic,
          tags: tags.length ? tags : null,
          metadata: {}, // Empty metadata object
          userId,
        }),
      });

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

<div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
  <h2 class="text-2xl font-bold mb-6 text-gray-800">
    Create New Journal Entry
  </h2>

  {#if success}
    <div class="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
      Journal entry created successfully!
    </div>
  {/if}

  {#if error}
    <div class="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
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
      <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
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
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={isPublic}
          class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <span class="ml-2 text-sm text-gray-700">Make this entry public</span>
      </label>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1"> Tags </label>
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
