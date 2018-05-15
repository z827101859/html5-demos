async function getBufferListByUrls(urls) {
    return new Promise((resolve, reject) => {
        let promises = [];
        for (let url of urls) {
            promises.push(fetch(url).then((response) => {
                return response.arrayBuffer();
            }));
        }
        Promise.all(promises).then((reuslt) => {
            resolve(reuslt);
        });
    });
}
async function appenToVideo(video, mediaSource, buffers, index) {
    const mimeCodec = 'video/webm; codecs="vorbis,vp8"';
    let sourceBuffer = mediaSource.sourceBuffers[0];
    if (!sourceBuffer) {
        sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    }
    for (let mediaBuffer of buffers) {
        await new Promise((resolve) => {
            sourceBuffer.timestampOffset = 60 * (index);
            sourceBuffer.appendBuffer(mediaBuffer);
            sourceBuffer.onupdateend = function () {
                sourceBuffer.timestampOffset = 60 * (index + 1);
                resolve();
            };
        });
    }
    video.play()
    if (loadedIndexs.length === maxIndex) {
        console.log('endOfStream');
        mediaSource.endOfStream();
    }
}
async function loadVideo(video, mediaSource, urls, index) {
    let buffers = await getBufferListByUrls([urls[index]]);
    await appenToVideo(video, mediaSource, buffers, index);
}
function seek() {
    let i = Math.floor(myVideo.currentTime / 60);
    if (i < maxIndex && !loadedIndexs.includes(i)) {
        loadedIndexs.push(i);
        loadVideo(myVideo, myMediaSource, orginUrls, i);
    }
}
function beginPlay() {
    seek();
    myVideo.removeEventListener('play', beginPlay);
    myVideo.addEventListener('seeking', (event) => {
        console.log('seeking');
        seek();
    });
    myVideo.addEventListener('seeked', (event) => {
        console.log('seeked');
        seek();
    });
    myVideo.addEventListener('stalled', (event) => {
        console.log('stalled');;
        seek();
    });
    myVideo.addEventListener('waiting', (event) => {
        console.log('waiting');
        seek();
    });
    myVideo.addEventListener('ended', (event) => {
        console.log('ended');
        console.log(event);
    });
    
}
const orginUrls = [
    "/doc/webm/1.webm",
    "/doc/webm/2.webm",
    "/doc/webm/3.webm",
    "/doc/webm/4.webm",
    "/doc/webm/5.webm",
    "/doc/webm/6.webm",
    "/doc/webm/7.webm"
];
const loadedIndexs = [];
const maxIndex = 7;
const myVideo = document.getElementById("video");
const myMediaSource = new MediaSource();
video.src = URL.createObjectURL(myMediaSource);
myMediaSource.addEventListener("sourceopen", async function (event) {
    myMediaSource.duration = 420;
});
myVideo.addEventListener('play', beginPlay);

// myVideo.playbackRate = 2 //加速播放