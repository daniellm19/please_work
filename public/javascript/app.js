const BASE_URL = 'https://tunes-and-genres.herokuapp.com/public/html';

let tunes = [];
let genres = [];
let recording = [];
let isRecording = false;
let startTime = 0;

const keyMap = new Map();
keyMap.set('a', 'c4');
keyMap.set('s', 'd4');
keyMap.set('d', 'e4');
keyMap.set('f', 'f4');
keyMap.set('g', 'g4');
keyMap.set('h', 'a4');
keyMap.set('j', 'b4');
keyMap.set('k', 'c5');
keyMap.set('l', 'd5');
keyMap.set(';', 'e5');
keyMap.set('æ', 'e5');

keyMap.set('w', 'c#4');
keyMap.set('e', 'd#4');
keyMap.set('t', 'f#4');
keyMap.set('y', 'g#4');
keyMap.set('u', 'bb4');
keyMap.set('o', 'c#5');
keyMap.set('p', 'd#5');

function fetchAndPopulateTunes() {
    //Perform a GET request to the url
    axios.get(BASE_URL + "tunes")
        .then(function (response) {
            //When successful, print the received data
            console.log("Success: ", response.data);
            tunes = response.data;
            populateTuneSelector();
        })
        .catch(function (error) {
            //When unsuccessful, print the error.
            console.log(error);
        })
        .then(function () {
            // This code is always executed, independent of whether the request succeeds or fails.
        });
}

function fetchAndPopulateGenres() {
    //Perform a GET request to the url
    axios.get(BASE_URL + "genres")
        .then(function (response) {
            //When successful, print the received data
            genres = response.data;
            populateGenreSelector();
        })
        .catch(function (error) {
            //When unsuccessful, print the error.
            console.log(error);
        })
        .then(function () {
            // This code is always executed, independent of whether the request succeeds or fails.
        });
}

function createTune() {
    let recordName = document.getElementById("recordName").value;
    let genreId = genres[document.getElementById("genresDrop").value].id;

    //Perform a POST request to the url
    axios.post(BASE_URL + "genres/" + genreId + "/tunes", { name: recordName, content: recording})
        .then(function (response) {
            //When successful, print the received data
            console.log("Successfully written: ", response.data);
            fetchAndPopulateTunes();
        })
        .catch(function (error) {
            //When unsuccessful, print the error.
            console.log(error);
        })
        .then(function () {
            // This code is always executed, independent of whether the request succeeds or fails.
        });
}

function populateTuneSelector() {
    let selector = document.getElementById("tunesDrop");
    selector.innerHTML = "";

    for (let i=0;i<tunes.length;i++) {
        let currentOpt = document.createElement("option");
        currentOpt.value = i;
        currentOpt.textContent = tunes[i].name;
        selector.appendChild(currentOpt);
    }
}

function populateGenreSelector() {
    let selector = document.getElementById("genresDrop");
    selector.innerHTML = "";

    for (let i=0;i<genres.length;i++) {
        let currentOpt = document.createElement("option");
        currentOpt.value = i;
        currentOpt.textContent = genres[i].genreName;
        selector.appendChild(currentOpt);
    }
}

// const synth = new Tone.Synth().toDestination();

//Sounds cooler
// const chorus = new Tone.Chorus(4, 2.5, 0.5).toDestination().start();
const synth = new Tone.Sampler({
	urls: {
		"C4": "C4.mp3"
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();
// synth.connect(chorus);


document.getElementById("tunebtn").addEventListener("click", (e) => {
    tune = tunes[document.getElementById("tunesDrop").value];

    axios.get(BASE_URL + "genres/" + tune.genreId + "/tunes/" + tune.id)
    .then(function (response) {
        let now = Tone.now();

        for (let i=0; i<response.data.content.length;i++) {
            synth.triggerAttackRelease(response.data.content[i].note,response.data.content[i].duration,now + response.data.content[i].timing);
        }
    })
    .catch(function (error) {
        //When unsuccessful, print the error.
        console.log(error);
    })
});

document.getElementById("recordbtn").addEventListener("click", (e) => {
    let recordBtn = document.getElementById("recordbtn");
    let stopBtn = document.getElementById("stopbtn");
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    document.activeElement.blur();

    recording = [];
    startTime = Date.now();
    isRecording = true;
});

document.getElementById("stopbtn").addEventListener("click", (e) => {
    let recordBtn = document.getElementById("recordbtn");
    let stopBtn = document.getElementById("stopbtn");
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    
    startTime = 0;
    isRecording = false;

    if (recording.length > 0) {
        createTune();
    }
});

document.addEventListener("keydown", (e) => {
    if (keyMap.has(e.key) && document.activeElement.id !== "recordName") {
        let tone = keyMap.get(e.key);
        if (isRecording === true) {
            let seconds = Date.now() - startTime;
            recording.push({note: tone, duration: "8n", timing: seconds/1000});
        }
        let pianoKey = document.getElementById(tone);
        pianoKey.style.backgroundColor =  "rgb(152, 152, 152)";
        
        synth.triggerAttackRelease(tone, "8n");

        setTimeout(function (pianoKey) {
            pianoKey.style.backgroundColor =  "";
        }, 200, pianoKey);
    }
});

function pianoKeyClick (element) {
    let elementId = element.id;
    synth.triggerAttackRelease(elementId, "8n");
    if (isRecording === true) {
        let seconds = Date.now() - startTime;
        recording.push({note: elementId, duration: "8n", timing: seconds/1000});
    }
}

fetchAndPopulateTunes();
fetchAndPopulateGenres();