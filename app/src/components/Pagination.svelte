<script>
    import {pagestore} from "./pagestore.js";


    export let pageLimit = 0;

    function handlePageClick(targetPage) {
        pagestore.update(n => targetPage);
    }
</script>

<div class="w-full px-36 flex justify-end">
    {#if (pageLimit > 1)}
        {#each {length: pageLimit} as _, i}
            <button class="bg-zinc-800 px-3 py-2 mx-1 text-white rounded-lg" on:click={()=>{handlePageClick(i+1)}}>{i+1}</button>
        {/each}
    {/if}
</div>