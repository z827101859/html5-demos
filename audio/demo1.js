const audioCtx = new AudioContext();
const load = document.getElementById('load');
const resume = document.getElementById('resume');
const pause = document.getElementById('pause');
const canvas = document.getElementById('canvas');
const canvas2 = document.getElementById('canvas2');
const canvasCtx = canvas.getContext("2d");
const canvasCtx2 = canvas2.getContext("2d");
const bufferSouce = audioCtx.createBufferSource();
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
bufferSouce.connect(analyser);
analyser.connect(audioCtx.destination);
bufferSouce.onended = function () {
    console.log('onended');
}
load.onclick = function () {
    const request = new XMLHttpRequest();
    request.open('GET', musicId.value, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        const audioData = request.response;
        audioCtx.decodeAudioData(audioData, function (buffer) {
            bufferSouce.buffer = buffer;
            bufferSouce.start(0);
            _drawSpectrum(analyser);
        }, function (e) { "Error with decoding audio data" + e.err });
    }
    request.send();
}
resume.onclick = function () {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        _drawSpectrum(analyser);
    }
}
pause.onclick = function () {
    if (audioCtx.state === 'running') {
        audioCtx.suspend();//会停止currentTime的前进
        window.cancelAnimationFrame(window.drawFrequencyVisual);
        window.cancelAnimationFrame(window.drawTimeVisual);
    }
}
function _drawSpectrum(analyser) {
    drawFrequency(analyser);
    drawTime(analyser);
}
function drawFrequency(analyser) {
    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;
    let bufferLengthAlt = analyser.frequencyBinCount;
    let dataArrayAlt = new Uint8Array(bufferLengthAlt);
    let dataArrayAlt2 = new Float32Array(bufferLengthAlt);
    let barWidth = Math.floor((WIDTH / bufferLengthAlt));
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    let drawAlt = function () {
        drawFrequencyVisual = requestAnimationFrame(drawAlt);
        // https://stackoverflow.com/questions/24083349/understanding-getbytetimedomaindata-and-getbytefrequencydata-in-web-audio
        // https://stackoverflow.com/questions/44546024/why-are-the-values-returned-from-getfloatfrequencydata-negative
        // https://stackoverflow.com/questions/14169317/interpreting-web-audio-api-fft-results
        analyser.getByteFrequencyData(dataArrayAlt);
        analyser.getFloatFrequencyData(dataArrayAlt2);//频率数据，返回的是db为单位的声音
        // console.log(dataArrayAlt);
        // console.log(dataArrayAlt2);
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        for (let i = 0, x = 0; i < bufferLengthAlt; i++) {
            // let barHeight = dataArrayAlt[i];
            let barHeight = dataArrayAlt2[i] + 140;
            canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            canvasCtx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
            x = x + barWidth;
        }
    };
    drawAlt();
}

function drawTime(analyser) {
    let WIDTH = canvas2.width;
    let HEIGHT = canvas2.height;
    let bufferLength = analyser.fftSize;
    let dataArray = new Uint8Array(bufferLength);
    let dataArray2 = new Float32Array(bufferLength);
    canvasCtx2.clearRect(0, 0, WIDTH, HEIGHT);
    let draw = function () {
        window.drawTimeVisual = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);
        analyser.getFloatTimeDomainData(dataArray2);//波形数据
        // console.log(dataArray);
        // console.log(dataArray2);
        canvasCtx2.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx2.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx2.lineWidth = 2;
        canvasCtx2.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx2.beginPath();
        let sliceWidth = WIDTH / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            // let y = (dataArray[i] / 128.0) * (HEIGHT / 2);
            let y = (dataArray2[i] * (HEIGHT / 2)) + HEIGHT / 2;
            if (i === 0) {
                canvasCtx2.moveTo(x, y);
            } else {
                canvasCtx2.lineTo(x, y);
            }
            x = x + sliceWidth;
        }
        canvasCtx2.lineTo(canvas.width, canvas.height / 2);
        canvasCtx2.stroke();
    };
    draw();
}