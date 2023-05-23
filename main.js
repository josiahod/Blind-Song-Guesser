const audioPlayer = document.getElementById("audioPlayer");
const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");



playButton.addEventListener("click", function() {
  audioPlayer.play();
});

stopButton.addEventListener("click", function() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
});


function Instruction()
{
 alert("Enter the name of a musical artist. You will then be tasked with ranking 5 songs by that artist with a small caveat. You will have to rank the songs without knowing what song comes next!")
}


// Declarations for our song values
let song;
let playSong;


// Spotify Client Creds
const clientId = "7f9a15da72b547958b5316673e90ee9b";
const clientSecret = "5482680d0d9241b18a86a42e66c25d5d";

const _getToken = async () => {
    const result = await fetch(`https://accounts.spotify.com/api/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    // Access the data given to us by the fetch response (Promise)
    const data = await result.json();
    return data.access_token
}

// Function to get Song Info when image figure is clicked
/**
 * @param img_index
 * @param item_index
 * 
 * Function gets song from spotify using the image index of our gallery.
 * Then finds the correct item_index inside of the JSON response data from Spotify
 * which will produce a preview url that will be used to play song from soundtrack.
 */

//getTopTracks();
//moreTracks();
SearchArtists();


async function getArtist(searchTerm)
{
try
{
  var loading = document.getElementById('current-song');
  loading.innerHTML = "Loading..."
    var songList = [];
    let token = await _getToken();
    let headers = new Headers([
        ['Content-Type', 'application/json'],
        ['Accept', 'application/json'],
        ['Authorization', `Bearer ${token}`]
    ]);

    names = searchTerm;
    let request = new Request(`https://api.spotify.com/v1/search?type=artist&q=${names}&limit=8`,{
        method: 'GET',
        headers: headers
    });

    let result = await fetch(request);
    let response = await result.json();

    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
 

    if (searchTerm.length > 0) {
        const matchedResults = await getMatchedResults(searchTerm);
        if (matchedResults.length > 0) {
        matchedResults.forEach(function(result) {
            const resultLink = document.createElement('a');
            resultLink.textContent = result.name;
            resultLink.addEventListener('click', function() {
            searchInput.value = result.name;
            searchResults.style.display = 'none';
            getTopTracks(result.name, result.id);
            });
            if(searchResults.children.length < 9)
            searchResults.appendChild(resultLink);
        });
        searchResults.style.display = 'block';
        } else {
        searchResults.style.display = 'none';
        }
    } else {
        searchResults.style.display = 'none';
    }
   

     function getMatchedResults(searchTerm) {
        const data = response.artists.items;
      
        return data.filter(function(result) {
          return result.name.toLowerCase().includes(searchTerm);
        });
      }
}
catch(error)
{
    console.log("Error:", error);
}
}

async function SearchArtists()
{

    try
    {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        getArtist(searchTerm);
        searchResults.innerHTML = '';
        });

    }
    catch (error) 
      {
        console.error('Error:', error);
      }

}

async function getTopTracks(name, id)
{
    try
    {
        var songList = [];
        var dupList = [];
        let token = await _getToken();
        let headers = new Headers([
            ['Content-Type', 'application/json'],
            ['Accept', 'application/json'],
            ['Authorization', `Bearer ${token}`]
        ]);

        let request = new Request(`https://api.spotify.com/v1/search?type=track&q=${name}&artist:${name}`,{
            method: 'GET',
            headers: headers
        });

        let result = await fetch(request);
        let response = await result.json();
        for(var i = 0; i < response.tracks.items.length; i++)
        {
            if(response.tracks.items[i].artists[0].id == id) 
            {
            if(!dupList.includes(response.tracks.items[i].name))
            {
            songList.push([response.tracks.items[i].name, response.tracks.items[i].preview_url]);
            dupList.push(response.tracks.items[i].name);
            }
            }
        } 
        moreTracks(songList, response.tracks.next, 1 ,id, dupList);
    }
    catch (error) 
      {
        console.error('Error:', error);
      }
}

async function moreTracks(songList, url, status, id, dupList)
{
    try
    {
        let token = await _getToken();
        let headers = new Headers([
            ['Content-Type', 'application/json'],
            ['Accept', 'application/json'],
            ['Authorization', `Bearer ${token}`]
        ]);

        let request = new Request(url,{
            method: 'GET',
            headers: headers
        });

        let result = await fetch(request);
        let response = await result.json();
        for(var i = 0; i < response.tracks.items.length; i++)
        {
            if(response.tracks.items[i].artists[0].id == id) 
            {
                if(!dupList.includes(response.tracks.items[i].name))
                {
                songList.push([response.tracks.items[i].name, response.tracks.items[i].preview_url]);
                dupList.push(response.tracks.items[i].name);
                }
            }
        } 

     if(status < 5)
     moreTracks(songList, response.tracks.next, ++status, id, dupList);
     else 
     {
     loadSong(songList, []);
     }
    }


    catch(error)
    {
        console.log("Error:", error);
    }

}

var order = [];
var ranking = [];
async function loadSong(songList, clickedButtons)
{
try
{

    
    if ( clickedButtons.includes(1) && clickedButtons.includes(2) && clickedButtons.includes(3) && clickedButtons.includes(4) && clickedButtons.includes(5)) 
    {
      const finishedReset = document.getElementById('current-song');
      finishedReset.innerHTML = "Press Reset To Play Again";
      const changeReset = document.getElementById('reset');
      changeReset.style.border = "4px solid black";
        throw new Error("Finished");
    }

    // Get random index within the array length
    var randomIndex = Math.floor(Math.random() * songList.length);

    // Get random value from the array
    var randomValue = songList[randomIndex];

    var loopcount = 0;
    while(order.includes(randomValue[0]))
    {
      console.log("REPEAT SONG");
      randomIndex = Math.floor(Math.random() * songList.length);
      var randomValue = songList[randomIndex];
      if(loopcount > 5)
      throw new Error("INFINITE LOOP");

    }

    const Rank1 = document.getElementById('Rank1');
    const Rank2 = document.getElementById('Rank2');
    const Rank3 = document.getElementById('Rank3');
    const Rank4 = document.getElementById('Rank4');
    const Rank5 = document.getElementById('Rank5');


    const songTitle = document.getElementById('current-song');
    songTitle.textContent = randomValue[0];
    order.push(songTitle.textContent);
    const audioPlayer = document.getElementById("audioPlayer");
    audioPlayer.src = randomValue[1];
    audioPlayer.play();
    var selectBox = true;

    if (!(clickedButtons.includes(1)))
    {
        Rank1.addEventListener('click', function() {
        if(selectBox) 
        {       
            // Update the text content of the result div
            Rank1.textContent = songTitle.textContent;
            ranking[0] = Rank1.textContent
            clickedButtons.push(1);
            selectBox = false;
            Rank1.removeEventListener('click', arguments.callee);
            loadSong(songList, clickedButtons);

        }
        });
    }

    if (!clickedButtons.includes(2))
    {
      Rank2.addEventListener('click', function() {
        if(selectBox) 
        { 
            // Update the text content of the result div
            Rank2.textContent = songTitle.textContent;
            ranking[1] = Rank2.textContent
            clickedButtons.push(2);
            selectBox = false;
            Rank2.removeEventListener('click', arguments.callee);
            loadSong(songList, clickedButtons);
        }
      });
    }

    if (!clickedButtons.includes(3))
    {     
      Rank3.addEventListener('click', function() {
        if(selectBox) 
        { 
        // Update the text content of the result div
        Rank3.textContent = songTitle.textContent;
        ranking[2] = Rank3.textContent
        clickedButtons.push(3);
        selectBox = false;
        Rank3.removeEventListener('click', arguments.callee);
        loadSong(songList, clickedButtons);
        }
      });
    }

    if (!clickedButtons.includes(4))
    {
      Rank4.addEventListener('click', function() {
        if(selectBox) 
        { 
        // Update the text content of the result div
        Rank4.textContent = songTitle.textContent;
        ranking[3] = Rank4.textContent
        clickedButtons.push(4);
        selectBox = false;
        Rank4.removeEventListener('click', arguments.callee);
        loadSong(songList, clickedButtons);
        }
      });
    }

    if (!clickedButtons.includes(5))
    {
      Rank5.addEventListener('click', function() {
        if(selectBox) 
        { 
        // Update the text content of the result div
        Rank5.textContent = songTitle.textContent;
        ranking[4] = Rank5.textContent
        clickedButtons.push(5);
        selectBox = false;
        Rank5.removeEventListener('click', arguments.callee);
        loadSong(songList, clickedButtons);
        }
      }); 
    }




}
catch(error)
{
    console.log("Error:", error);
 
}

}

function reset()
{
  location.reload();
}




const openBtn = document.getElementById('open-btn');
const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('close-btn');
let table = null;

openBtn.addEventListener('click', function() {

order.unshift("Order");
ranking.unshift("Ranking");
var arrIdx = ["", 1, 2, 3, 4, 5];
var mergedArray = ( order.map((element, index) => [element, ranking[index]]));
console.log(mergedArray.length);
for(var j = 0; j < mergedArray.length; j++)
{
mergedArray[j].unshift(arrIdx[j]);
}
console.log(mergedArray);

  
  function printTable() {
    const tableContainer = document.getElementById('table-container');
    
    table = document.createElement('table');
    
    for (let i = 0; i < mergedArray.length; i++) {
      const row = document.createElement('tr');
      
      for (let j = 0; j < mergedArray[i].length; j++) {
        const cell = document.createElement(i === 0 ? 'th' : 'td');
        const cellData = document.createTextNode(mergedArray[i][j]);
        cell.appendChild(cellData);
        row.appendChild(cell);
      }
      
      table.appendChild(row);
    }
    
    tableContainer.appendChild(table);
  }
  
  printTable();

  overlay.style.display = 'block';
});

closeBtn.addEventListener('click', function() 
{
  mergedArray = null; 
  order.shift();
  ranking.shift();
 
    if (document.getElementById('table-container')) 
    {
        document.getElementById('table-container').removeChild(table);
      table = null;
    }
  overlay.style.display = 'none';
});








 