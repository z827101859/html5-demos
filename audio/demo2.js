const keys = document.getElementById('keys');
const canvas = document.getElementById('canvas');
const canvasCtx = canvas.getContext("2d");
let WIDTH = canvas.width;
let HEIGHT = canvas.height;
const voiceList = [
    [130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185, 196, 207.65, 220, 233.08, 246.94],
    [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392, 415.3, 440, 466.16, 493.88],
    [523.25, 554.37, 587.33, 622.25, 659.26, 698.46, 739.99, 783.99, 830.61, 880, 932.33, 987.77]
];
let html = [];
voiceList.forEach(item => {
    html.push(`<span class="area">`);
    item.forEach((em, index) => {
        if (index == 1 || index == 3 || index == 6 || index == 8 || index == 10) {
            html.push(`<a href="javascript:;" class="item-key black" frequency="${em}">${index + 1}</a>`);
        } else {
            html.push(`<a href="javascript:;" class="item-key" frequency="${em}">${index + 1}</a>`);
        }
    });
    html.push(`</span>`);
});
keys.innerHTML = html.join('');
document.addEventListener('mousedown', (event) => {
    let aElem = event.target;
    let val = aElem.getAttribute('frequency');
    let audioCtx = new AudioContext();
    // 创建周期波形
    let oscillator = audioCtx.createOscillator();
    let analyser = audioCtx.createAnalyser();
    let gainNode = audioCtx.createGain();
    oscillator.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    // 周期波形指定为正弦波
    oscillator.type = 'sine';
    // 设置周期波形频率
    oscillator.frequency.value = val;
    // 先把当前音量设为0
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    // 0.01秒时间内音量从刚刚的0变成1，线性变化
    gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
    // 开始播放
    oscillator.start(audioCtx.currentTime);
    audioCtx.playing = true;
    oscillator.onended = function () {
        window.cancelAnimationFrame(window.drawTimeVisual);
        audioCtx.close();
        audioCtx = null;
        oscillator = null;
        gainNode = null;
    };
    _drawSpectrum(analyser);
    aElem.onmouseup = (event) => {
        aElem.onmouseup = null;
        // 音量从刚刚的1变成0（指数变化），7秒后停止
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2);
        oscillator.stop(audioCtx.currentTime + 2);
    };
});
function _drawSpectrum(analyser) {
    drawTime(analyser);
}
function drawTime(analyser) {
    let bufferLength = analyser.fftSize;
    let dataArray2 = new Float32Array(bufferLength);
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
    let draw = function () {
        window.drawTimeVisual = requestAnimationFrame(draw);
        analyser.getFloatTimeDomainData(dataArray2);//波形数据
        // console.log(dataArray2);
        canvasCtx.fillStyle = 'rgb(200, 200, 200)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
        canvasCtx.beginPath();
        let sliceWidth = WIDTH / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            let y = (dataArray2[i] * (HEIGHT / 2)) + HEIGHT / 2;
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

function play(frequency, time) {
    return new Promise((resolve, reject) => {
        if (frequency) {
            console.log(frequency, time)
            let audioCtx = new AudioContext();
            let oscillator = audioCtx.createOscillator();
            let gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
            oscillator.start(audioCtx.currentTime);
            audioCtx.playing = true;
            setTimeout(() => {
                oscillator.onended = function () {
                    audioCtx.close();
                    audioCtx = null;
                    oscillator = null;
                    gainNode = null;
                };
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + pai / 1000 / 4);
                oscillator.stop(audioCtx.currentTime + pai / 1000 / 4);
                resolve();
            }, time);
        } else {
            setTimeout(() => {
                resolve();
            }, time);
        }
    })
}
let pai = 700;
let map = {
    'c3': {
        '1': 130.81,
        '1+': 138.59,
        '2': 146.83,
        '2+': 155.56,
        '3': 164.81,
        '4': 174.61,
        '4+': 185,
        '5': 196,
        '5+': 207.65,
        '6': 220,
        '6+': 233.08,
        '7': 246.94
    },
    'c4': {
        '1': 261.63,
        '1+': 277.18,
        '2': 293.66,
        '2+': 311.13,
        '3': 329.63,
        '4': 349.23,
        '4+': 369.99,
        '5': 392,
        '5+': 415.3,
        '6': 440,
        '6+': 466.16,
        '7': 493.88
    },
    'c5': {
        '1': 523.25,
        '1+': 554.37,
        '2': 587.33,
        '2+': 622.25,
        '3': 659.26,
        '4': 698.46,
        '4+': 739.99,
        '5': 783.99,
        '5+': 830.61,
        '6': 880,
        '6+': 932.33,
        '7': 987.77
    }
}
async function begin() {
    // 
    await play(0, pai);
    await play(0, pai);
    await play(0, pai / 2);
    await play(map['c4']['1'], pai / 2);
    await play(map['c4']['1'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    // 
    await play(map['c4']['3'], pai);
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['3'], pai / 2);
    await play(0, pai / 2);
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['1'], pai / 2);
    // 
    await play(map['c3']['7'], pai);
    await play(map['c4']['6'], pai / 2);
    await play(map['c4']['5'], pai / 2);
    await play(0, pai / 2);
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['6'], pai / 2);
    await play(map['c4']['7'], pai / 2);
    // 
    await play(map['c5']['1'], pai);
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['3'], pai / 2);
    await play(0, pai / 2);
    await play(map['c5']['1'], pai / 2);
    await play(map['c4']['7'], pai / 2);
    await play(map['c5']['1'], pai / 2);
    // 
    await play(map['c4']['7'], pai);
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['5'], pai / 2 + pai);
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['6'], pai / 2);
    // 
    await play(map['c5']['1'], pai / 2);
    await play(map['c4']['6'], pai);
    await play(map['c4']['6'], pai / 2);
    await play(0, pai / 2);
    await play(map['c4']['6'], pai / 2);
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['4'], pai / 2);
    // 
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['3'], pai);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['1'], pai);
    await play(map['c4']['1'], pai / 2);
    await play(map['c3']['6'], pai / 4);
    await play(map['c4']['1'], pai / 4);
    // 
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['1'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c3']['5'], pai);
    await play(map['c4']['1'], pai / 2);
    // 
    await play(map['c4']['2'], pai);
    await play(map['c4']['2'], pai);
    await play(0, pai / 2);
    await play(map['c4']['1'], pai / 2);
    await play(map['c4']['1'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    // 
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['3'], pai / 2);
    await play(0, pai / 2);
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['1'], pai / 2);
    // 
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['5'], pai / 2);
    await play(0, pai / 2);
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['6'], pai / 2);
    await play(map['c4']['7'], pai / 2);
    // 
    await play(map['c5']['1'], pai / 2);
    await play(map['c5']['1'], pai / 2);
    await play(map['c5']['1'], pai / 2);
    await play(map['c5']['1'], pai / 2);
    await play(map['c5']['1'], pai / 2);
    await play(map['c4']['7'], pai / 2);
    await play(map['c4']['6'], pai / 2);
    await play(map['c4']['7'], pai / 2);
    // 
    await play(map['c4']['6'], pai / 2);
    await play(map['c4']['3'], pai);
    await play(map['c4']['5'], pai / 2);
    await play(0, pai);
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['6'], pai / 2);
    // 
    await play(map['c5']['1'], pai / 2);
    await play(map['c4']['6'], pai);
    await play(map['c4']['6'], pai / 2);
    await play(0, pai / 2);
    await play(map['c4']['6'], pai / 2);
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['3'], pai / 2);
    // 
    await play(map['c4']['5'], pai / 2);
    await play(map['c4']['3'], pai);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['1'], pai);
    await play(0, pai / 2);
    await play(map['c3']['6'], pai / 4);
    await play(map['c4']['1'], pai / 4);
    // 
    await play(map['c4']['3'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['1'], pai / 2);
    await play(map['c4']['2'], pai / 2);
    await play(map['c4']['1'], pai);
    await play(map['c3']['6'], pai / 2);
    // 
    await play(map['c4']['1'], pai);
    await play(map['c4']['1'], pai);
}
// begin();