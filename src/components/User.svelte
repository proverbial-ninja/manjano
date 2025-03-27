<script>
  import { onMount } from "svelte";
  import { authClient } from "../lib/auth-client";
  import Swal from "sweetalert2";
  let name = "";
  onMount(async () => {
    const { data } = await authClient.getSession();

    if (!data) {
      window.location.href = "/";
    } else {
      name = data.user.name;
    }
  });

  function logout() {
    authClient.signOut();
    window.location.href = "/";
  }

  function editUsername() {
    // Implement this function to edit the user's name
    Swal.fire({
      title: "New Display Name ?",
      input: "text",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Update",
      showLoaderOnConfirm: true,
      preConfirm: async (uname) => {
        try {
          await authClient.updateUser({
            name: uname,
          });
          name = uname;
          return uname;
        } catch (error) {
          Swal.showValidationMessage(`
        Request failed: ${error}
      `);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: "success",
          title: "Done",
          text: "Display Name Updated",
        });
      }
    });
  }
</script>

<div class="dropdown">
  <div
    tabindex="0"
    role="button"
    class="btn m-1 btn-md rounded-2xl bg-white shadow-md"
    class:item={name ? "" : "animate-spin"}
  >
    {#if name}
      <i class="bi bi-person-fill"></i>
      {name}{:else}<span class="loading loading-spinner loading-md"></span>{/if}
  </div>
  {#if name}
    <ul
      tabindex="0"
      class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
    >
      <li><a onclick={editUsername}>Edit Username</a></li>
      <li><a onclick={logout}>Logout</a></li>
    </ul>
  {/if}
</div>
