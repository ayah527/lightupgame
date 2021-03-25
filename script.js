// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var clueHoldTime = 1000; //how long to hold each clue's light/sound
var pattern = [];
var progress = 0; 
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;  //must be between 0.0 and 1.0
var guessCounter = 0;
var mistakes = 0; 
var bomb = number();
var time = 50000;
var timer;

function genRandomPattern() { 
  for (let i = 0; i < 10; i ++) {
    var curr = number();
    if (bomb != curr) {
      pattern.push(curr);
    } else {
      i = i - 1;
    }
  }
}

function number() {
  return Math.floor(Math.random() * 5 + 1);
}

function startGame(){
    //initialize game variables
    progress = 0;
    gamePlaying = true;
    mistakes = 0;
    // swap the Start and Stop buttons
    document.getElementById("startBtn").classList.add("hidden");
    document.getElementById("stopBtn").classList.remove("hidden");
    startTimer();
    genRandomPattern();
    playClueSequence();
}

function stopGame(){
    //end game
    gamePlaying = false;
    pattern = [];
    endTimer();
    time = 50000; 
    // swap the Start and Stop buttons
    document.getElementById("startBtn").classList.remove("hidden");
    document.getElementById("stopBtn").classList.add("hidden");
    return;
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 522.7
}

function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}

function startTone(btn){
  if(!tonePlaying){
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    tonePlaying = true
  }
}
function stopTone(){
    g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
    tonePlaying = false
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}

function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}


function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
    clueHoldTime -= 100;
  }
}

function playClueSequence(){
  guessCounter = 0;
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
  }
}

function loseGame(){
  stopGame();
  alert("Game Over. You lost.");
  return;
}

function winGame(){
  stopGame();
  alert("Congratulations! You have won the game. WOOO");
  return;
}

function guess(btn){
  console.log("user guessed: " + btn);
  endTimer();
  
  if(!gamePlaying){
    return;
  }
  
  if (btn == bomb) { // if clicked on bomb
    loseGame();
  }
  
  if (time >= 2000) {
    time -= 2000;
  }
  
  if (pattern[progress] == btn) { // Is guess correct
    if (progress == guessCounter) { // Is turn over
      if (progress == pattern.length - 1) { // Is this the last turn
        winGame();
      } else {
        progress ++; 
        playClueSequence();
      }
    } else { // Check next guess.
      guessCounter ++;
    }
    
  } else { 
    // Guessed wrong — add to the strikes, or lose.
    mistakes ++; 
    
    if (mistakes == 3) { 
      loseGame();
    } else if (gamePlaying) {
      alert("That guess was incorrect.");
    }
  }
  startTimer();
}

function startTimer() {
  if (!gamePlaying) {
    return;
  }
  
  alert("You have " + time/1000 + " seconds to make your next guess");
  setTimeout(loseGame, time);
  if (time >= 10000) {
    timer = setInterval(function(){ alert("Ten seconds have passed."); }, 10000);
  }
}

function endTimer() {
  clearInterval(timer);
}