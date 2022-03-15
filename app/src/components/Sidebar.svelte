<script>
    let showSidebar = false;

    function handleSidebarClick() {
        showSidebar = !showSidebar;
        console.log(showSidebar)
    }


</script>

<nav>
    {#if showSidebar}
        <button class="flex text-2xl text-zinc-800 items-center cursor-pointer fixed top-6 left-10 z-50" on:click={handleSidebarClick}>
            X
        </button>
    {:else }
        <button class="fixed rounded  z-30 flex items-center cursor-pointer left-10 top-6 border border-zinc-800 px-2 py-2" on:click={handleSidebarClick}>
            <i class="fa fa-bars" aria-hidden="true"></i>
        </button>
    {/if}
    <div class={`transition ease-in-out duration-700 top-0 left=0 w-64 bg-white shadow-2xl p-10 pl-10 text-white fixed h-full z-40  ${showSidebar ? "translate-x-0" : "translate-x-[-100%]"}`}>

        <h2 class="mt-2 text-2xl font-semibold text-zinc-800 text-center">Menu</h2>
    </div>

</nav>