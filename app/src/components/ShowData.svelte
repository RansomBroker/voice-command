<script>
    import {onMount} from "svelte";
    import {pagestore} from "./pagestore.js";
    import {updateStore} from "./updateStore.js";
    import Pagination from "./Pagination.svelte";
    import axios from "axios";

    let data = [];
    let pageLimit = null;
    let page = $pagestore;
    let isTableLoading = true;

    onMount(async () => {
        await axios.get('/api/getData', {
            params: {
                limit: 5,
                page: 1,
            }
        }).then(function (response) {
            if (response.statusText === "OK"){
                isTableLoading = false;
                data = response.data.result;
            }
        });
    });

    async function getPagination(page) {
        isTableLoading = true;
        await axios.get('/api/getData', {
            params: {
                limit: 5,
                page: page,
            }
        }).then(function (response) {
            isTableLoading = false;
            data = response.data.result;
            pageLimit = response.data.pageLimit;
        });
    }

    async function updateData(){
        axios.get('/api/getData', {
            params: {
                limit: 5,
                page: page
            }
        }).then(function (response) {
            data = response.data.result;
            pageLimit = response.data.pageLimit;
        });
        updateStore.update(n => false);
    }

    $: if (page > 0) {
        console.log($pagestore)
        getPagination($pagestore);
    }

    $: if ($updateStore){
        updateData();
    }

</script>

<table class="shadow-2xl rounded w-9/12 ">
    <thead>
        <tr class="border-b border-zinc-300">
            <th class="py-2 uppercase text-center text-sm text-zinc-700">Tanggal</th>
            <th class="py-2 uppercase text-center text-sm text-zinc-700">Jam</th>
            <th class="py-2 uppercase text-center text-sm text-zinc-700">Nama</th>
            <th class="py-2 uppercase text-center text-sm text-zinc-700">Jenis Kelamin</th>
            <th class="py-2 uppercase text-center text-sm text-zinc-700">Kota</th>
        </tr>
    </thead>
    <tbody>
    {#if (isTableLoading)}
        {#each {length: 6} as _}
            <tr class="animate-pulse">
                {#each {length: 5} as cell}
                    <td class="py-1 px-1"><div class={`bg-zinc-200 text-zinc-200 w-fit after:content-['skeleton_word'] rounded-lg`}></div></td>
                {/each}
            </tr>
        {/each}
    {:else}
        {#each data as row, i}
            <tr class={`${i % 2 === 0 ? "bg-zinc-300 hover:bg-zinc-200" : "hover:bg-zinc-200"}`}>
                {#each row as cell, ij}
                    <td class="py-1 text-center">{cell}</td>
                {/each}
            </tr>
        {/each}
    {/if}
    </tbody>
</table>
{#if (!isTableLoading)}
    <Pagination pageLimit={pageLimit}/>
{/if}
