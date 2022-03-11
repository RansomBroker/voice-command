<script>
    import {onMount} from "svelte";
    import auth from "./authconf";
    import App from "./App.svelte";

    onMount( ()=> {
        window.onload = function () {
            handleClientLoad();
        }
    })

    let isAuthorizeButton = false;
    let isSignOutButton = false;
    let isSignIn = null;

    function handleClientLoad() {
        gapi.load('client:auth2', initClient);
    }

    function initClient() {
        gapi.client.init({
            apiKey: auth.API_KEY,
            clientId: auth.CLIENT_ID,
            discoveryDocs: auth.DISCOVERY_DOCS,
            scope: auth.SCOPES
        }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            isSignIn = gapi.auth2.getAuthInstance().isSignedIn.get();
            console.log(isSignIn);
        }, function(error) {
            console.log(JSON.stringify(error, null, 2));
        });
    }

    function updateSigninStatus(isSignedIn) {
        if (isSignedIn) {
            isAuthorizeButton = false;
            isSignOutButton = true;
            console.log(isSignedIn);
        } else {
            isAuthorizeButton = true;
            isSignOutButton = false;
            console.log(isSignedIn);
        }

    }

    /*sign in*/
    function handleAuthClick(event) {
        gapi.auth2.getAuthInstance().signIn();
    }

    /*sign out*/
    function handleSignoutClick(event) {
        gapi.auth2.getAuthInstance().signOut();
    }

    /*anonim*/
    function handleAnonymClick() {
        isSignIn = true;
    }

</script>

<svelte:head>
    <title>Login Page</title>
</svelte:head>

{#if isSignIn}
    <App/>
{:else }
    <div class="container-2xl px-1.5 grid flex items-center justify-items-center h-screen m-0">
        {#if (isAuthorizeButton)}
            <div class="grid justify-items-center">
                <button class="px-5 py-5 bg-sky-500  shadow-lg rounded-lg text-white hover:bg-sky-700" on:click={handleAuthClick}>Sign In / Authorize to Google Access</button>
                <p class="mt-3">Atau masuk sebagai anonim (Data anda tidak akan disimpan)
                    <button class="underline text-blue-400" on:click={handleAnonymClick}>Masuk</button>
                </p>
            </div>
        {:else }
            <button class="px-5 py-5 bg-red-500  shadow-lg rounded-lg text-white hover:bg-red-700" on:click={handleSignoutClick}>Sign Out Authorize to Google Access</button>
        {/if}
    </div>
{/if}
