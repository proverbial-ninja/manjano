<script>
  import { onMount } from "svelte";
  import { authClient } from "../lib/auth-client";
  const baseURL = import.meta.env.BASE_URL;
  let entriesList = {};

  onMount(() => {
    authClient.$fetch(baseURL + "/api/entries").then((response) => {
      entriesList = response.data;
    });
  });
</script>

<h1>Entries</h1>
{JSON.stringify(entriesList)}
