<script>
  import { createEventDispatcher } from "svelte";
  import { authClient } from "../lib/auth-client";
  import { toast } from "@zerodevx/svelte-toast";
  // Create a dispatcher to emit events to parent components
  const dispatch = createEventDispatcher();

  // Form state
  let isLogin = true;
  let email = "";
  let password = "";
  let confirmPassword = "";
  let name = "";
  let isSubmitting = false;
  let error = "";

  // Form validation
  $: passwordsMatch = password === confirmPassword;
  $: isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $: isFormValid = isLogin
    ? email && password && isEmailValid
    : email &&
      password &&
      confirmPassword &&
      name &&
      passwordsMatch &&
      isEmailValid;

  // Toggle between login and registration
  function toggleMode() {
    isLogin = !isLogin;
    error = "";
  }

  // Handle form submission
  async function handleSubmit() {
    error = "";
    isSubmitting = true;

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Dispatch the appropriate event with form data
      if (isLogin) {
        const { data, error } = await authClient.signIn.email(
          {
            email,
            password,
            callbackURL: "/journal",
            rememberMe: true,
          },
          {
            onError: (ctx) => {
              this.error = ctx.error.message;
              // display the error message
              toast.push(ctx.error.message, {
                theme: {
                  "--toastColor": "white",
                  "--toastBackground": "rgba(255,0,0,0.9)",
                  "--toastBarBackground": "red",
                },
              });
            },
          }
        );
      } else {
        const { data, error } = await authClient.signUp.email(
          {
            name,
            email,
            password,
            callbackURL: "/journal",
            rememberMe: true,
          },
          {
            onRequest: (ctx) => {
              //show loading
            },
            onSuccess: (ctx) => {
              //redirect to the dashboard or sign in page
              toast.push("Registration succesful!", {
                theme: {
                  "--toastColor": "mintcream",
                  "--toastBackground": "rgba(72,187,120,0.9)",
                  "--toastBarBackground": "#2F855A",
                },
              });
            },
            onError: (ctx) => {
              this.error = ctx.error.message;
              // display the error message
              toast.push(ctx.error.message, {
                theme: {
                  "--toastColor": "white",
                  "--toastBackground": "rgba(255,0,0,0.9)",
                  "--toastBarBackground": "red",
                },
              });
            },
          }
        );
      }

      // Reset form after successful submission
      if (!isLogin) {
        email = "";
        password = "";
        confirmPassword = "";
        name = "";
        isLogin = true;
      }
    } catch (err) {
      error = "An error occurred. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
  <!-- Logo -->
  <div class="flex justify-center mb-8">
    <div
      class="w-64 h-64 bg-gradient-to-br from-purple-600 to-blue-500 mt-12 rounded-full flex items-center justify-center shadow-md"
    >
      <img src="/logo.svg" alt="" />
    </div>
  </div>

  <!-- Form -->
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    {#if !isLogin}
      <!-- Name field (only for registration) -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1"
          >Full Name</label
        >
        <input
          id="name"
          type="text"
          bind:value={name}
          placeholder="John Doe"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required={!isLogin}
        />
      </div>
    {/if}

    <!-- Email field -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1"
        >Email</label
      >
      <input
        id="email"
        type="email"
        bind:value={email}
        placeholder="you@example.com"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />
      {#if email && !isEmailValid}
        <p class="mt-1 text-sm text-red-600">
          Please enter a valid email address
        </p>
      {/if}
    </div>

    <!-- Password field -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1"
        >Password</label
      >
      <input
        id="password"
        type="password"
        bind:value={password}
        placeholder="••••••••"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
      />
    </div>

    {#if !isLogin}
      <!-- Confirm Password field (only for registration) -->
      <div>
        <label
          for="confirmPassword"
          class="block text-sm font-medium text-gray-700 mb-1"
          >Confirm Password</label
        >
        <input
          id="confirmPassword"
          type="password"
          bind:value={confirmPassword}
          placeholder="••••••••"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          required={!isLogin}
        />
        {#if confirmPassword && !passwordsMatch}
          <p class="mt-1 text-sm text-red-600">Passwords do not match</p>
        {/if}
      </div>
    {/if}

    <!-- Error message -->
    {#if error}
      <div class="p-2 bg-red-100 text-red-700 rounded-md text-sm">
        {error}
      </div>
    {/if}

    <!-- Submit button -->
    <button
      type="submit"
      class="w-full py-2 px-4 bg-yellow-500 disabled:bg-gray-400 hover:bg-yellow-700 text-white font-semibold rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      disabled={!isFormValid || isSubmitting}
    >
      {#if isSubmitting}
        <span class="inline-block animate-pulse">Processing...</span>
      {:else}
        {isLogin ? "Sign In" : "Create Account"}
      {/if}
    </button>

    <!-- Toggle between login and registration -->
    <div class="text-center mt-4">
      <button
        type="button"
        on:click={toggleMode}
        class="text-sm text-purple-600 hover:text-purple-800 font-medium focus:outline-none"
      >
        {isLogin
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  </form>
</div>
