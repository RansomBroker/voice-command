<script>
    import axios from "axios";

    const d = new Date();
    let isSubmitLoading = false;
    let successBanner = false;
    let failedBanner = false;
    let name = "";
    let homeCity = "";
    let gender = "";
    let files;
    let imageID;

    async function handleSubmit() {
        isSubmitLoading = true;

        let isUploadImageComplete = false;
        let isWriteToMainSheetComplete = false;
        let isWriteToSecondarySheetComplete = false;

        let formData = new FormData();
        formData.append("image", files[0]);

        /*first upload image then get image id*/
        await axios.post('/api/upload', formData, {
            headers: {
                'Content-Type' : 'multipart/form-data'
            }
        })
            .then(function (response) {
                if (response.status === 200){
                    imageID = response.data.data.id
                    isUploadImageComplete = true;
                    console.log("Success upload to drive get imageID "+imageID);
                }
            });

        /*after get image id add to main sheet*/
        await axios.post('/api/appendDataToMainSheet', {
            date: d.getDate()+"/"+d.getMonth()+"/"+d.getFullYear(),
            time: d.getHours()+":"+d.getMinutes()+":"+d.getSeconds(),
            name: name,
            gender: gender,
            homeCity: homeCity,
            imageLink: `https://drive.google.com/file/d/${imageID}/view?usp=sharing`,
        })
            .then(function (response) {
            if (response.status === 200){
                isWriteToMainSheetComplete = true;
                console.log("complete to create data at main sheet")
            }
        })

        if (isUploadImageComplete && isWriteToMainSheetComplete) {
            isSubmitLoading = false;
            successBanner = true;
            setTimeout(function () {
                window.location.replace("/");
            }, 1000);
        }else{
            clearTimeout();
            failedBanner = true;
        }

    }

</script>



<form on:submit|preventDefault={handleSubmit}>
    <div class="w-full shadow-2xl bg-white rounded mt-8 px-5 py-5">
        {#if (successBanner)}
            <div class="w-full bg-green-200 my-2 border border-green-800 rounded">
                <p class="text-green-800 text-center">Data Berhasil Ditambahkan</p>
            </div>
        {/if}
        {#if (failedBanner)}
            <div class="w-full bg-red-200 my-2 border border-red-800 rounded">
                <p class="text-red-800 text-center">Data Gagal Ditambahkan Hubungi Admin</p>
            </div>
        {/if}
        <div class="w-full grid justify-items-center grid-cols-1 lg:grid-cols-4 gap-4">
            <div class="w-full">
                <p>Nama <span class="text-sm text-red-500">*</span></p>
                <input type="text" class="border border-gray-500 rounded w-full px-3 py-1 required:border-red-500 disabled:bg-zinc-300 valid:border-gray-500 " placeholder="Nama" bind:value={name} disabled={isSubmitLoading}  required/>
            </div>
            <div class="w-full">
                <p>Asal Daerah <span class="text-sm text-red-500">*</span></p>
                <input type="text" class="border border-gray-500 rounded w-full px-3 py-1 required:border-red-500 disabled:bg-zinc-300 valid:border-gray-500" placeholder="Asal Daerah" bind:value={homeCity} required disabled={isSubmitLoading}/>
            </div>
            <div class="w-full">
                <p>Gender <span class="text-sm text-red-500">*</span></p>
                <label>
                    <input type="radio" class="disabled:bg-zinc-300 valid:border-gray-500" bind:group={gender} value={"Ikhwan"} required name="gender" disabled={isSubmitLoading}/>
                    Ikhwan
                </label>
                <label>
                    <input type="radio" class="disabled:bg-zinc-300 valid:border-gray-500" bind:group={gender} value={"Akhwat"} name="gender" disabled={isSubmitLoading}/>
                    Akhawat
                </label>
            </div>
            <div class="w-full">
                <p>Photo <span class="text-sm text-red-500">*</span></p>
                <input type="file" class="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:required:bg-red-500 file:bg-zinc-600 file:text-white hover:file:bg-zinc-500 file:disabled:bg-zinc-300 file:valid:bg-zinc-600" bind:files name="image" required disabled={isSubmitLoading}/>
            </div>
        </div>
        <div class="w-full grid justify-items-center grid-cols-1 mt-3">
            {#if (isSubmitLoading)}
                <button disabled type="button" class="text-white bg-zinc-600  focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800  w-full">
                    <svg  class="inline mr-3 w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
                    </svg>
                    Loading...
                </button>
            {:else }
                <button class="w-3/12 bg-zinc-800 hover:bg-zinc-600 rounded-md text-white px-1.5 py-1.5" type="submit">Submit</button>
            {/if}
        </div>
    </div>
</form>
