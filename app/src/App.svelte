<script>
    import VoiceCommand from "./VoiceCommand.svelte";
    import ShowData from "./components/ShowData.svelte";
    import GuestBook from "./GuestBook.svelte";
</script>

<svelte:head>
    <title>Selamat Datang di Masjid AlMutaqin</title>
</svelte:head>

<div class="container-2xl py-10 px-5 grid flex items-center justify-items-center m-0 animate-fade">
    <div class="w-full grid flex items-center justify-items-center m-0 h-96">
        <VoiceCommand/>
    </div>
    <div class="w-full grid flex items-center justify-items-center">
        <ShowData/>
    </div>
    <div class="w-full my-10">
        <GuestBook/>
    </div>
</div>