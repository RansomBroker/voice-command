<script>
    import Greet from './components/Greet.svelte';
    import axios from "axios";
    import {updateStore} from "./components/updateStore.js";
    import {onMount} from "svelte";


    let initialState = true;
    let stepOne = false;
    let stepTwo = false;
    let stepThree = false;
    let stepFor = false;
    let isValidation = false;
    const d = new Date();
    let isClicked = false;
    let isFinal = false;
    let isUploadLoading = false;
    let isAudioCancel = false;
    let isGreeting = false;
    let interimResult = "";
    let isAudioStop = false;
    let name = "";
    let homeTown = "";
    let gender = "";
    let video;
    let canvas;

    /*when button record input audio isclicked*/
    $: if (isClicked) {
        //Step One
        if (stepOne) {
            console.log("Step One");
            let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
            let recognition = new SpeechRecognition;
            recognition.lang = "id-ID";
            recognition.interimResults = true;
            recognition.continuous = true;
           recognition.start();

           let cancelAudioCapture = setTimeout(function () {
               recognition.abort();
               isClicked = !isClicked;
               isAudioCancel = !isAudioCancel;
               console.log("Audio not detect");
           }, 2500);

           recognition.onresult = function (event)  {
               clearTimeout(cancelAudioCapture);
               interimResult =event.results[0][0].transcript;
               if (event.results[0].isFinal) {
                   name = event.results[0][0].transcript;
                   isFinal = !isFinal;
                   isAudioStop = !isAudioStop;
               }
           }
           if (isAudioStop) {
               clearTimeout(cancelAudioCapture);
               recognition.stop();
               isAudioStop = !isAudioStop;
           }
           if (isFinal) {
               isFinal = !isFinal;
               stepOne = !stepOne;
               stepTwo = !stepTwo;
               interimResult = "";
           }
        }
        if (stepTwo){
            console.log("Step Two");
            let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
            let recognition = new SpeechRecognition;
            recognition.lang = "id-ID";
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.start();

            let cancelAudioCapture = setTimeout(function () {
                recognition.abort();
                isClicked = !isClicked;
                isAudioCancel = !isAudioCancel;
                console.log("Audio not detect");
            }, 2500);

            recognition.onresult = function (event)  {
                clearTimeout(cancelAudioCapture);
                interimResult =event.results[0][0].transcript;
                if (event.results[0].isFinal) {
                    homeTown = event.results[0][0].transcript;
                    isFinal = !isFinal;
                    isAudioStop = !isAudioStop;
                }
            }
            if (isAudioStop) {
                clearTimeout(cancelAudioCapture);
                recognition.stop();
                isAudioStop = !isAudioStop;
            }
            if (isFinal) {
                isFinal = !isFinal;
                stepTwo = !stepTwo;
                stepThree = !stepThree;
                interimResult = "";
            }
        }
        if (stepThree) {
            console.log("Step Three");
            let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
            let recognition = new SpeechRecognition;
            recognition.lang = "id-ID";
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.start();

            let cancelAudioCapture = setTimeout(function () {
                recognition.abort();
                isClicked = !isClicked;
                isAudioCancel = !isAudioCancel;
                console.log("Audio not detect");
            }, 2500);

            recognition.onresult = function (event)  {
                clearTimeout(cancelAudioCapture);
                interimResult =event.results[0][0].transcript;
                if (event.results[0].isFinal) {
                    gender = event.results[0][0].transcript;
                    isFinal = !isFinal;
                    isAudioStop = !isAudioStop;
                }
            }

            if (isAudioStop) {
                clearTimeout(cancelAudioCapture);
                recognition.stop();
                isAudioStop = !isAudioStop;
            }
            if (isFinal) {
                isFinal = !isFinal;
                stepThree = !stepThree;
                isValidation = !isValidation;
                interimResult = "";
            }
        }
    }

    /*set temp result equal to '' */
    $: if (!isClicked) {
        interimResult = "";
        clearTimeout();
    }

    function handleStartInitial() {
        /*initial camera*/
        navigator.mediaDevices.getUserMedia({video:true, audio: false}).then(function (stream) {
            video.srcObject = stream;
            console.log(stream);
            video.play();
            stream.active;
        })

        isClicked = !isClicked;
        initialState = !initialState;
        stepOne = !stepOne;
        isAudioCancel = false;
    }
    function handleStartClick() {
        initialState = !initialState;
        stepOne = false;
        stepTwo = false;
        stepThree = false;
    }

    async function sendData() {
        isUploadLoading = !isUploadLoading;
        let imageID;
        let fileName = "photo-"+Date.now();
        let context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 512;
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        let data = canvas.toDataURL('image/png');
        let imageData = data.split(',')[1];

        await axios.post('/api/saveImage', {
            fileName : fileName,
            data: imageData,
        }).then(function (res){
            if (res.status === 200) {
                console.log("success Created")
            }
        });

        await axios.post('/api/uploadImagePath', {
            fileName: fileName
        }).then(function (res) {
            if (res.status === 200) {
                imageID = res.data.data.id;
                console.log(res);
                console.log("Success upload to drive get imageID "+imageID);
            }
        })

        await axios.post('/api/appendData', {
            date: d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear(),
            time: d.getHours()+":"+d.getMinutes()+":"+d.getSeconds(),
            name: name,
            gender: gender,
            homeCity: homeTown,
            imageLink: `https://drive.google.com/file/d/${imageID}/view?usp=sharing`,
        }).then(function (response) {
            if (response.status === 200){
                isUploadLoading = !isUploadLoading;
                isGreeting = !isGreeting;
                console.log("complete to create data at main sheet");
                if (isGreeting) {
                    setTimeout(function (){
                        isGreeting = false
                    },1000)
                }
            }
        })

        stepFor = !stepFor;
        console.log("step for"+stepFor);
        isClicked = !isClicked;
        initialState = !initialState;
        updateStore.update(n => true);
    }

    function repeat() {
        isValidation = !isValidation;
        isClicked = !isClicked;
        initialState = !initialState;
    }
    
    function valid() {
        isValidation = !isValidation;
        stepFor = !stepFor;
    }

</script>

{#if isGreeting}
    <Greet greet={name}/>
{:else}
    {#if (isUploadLoading)}
        <div class="grid justify-items-center animate-fade">
            <p>Sedang Menyimpan Data...</p>
            <svg  class="inline my-3 w-6/12 h-6/12 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
            </svg>
        </div>
    {:else }
        {#if (initialState)}
            <p class="capitalize text-center text-base sm:text-lg animate-fade">Silahkan tekan mic untuk mengisi form</p>
            <!--Mic Button -->
            <button  on:click={handleStartInitial}  class="rounded-full shadow-lg md:shadow-xl xl:shadow-xl  bg-white w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 z-50 relative z-10 p-0 m-0 animate-fade">
                <i class="fa fa-microphone text-2xl text-black" aria-hidden="true"></i>
            </button>
            <p class="capitalize text-center text-base sm:text-lg animate-fade">ketuk mikrofon untuk mulai</p>
        {/if}
        {#if (stepOne)}
            {#if isClicked}
                <p class="text-center text-base sm:text-lg">Siapa Nama Kamu ? </p>
                {#if interimResult.length > 0}
                    <p class="text-center text-base sm:text-lg">{interimResult}</p>
                {/if}
            {:else }
                {#if isAudioCancel}
                    <p class="capitalize text-center text-base sm:text-lg ">Tidak Terdengar. Coba Lagi 1</p>
                {/if}
            {/if}
            <!--Mic Button -->
            <button  on:click={handleStartClick}  class="rounded-full {isClicked ? 'bg-[#60F5FF]':'shadow-lg md:shadow-xl xl:shadow-xl  bg-white'} {isAudioCancel ? 'bg-[#FF6060]' : ''} w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 z-50 relative z-10 p-0 m-0 animate-fade" disabled={isClicked} >
                {#if isClicked && !isAudioCancel}
                    <div class="w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 border-4 border-solid border-[#60F5FF] absolute top-0 left-0 rounded-full animate-pulsate "></div>
                    <div class="w-32 h-32 sm:w-36 sm:h-36 md:h-36 md:w-36 xl:h-40 xl:w-40  translate-y-[-6%] translate-x-[-6%] sm:translate-y-[-5%] sm:translate-x-[-5%] md:translate-y-[-5%] md:translate-x-[-5%] xl:translate-y-[-5%] xl:translate-x-[-5%] rounded-full border-4 border-[#60F5FF]  border-solid  absolute left-0 top-0"></div>
                    <i class="fa fa-microphone text-2xl text-white" aria-hidden="true"></i>
                {:else}
                    {#if isAudioCancel}
                        <i class="fa fa-microphone text-2xl text-white " aria-hidden="true"></i>
                    {:else}
                        <i class="fa fa-microphone text-2xl text-black" aria-hidden="true"></i>
                    {/if}
                {/if}
            </button>
        {/if}
        {#if (stepTwo)}
            {#if isClicked}
                <p class="text-center text-base sm:text-lg">Asal Daerah Kamu ? </p>
                {#if interimResult.length > 0}
                    <p class="text-center text-base sm:text-lg">{interimResult}</p>
                {/if}
            {:else }
                {#if isAudioCancel}
                    <p class="capitalize text-center text-base sm:text-lg ">Tidak Terdengar. Coba Lagi 2</p>
                {/if}
            {/if}
            <!--Mic Button -->
            <button  on:click={handleStartClick}  class="rounded-full {isClicked ? 'bg-[#60F5FF]':'shadow-lg md:shadow-xl xl:shadow-xl  bg-white'} {isAudioCancel ? 'bg-[#FF6060]' : ''} w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 z-50 relative z-10 p-0 m-0 animate-fade" disabled={isClicked} >
                {#if isClicked && !isAudioCancel}
                    <div class="w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 border-4 border-solid border-[#60F5FF] absolute top-0 left-0 rounded-full animate-pulsate "></div>
                    <div class="w-32 h-32 sm:w-36 sm:h-36 md:h-36 md:w-36 xl:h-40 xl:w-40  translate-y-[-6%] translate-x-[-6%] sm:translate-y-[-5%] sm:translate-x-[-5%] md:translate-y-[-5%] md:translate-x-[-5%] xl:translate-y-[-5%] xl:translate-x-[-5%] rounded-full border-4 border-[#60F5FF]  border-solid  absolute left-0 top-0"></div>
                    <i class="fa fa-microphone text-2xl text-white" aria-hidden="true"></i>
                {:else}
                    {#if isAudioCancel}
                        <i class="fa fa-microphone text-2xl text-white " aria-hidden="true"></i>
                    {:else}
                        <i class="fa fa-microphone text-2xl text-black" aria-hidden="true"></i>
                    {/if}
                {/if}
            </button>
        {/if}
        {#if (stepThree)}
            {#if isClicked}
                <p class="text-center text-base sm:text-lg">Kamu adalah Ikhwan/Akhwat ? </p>
                {#if interimResult.length > 0}
                    <p class="text-center text-base sm:text-lg">{interimResult}</p>
                {/if}
            {:else }
                {#if isAudioCancel}
                    <p class="capitalize text-center text-base sm:text-lg ">Tidak Terdengar. Coba Lagi 3</p>
                {/if}
            {/if}
            <!--Mic Button -->
            <button  on:click={handleStartClick}  class="rounded-full {isClicked ? 'bg-[#60F5FF]':'shadow-lg md:shadow-xl xl:shadow-xl  bg-white'} {isAudioCancel ? 'bg-[#FF6060]' : ''} w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 z-50 relative z-10 p-0 m-0 animate-fade" disabled={isClicked} >
                {#if isClicked && !isAudioCancel}
                    <div class="w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 border-4 border-solid border-[#60F5FF] absolute top-0 left-0 rounded-full animate-pulsate "></div>
                    <div class="w-32 h-32 sm:w-36 sm:h-36 md:h-36 md:w-36 xl:h-40 xl:w-40  translate-y-[-6%] translate-x-[-6%] sm:translate-y-[-5%] sm:translate-x-[-5%] md:translate-y-[-5%] md:translate-x-[-5%] xl:translate-y-[-5%] xl:translate-x-[-5%] rounded-full border-4 border-[#60F5FF]  border-solid  absolute left-0 top-0"></div>
                    <i class="fa fa-microphone text-2xl text-white" aria-hidden="true"></i>
                {:else}
                    {#if isAudioCancel}
                        <i class="fa fa-microphone text-2xl text-white " aria-hidden="true"></i>
                    {:else}
                        <i class="fa fa-microphone text-2xl text-black" aria-hidden="true"></i>
                    {/if}
                {/if}
            </button>
        {/if}
        {#if (isValidation)}
            <div class="w-full sm:w-1/2 md:w-1/2  shadow rounded-lg">
                <h4 class="py-8 px-2 w-full text-center">Apakah data sudah benar ?</h4>
               <div class="px-4">
                   <table>
                       <tr>
                           <td>Nama</td>
                           <td class="px-3">:</td>
                           <td class="pl-3">{name}</td>
                       </tr>
                       <tr>
                           <td>Kota</td>
                           <td class="px-3">:</td>
                           <td class="pl-3">{homeTown}</td>
                       </tr>
                       <tr>
                           <td>Jenis Kelamin</td>
                           <td class="px-3">:</td>
                           <td class="pl-3">{gender}</td>
                       </tr>
                   </table>
               </div>
                <div class="w-full grid grid-cols-1 py-4 px-2">
                    <button on:click={repeat} class="w-full bg-red-500 rounded py-1 text-white"><i class="fa fa-repeat" aria-hidden="true"></i>
                         Ulang</button>
                    <button on:click={valid} class="mt-4 w-full bg-zinc-800 text-white py-1 rounded">Benar</button>
                </div>
            </div>
        {/if}
        <p class="{stepFor ? '':'hidden'} capitalize text-center text-base sm:text-lg">Ketuk Tombol Ambil Gambar Untuk Validasi Diri</p>
        <video class="{stepFor ? '':'hidden'} border rounded h-36" bind:this={video} >Video Stream Not Available</video>
        <button on:click={sendData} class="{stepFor ? '':'hidden'} w-3/12 bg-zinc-800 hover:bg-zinc-600 rounded-md text-white px-1.5 py-1.5">Ambil Gambar</button>
        <canvas class="hidden" bind:this={canvas}></canvas>
    {/if}
{/if}


