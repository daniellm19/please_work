//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
let port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//Set Cors-related headers to prevent blocking of local requests
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//The following is an example of an array of two tunes.  Compared to assignment 2, I have shortened the content to make it readable
let tunes = [
    { id: '0', name: "Für Elise", genreId: '1', content: [{note: "E5", duration: "8n", timing: 0},{ note: "D#5", duration: "8n", timing: 0.25},{ note: "E5", duration: "8n", timing: 0.5},{ note: "D#5", duration: "8n", timing: 0.75},
    { note: "E5", duration: "8n", timing: 1}, { note: "B4", duration: "8n", timing: 1.25}, { note: "D5", duration: "8n", timing: 1.5}, { note: "C5", duration: "8n", timing: 1.75},
    { note: "A4", duration: "4n", timing: 2}] },

    {id: '1', name: "Bruh", genreId: '1', content: [{note: "E5", duration: "8n", timing:0}]},

    {id: '3', name: "Seven Nation Army", genreId: '0', 
    content: [{note: "E5", duration: "4n", timing: 0}, {note: "E5", duration: "8n", timing: 0.5}, {note: "G5", duration: "4n", timing: 0.75}, {note: "E5", duration: "8n", timing: 1.25}, {note: "E5", duration: "8n", timing: 1.75}, {note: "G5", duration: "4n", timing: 1.75}, {note: "F#5", duration: "4n", timing: 2.25}] }
];

let genres = [
    { id: '0', genreName: "Rock"},
    { id: '1', genreName: "Classic"},
    { id: '2', genreName: "Sussy"}
];

function contentValidation(content, res) { 
    for (let i = 0; i < content.length; i++) {
        if (!content[i].note || !content[i].duration || content[i].timing === undefined) {
            return res.status(400).send('Missing either note, timing, or duration attribute in content array object')
        }
    }
}

app.get('/', (req, res) => {
    var tunes_return = tunes.find(obj => {
        return obj.id === 0
      })
    res.send(tunes_return)
})

//Your endpoints go here

// 1
app.get('/api/v1/tunes', (req, res) => {
    if (!req.query.sortBy) {
        res.send(tunes)
    }

    else {
        var genre_return = genres.find(obj => {
            return obj.genreName === req.query.sortBy
          })

        if (!genre_return) res.send([req.query])

        let tunes_return_more= tunes.filter(x => x.genreId === genre_return.id);

        if (tunes_return_more.length === 0) res.send([req.query !== {}])

        const tune_return2 = [];

        for (let i = 0; i < tunes_return_more.length; i++) {
            tune_return2.push({
                id: tunes_return_more[i].id,
                name: tunes_return_more[i].name,
                genreId: tunes_return_more[i].genreId
              })
          }

        res.send(tune_return2)
    }
})

// 2
app.get('/api/v1/genres/:genreid/tunes/:tuneid', (req, res) => {
    const genre_return = genres.find(obj => {
        return obj.id === req.params.genreid
    })

    if (!genre_return) { 
        res.status(404).send('Genre with this ID does not exist'); 
        return;
    }

    const tunes2 = tunes.find(c => c.id === req.params.tuneid );//parseInt(req.params.id) );
    if (!tunes2) return res.status(404).send('The tune with the given ID was not found');// 404 client not found

    if (tunes2.genreId != genre_return.id) {
        res.status(404).send('This tune does not have this genre ID')
    }

    res.send(tunes2);
})

// 3
app.post('/api/v1/genres/:id/tunes', (req, res) => {
    const the_attributes = ["name","content"];

    const keys = Object.keys(req.body)
    if (!keys.every(key => the_attributes.includes(key))) {
        res.status(400).send('Invalid attribute'); 
    }

    const genre_return = genres.find(obj => {
        return obj.id === req.params.id
      })

    if (!genre_return) { 
        res.status(404).send('Genre with this ID does not exist'); 
        return;
    }

    else if (!req.body.name === true || Object.keys(req.body).length != 2) {
        res.status(400).send('Name is required and a content array with note, timing, and duration attributes')
    }

    else if (req.body.content.length === 0) {
        res.status(400).send('Content array is empty')
        return;
    }

    else if (req.body.content.length != 0) {
        contentValidation(req.body.content, res)

        const tune = {
            id: (parseInt(tunes[tunes.length- 1].id) + 1).toString(),
            name: req.body.name,
            genreId: req.params.id,
            content: req.body.content
        }

        tunes.push(tune)
        res.send(tune)
        return
    }
})

// 4
app.put('/api/v1/genres/:genreid/tunes/:tuneid', (req, res) => {
    const the_attributes = ["name", "genreId", "content"];

    const keys = Object.keys(req.body)
    if (!keys.every(key => the_attributes.includes(key))) {
        res.status(400).send('Invalid attribute'); 
    }

    const genre_return = genres.find(obj => {
        return obj.id === req.params.genreid
    })

    const tune_return = tunes.find(obj => {
        return obj.id === req.params.tuneid
    })

    if (!genre_return) { 
        res.status(404).send('Genre with this ID does not exist'); 
        return;
    }

    if (!tune_return) { 
        res.status(404).send('Tune with this ID does not exist'); 
        return;
    }

    let name = tune_return.name

    let genreId = req.params.genreid

    let content = tune_return.content

    if (req.body.name) {
        name = req.body.name
    }

    if (req.body.content) {
        contentValidation(req.body.content)
        content = req.body.content
    }

    const updated_tune = {
        id: req.params.tuneid,
        name: name,
        genreId: genreId,
        content: content
    }

    let index = tunes.findIndex(x => x.id === tune_return.id);

    tunes[index] = updated_tune;

    res.send(updated_tune)
})

// 2-1
app.get('/api/v1/genres', (req, res) => {
    res.send(genres)
})

// 2-2
app.post('/api/v1/genres', (req, res) => {

    if (!req.body.genreName || Object.keys(req.body).length != 1) {
        res.status(400).send('Request body should only include the genreName attribute')
    }

    const genre_return = genres.find(obj => {
        return obj.genreName === req.body.genreName
    })

    if (genre_return) { 
        res.status(404).send('Genre with this name already exists'); 
        return;
    }

    const updated_genre = {
        id: (parseInt(genres[genres.length - 1].id) + 1).toString(),
        genreName: req.body.genreName
    }

    genres.push(updated_genre)
    res.send(updated_genre)
})

// 2-3
app.delete('/api/v1/genres/:id', (req, res) => {
    const tune_return = tunes.find(obj => {
        return obj.genreId === req.params.id
    })

    if (tune_return) {
        res.status(400).send("Genre cannot be deleted due to tune/s having this genre")
    }

    const the_genre = genres.find(obj => {
        return obj.id === req.params.id
    })

    if (!the_genre) {
        res.status(404).send("Genre not found")
    }

    const index = genres.indexOf(the_genre)

    genres.splice(index, 1)

    res.send(the_genre)
})

app.use("*", (req, res) => {
    res.status(405).send("Operation not supported");
});

//Start the server
app.listen(port, () => {
    console.log('Tune app listening on port + ' + port);
});