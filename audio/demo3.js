const keys = document.getElementById('keys');
const canvas = document.getElementById('canvas');
const canvasCtx = canvas.getContext("2d");
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;

let aElems = keys.querySelectorAll('a');
let bufferMap = new Map();
async function getBuffers() {
    return new Promise((resolve, reject) => {
        let promises = [];
        for (let aElem of aElems) {
            let id = aElem.getAttribute('id');
            let url = 'mp3/piano/' + id + '.mp3';
            let p = fetch(url).then((response) => {
                return response.arrayBuffer();
            }).then((buffer) => {
                bufferMap.set(id, new Uint8Array(buffer));
            });
            promises.push(p);
        }
        Promise.all(promises).then((reuslt) => {
            resolve(true);
        });
    });
}
document.addEventListener('mousedown', (event) => {
    let aElem = event.target;
    if (!aElem.classList.contains('item-key')) {
        return;
    }
    let id = aElem.getAttribute('id');
    let audioData = bufferMap.get(id);
    let audioCtx = new AudioContext();
    let bufferSouce = audioCtx.createBufferSource();
    let analyser = audioCtx.createAnalyser();
    let gainNode = audioCtx.createGain();
    bufferSouce.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    // gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    // gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);// the same as : gainNode.gain.setTargetAtTime(1, audioCtx.currentTime + 0.01, 0.01);
    let playing = true;
    bufferSouce.onended = function () {
        console.log('onended')
        playing = false;
        audioCtx.close();
        audioCtx = null;
        bufferSouce = null;
        gainNode = null;
    };
    audioCtx.decodeAudioData(new Int8Array(audioData).buffer, function (buffer) {
        bufferSouce.buffer = buffer;
        bufferSouce.start(audioCtx.currentTime);
        drawTimeGraph(analyser);
    }, function (error) {
        console.error(error);
        audioCtx.close();
    });
    aElem.onmouseup = (event) => {
        cancelAnimationFrame(window.drawTimeVisual);
        aElem.onmouseup = null;
        if (playing) {
            // gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
            // bufferSouce.stop(audioCtx.currentTime + 2);
        }
    };
});
function drawTimeGraph(analyser) {
    let bufferLength = analyser.fftSize;
    let dataArray = new Float32Array(bufferLength);
    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    let draw = function () {
        window.drawTimeVisual = requestAnimationFrame(draw);
        analyser.getFloatTimeDomainData(dataArray);//波形数据
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, canvasWidth, canvasHeight);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();
        let sliceWidth = canvasWidth / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            let y = (dataArray[i] * (canvasHeight / 2)) + canvasHeight / 2;
            if (i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x = x + sliceWidth;
        }
        canvasCtx.lineTo(canvas.width, canvas.height / 2);
        canvasCtx.stroke();
    };
    draw();
}

function play(target, time) {
    return new Promise((resolve, reject) => {
        if (target) {
            let mousedownEvent = new CustomEvent('mousedown', {
                detail: { time: time },
                bubbles: true,
                cancelable: true,
                view: window,
            });
            target.dispatchEvent(mousedownEvent);
            target.classList.add('active');
            setTimeout(() => {
                let mouseupEvent = new CustomEvent('mouseup', {
                    detail: { time: time },
                    bubbles: true,
                    cancelable: true,
                    view: window,
                });
                target.dispatchEvent(mouseupEvent);
                target.classList.remove('active');
                resolve();
            }, time);
        } else {
            setTimeout(() => {
                resolve();
            }, time);
        }
    })
}
function getById(id) {
    return document.getElementById(id);
}
let pai = 600;
async function begin() {
    await play(0, pai);
    await play(0, pai);
    await play(0, pai / 2);
    await play(getById('c4'), pai / 2);
    await play(getById('c4'), pai / 2);
    await play(getById('d4'), pai / 2);

    await play(getById('e4'), pai);
    await play(getById('e4'), pai / 2);
    await play(getById('e4'), pai / 2);
    await play(0, pai / 2);
    await play(getById('e4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('c4'), pai / 2);

    await play(getById('b3'), pai);
    await play(getById('a4'), pai / 2);
    await play(getById('g4'), pai / 2);
    await play(0, pai / 2);
    await play(getById('g4'), pai / 2);
    await play(getById('a4'), pai / 2);
    await play(getById('b4'), pai / 2);

    await play(getById('c5'), pai);
    await play(getById('e4'), pai / 2);
    await play(getById('e4'), pai / 2);
    await play(0, pai / 2);
    await play(getById('c5'), pai / 2);
    await play(getById('b4'), pai / 2);
    await play(getById('c5'), pai / 2);

    await play(getById('b4'), pai);
    await play(getById('e4'), pai / 2);
    await play(getById('g4'), pai * 3 / 2);
    await play(getById('g4'), pai / 2);
    await play(getById('a4'), pai / 2);

    await play(getById('c5'), pai / 2);
    await play(getById('a4'), pai);
    await play(getById('a4'), pai / 2);
    await play(0, pai / 2);
    await play(getById('a4'), pai / 2);
    await play(getById('g4'), pai / 2);
    await play(getById('f4'), pai / 2);

    await play(getById('g4'), pai / 2);
    await play(getById('e4'), pai);
    await play(getById('d4'), pai / 2);
    await play(getById('c4'), pai);
    await play(getById('c4'), pai / 2);
    await play(getById('a3'), pai / 4);
    await play(getById('c4'), pai / 4);

    await play(getById('e4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('c4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('g4'), pai);
    await play(getById('c4'), pai / 2);

    await play(getById('d4'), pai);
    await play(getById('d4'), pai);
    await play(0, pai / 2);
    await play(getById('c4'), pai / 2);
    await play(getById('c4'), pai / 2);
    await play(getById('d4'), pai / 2);

    await play(getById('e4'), pai / 2);
    await play(getById('e4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('e4'), pai / 2);
    await play(0, pai / 2);
    await play(getById('e4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('c4'), pai / 2);

    await play(getById('g4'), pai / 2);
    await play(getById('g4'), pai / 2);
    await play(getById('e4'), pai / 2);
    await play(getById('g4'), pai / 2);
    await play(0, pai / 2);
    await play(getById('g4'), pai / 2);
    await play(getById('a4'), pai / 2);
    await play(getById('b4'), pai / 2);

    await play(getById('c5'), pai / 2);
    await play(getById('c5'), pai / 2);
    await play(getById('c5'), pai / 2);
    await play(getById('c5'), pai / 2);
    await play(getById('c5'), pai / 2);
    await play(getById('b4'), pai / 2);
    await play(getById('a4'), pai / 2);
    await play(getById('b4'), pai / 2);

    await play(getById('a4'), pai / 2);
    await play(getById('e4'), pai / 2 * 2);
    await play(getById('g4'), pai / 2);
    await play(0, pai);
    await play(getById('g4'), pai / 2);
    await play(getById('a4'), pai / 2);

    await play(getById('c5'), pai / 2);
    await play(getById('a4'), pai / 2 * 2);
    await play(getById('a4'), pai / 2);
    await play(0, pai / 2);
    await play(getById('a4'), pai / 2);
    await play(getById('g4'), pai / 2);
    await play(getById('e4'), pai / 2)

    await play(getById('g4'), pai / 2);
    await play(getById('e4'), pai / 2 * 2);
    await play(getById('d4'), pai / 2);
    await play(getById('c4'), pai);
    await play(0, pai / 2);
    await play(getById('a3'), pai / 4);
    await play(getById('c4'), pai / 4);

    await play(getById('e4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('c4'), pai / 2);
    await play(getById('d4'), pai / 2);
    await play(getById('c4'), pai / 2 * 2);
    await play(getById('a3'), pai / 2);

    await play(getById('c4'), pai * 2);
    await play(0, pai);
    await play(0, pai);
}
getBuffers().then(()=>{
    begin();
});