<!--
This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Lesser General Public License as published by the
Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License
for more details.

You should have received a copy of the GNU Lesser General Public License along
with this program. If not, see <https://www.gnu.org/licenses/>.
-->

<script lang="ts">
    import { createMutation } from "@tanstack/svelte-query";

    import { client } from "../gql/sdk";

    let { showRegister }: { showRegister: () => void} = $props();

    // Login requires a password and username to be set in the settings
    let username = $state("");
    let password = $state("");

    let loginError = $state("");

    const loginMutation = createMutation({
        mutationFn: client.Login,
    });

    const formSubmit = async (event: Event) => {
        event.preventDefault();
        try {
            await $loginMutation.mutateAsync({ username, password });
            // Redirect to the main page or show success message
            window.location.reload();
        } catch (error) {
            //@ts-ignore
            loginError = error?.response?.errors.map(e => e.message).join("\n") 
                ?? "Login failed. Please check your credentials.";
        }
    };
</script>

<div class="account-form">
    {#if loginError}
        <p class="account-error">{loginError}</p>
    {/if}

    <input type="text" bind:value={username} placeholder="Username" />
    <input type="password" bind:value={password} placeholder="Password" />
    <button onclick={formSubmit}>Login</button>

    <p class="register">
        <!-- svelte-ignore a11y_invalid_attribute -->
        Don't have an account? <a href="#" onclick={showRegister}>Register here</a>.
    </p>
</div>

<style>
    .register {
        font-size: 0.7rem;
        margin-top: -4px;
    }
</style>

