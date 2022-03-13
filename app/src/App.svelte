<script>
	import Greet from './components/Greet.svelte';
	import auth from "./authconf";

	let isClicked = false;
	let isFinal = false;
	let isAudioCancel = false;
	let isGreeting = false;
	let transcript = "";
	let interimResult = "";


	/*when button record input audio isclicked*/
	$: if (isClicked) {
		/*initiate speech */
		let SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
		let recognition = new SpeechRecognition;
		recognition.lang = "id-ID";
		recognition.interimResults = true;
		recognition.start();
		isAudioCancel = false

		/*jika dalam rentang waktu terntentu tidak menangkap suara apa pun maka akan di batalkan */
		let cancelAudioCapture = setTimeout(function () {
			recognition.abort();
			isClicked = !isClicked;
			isAudioCancel = !isAudioCancel;
			console.log("Audio not detect");
		}, 2500);

		/*Jika terdapat input berupa suara*/
		recognition.onresult = function (event)  {
			clearTimeout(cancelAudioCapture);
			interimResult =event.results[0][0].transcript;
			if (event.results[0].isFinal === true) {
				transcript = event.results[0][0].transcript;
				isFinal = !isFinal;
			}
		}
		/*jika transcript nama suadah final maka hentikan rekaman*/
		if (isFinal) {
			recognition.stop();
			clearTimeout(cancelAudioCapture);
			console.log("voice has stop")
			isAudioCancel = false
			appendValue(transcript);
			isClicked = !isClicked;
			isFinal = !isFinal;
			isGreeting = !isGreeting;
		}

		/*set timeout to get back voice*/
		if (isGreeting) {
			setTimeout(function (){
				isGreeting = false
			},3000)
		}
	}
	/*set temp result equal to '' */
	$: if (!isClicked) {
		interimResult = "";
		clearTimeout()
	}

	function handleStartClick() {
		isClicked = !isClicked;
	}

	/* Add Data */

	export function appendValue(name) {
		const d = new Date();
		let dateFormat = d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear();
		let timeFormat = d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
		let values = [dateFormat, name, timeFormat];
		let body = {
			"majorDimension": "ROWS",
			"values": [
				values
			]
		};
		gapi.client.sheets.spreadsheets.values.append({
			spreadsheetId: auth.SHEETS_ID,
			range: auth.SHEETS_RANGE,
			valueInputOption: "RAW",
			resource: body
		}).then((response) => {
			let result = response.result;
			console.log(`${result.updates.updatedCells} cells appended.`)
		});
	}

</script>

<svelte:head>
	<title>Voice Greeting Command</title>
</svelte:head>


{#if isGreeting}
	<div class="container-2xl px-1.5 grid flex items-center justify-items-center h-screen m-0">
		<Greet greet={transcript}/>
	</div>
{:else}
	<div class="container-2xl py-10 px-5 grid flex items-center justify-items-center h-screen m-0 animate-fade">
		{#if isClicked}
			<p class="text-center text-base sm:text-lg">Mendengarkan...</p>
			{#if interimResult.length > 0}
				<p class="text-center text-base sm:text-lg">{interimResult}</p>
			{/if}
		{:else }
			{#if isAudioCancel}
				<p class="capitalize text-center text-base sm:text-lg">Tidak Terdengar. Coba Lagi </p>
			{:else}
				<p class="capitalize text-center text-base sm:text-lg">Silahkan Sebutkan Nama Anda. Dengan <strong>Mengetuk Mikrofon</strong></p>
			{/if}
		{/if}
		<!--Mic Button -->
		<button  on:click={handleStartClick}  class="rounded-full {isClicked ? 'bg-[#60F5FF]':'shadow-lg md:shadow-xl xl:shadow-xl  bg-white'} {isAudioCancel ? 'bg-[#FF6060]' : ''} w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 z-50 relative p-0 m-0" disabled={isClicked} >
			{#if isClicked && !isAudioCancel}
				<div class="w-28 h-28 sm:w-32 sm:h-32 md:h-32 md:w-32 xl:h-36 xl:w-36 border-4 border-solid border-[#60F5FF] absolute top-0 left-0 rounded-full animate-pulsate "></div>
				<div class="w-32 h-32 sm:w-36 sm:h-36 md:h-36 md:w-36 xl:h-40 xl:w-40  translate-y-[-6%] translate-x-[-6%] sm:translate-y-[-5%] sm:translate-x-[-5%] md:translate-y-[-5%] md:translate-x-[-5%] xl:translate-y-[-5%] xl:translate-x-[-5%] rounded-full border-4 border-[#60F5FF]  border-solid  absolute left-0 top-0"></div>
				<i class="fa fa-microphone text-2xl text-white" aria-hidden="true"></i>
			{:else}
				{#if isAudioCancel}
					<i class="fa fa-microphone text-2xl text-white" aria-hidden="true"></i>
				{:else}
					<i class="fa fa-microphone text-2xl text-black" aria-hidden="true"></i>
				{/if}
			{/if}

		</button>
		<p class="capitalize text-center text-base sm:text-lg">{isClicked ? "": "ketuk mikrofon untuk mulai"}</p>
	</div>
{/if}


