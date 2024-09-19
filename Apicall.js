// Function to retry the third API call if needed for waiting
function fetchWithRetry(apiUrl, fileName, delayTime = 0) {
    if (delayTime > 0) {
        console.log(`Waiting for ${delayTime / 1000} seconds...`);
    }

    setTimeout(() => {
        fetch(apiUrl, {
            headers: {
                'Origin': ' ',  // Specify your website's origin or a valid one
                'x-requested-with': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(thirdApiData => {
                if (thirdApiData.status === 403 && thirdApiData.msg.includes('wait')) {
                    const waitTime = thirdApiData.msg.match(/\d+/)[0];
                    console.log(`Third API response: ${thirdApiData.msg}. Retrying in ${waitTime} seconds...`);
                    fetchWithRetry(apiUrl, fileName, waitTime * 1000);  // Retry after required wait time
                } else if (thirdApiData && thirdApiData.result && thirdApiData.result.url) {
                    const downloadUrl = thirdApiData.result.url;
                    console.log(`Valid download URL for ${fileName}: ${downloadUrl}`);
                    
                    // Embed video using iframe
                    const iframeContainer = document.createElement('div');
                    iframeContainer.innerHTML = `
                        <iframe frameborder="0" allowfullscreen="" scrolling="no" allow="autoplay;fullscreen"
                        src="https://onelineplayer.com/player.html?autoplay=true&autopause=true&muted=true&loop=true&url=${downloadUrl}&poster=&time=true&progressBar=true&overlay=true&muteButton=true&fullscreenButton=true&style=light&quality=auto&playButton=true" 
                        style="height: 100%; width: 100%; aspect-ratio: 1280 / 720;"></iframe>`;
                    document.getElementById('video-list').appendChild(iframeContainer);
                } else {
                    console.error('Error: URL is not available in the third API response');
                }
            })
            .catch(error => {
                console.error('Error during third API call:', error);
            });
    }, delayTime);
}

// First API call to get all fileId and file names
fetch('https://api.streamtape.com/file/listfolder?login=0287aca2ef38b0d9a210&key=k2ljGZWXMKirrK')
    .then(response => response.json())  // Parse the JSON data
    .then(firstApiData => {
        const files = firstApiData.result.files;
        console.log("Files found:", files);

        files.forEach(file => {
            const fileId = file.linkid;
            const fileName = file.name;

            const fileListElement = document.getElementById('root');
            const fileItem = document.createElement('li');
            fileItem.textContent = `File Name: ${fileName}`;
            fileListElement.appendChild(fileItem);

            // Second API call to get download ticket
    fetch(`https://api.streamtape.com/file/dlticket?file=${fileId}&login=0287aca2ef38b0d9a210&key=k2ljGZWXMKirrK`)
     .then(response => response.json())
       .then(secondApiData => {
    const downloadTicket = secondApiData.result.ticket;
    
    console.log(`Download ticket for ${fileName}: ${downloadTicket}`);

    const thirdApiUrl = `https://cors-anywhere.herokuapp.com/https://api.streamtape.com/file/dl?file=${fileId}&ticket=${downloadTicket}`;
     
    // const thirdApiUrl = `http://themeninja.c0m.in/cors-proxy/proxy.php?url=https://api.streamtape.com/file/dl?file=${fileId}&ticket=${downloadTicket}`;
     
     console.log(`Third API URL for ${fileName}: ${thirdApiUrl}`);

   // Make the third API call and handle retry if necessary
   fetchWithRetry(thirdApiUrl, fileName);
                })
      .catch(error => {
   console.error(`Error during second API call for ${fileName}:`, error);
                });
        });
    })
    .catch(error => {
        console.error('Error during first API call:', error);
    });
                  
