'use strict';

const player0El = document.querySelector('.player--0');
const player1El = document.querySelector('.player--1');
// Selecting elements
//Notice that query Selector expects the # in front of the ID
const score0El = document.querySelector('#score--0');
//But getElementById does not require the # sign sing it is an ID
//we are specifically searching for
const score1El = document.getElementById('score--1'); //this is supposed to be faster when there are 1000's of elements to select
const current0El = document.getElementById('current--0');
const current1El = document.getElementById('current--1');
const diceEl = document.querySelector('.dice');
const btnNew = document.querySelector('.btn--new');
const btnRoll = document.querySelector('.btn--roll');
const btnHold = document.querySelector('.btn--hold');
let activePlayer = 0;
let currentScore = 0;
let playing = true;
let scores = [0, 0];

const resetGame = function () {
  document.querySelector(`.player--0`).classList.remove('player--winner');
  document.querySelector(`.player--1`).classList.remove('player--winner');
  document.querySelector(`.player--0`).classList.add('player--active');
  document.querySelector(`.player--1`).classList.remove('player--active');

  score0El.textContent = 0;
  score1El.textContent = 0;
  diceEl.classList.add('hidden');
  currentScore = 0;
  scores[0] = 0;
  scores[1] = 0;
  activePlayer = 0;
  playing = true;
  document.getElementById(`current--0`).textContent = 0;
  document.getElementById(`current--1`).textContent = 0;
};

resetGame();

const switchPlayer = function () {
  document.getElementById(`current--${activePlayer}`).textContent = 0;
  currentScore = 0;
  activePlayer = activePlayer === 0 ? 1 : 0;
  player0El.classList.toggle('player--active');
  player1El.classList.toggle('player--active');
};

resetGame();

console.log("gsap outside of event:" + gsap);

btnRoll.addEventListener('click', function () {
  if (playing) {
    const dice = Math.trunc(Math.random() * 6) + 1;
    console.log(dice);
console.log("gsap inside fo btnroll click event:" + gsap);
    // Start dice animation with GreenSock
    const diceAnimation = gsap.timeline({ repeat: -1 }); // Repeat animation indefinitely
    diceAnimation
      .to(diceEl, { // Animate dice element
        duration: 0.5,
        ease: 'power3.inOut', // Adjust easing for desired roll effect
        rotation: 360, // Rotate the dice
        filter: 'blur(2px)', // Add blur during animation
      })
      .to(diceEl, { // Update dice image after animation
        duration: 0.1,
        filter: 'none', // Remove blur
        src: `dice-${dice}.png`, // Set final dice face
      });

    // Stop animation after a short duration and show the dice
    setTimeout(() => {
      diceAnimation.pause(); // Pause the repeating animation
      diceEl.classList.remove('hidden');

      // Check for rolled 1 and switch player if needed
      if (dice !== 1) {
        currentScore += dice;
        document.getElementById(`current--${activePlayer}`).textContent = currentScore;
      } else {
        switchPlayer();
      }
    }, 1000); // Adjust delay as needed
  }
});


// btnRoll.addEventListener('click', function () {
//   if (playing) {
//     const dice = Math.trunc(Math.random() * 6) + 1;
//     console.log(dice);

//     // Start dice animation
//     let currentDiceFace = 1;
//     const animationInterval = setInterval(() => {
//       diceEl.style.filter = 'blur(2px)'; // Add blur during animation
//       diceEl.src = `dice-${currentDiceFace++}.png`;
//       if (currentDiceFace > 6) {
//         currentDiceFace = 1;
//       }
//     }, 100); // Change image every 100 milliseconds (adjust as needed)

//     // Stop animation after a short duration and display final face
//     setTimeout(() => {
//       clearInterval(animationInterval);
//       diceEl.style.filter = 'none'; // Remove blur after animation
//       diceEl.src = `dice-${dice}.png`; // Set final dice face

//       diceEl.classList.remove('hidden'); // Show the dice
      
//       // Check for rolled 1 and switch player if needed
//       if (dice !== 1) {
//         currentScore += dice;
//         document.getElementById(`current--${activePlayer}`).textContent = currentScore;
//       } else {
//         switchPlayer();
//       }
//     }, 1500); // Stop animation after 1.5 seconds (adjust as needed)
//   }
// });

//Roll dice functionality
// btnRoll.addEventListener('click', function () {
//   //generate random dice roll
//   if (playing) {
//     const dice = Math.trunc(Math.random() * 6) + 1;
//     console.log(dice);
//     //display dice
//     diceEl.classList.remove('hidden');
//     diceEl.src = `dice-${dice}.png`;
//     //check for rolled 1, if true switch to next player
//     if (dice !== 1) {
//       //add dice value to currentScore
//       currentScore += dice;
//       document.getElementById(`current--${activePlayer}`).textContent =
//         currentScore;
//     } else {
//       //switch to next player
//       switchPlayer();
//     }
//   }
// });

btnHold.addEventListener('click', function () {
  if (playing) {
    //add current score to actie player's score
    scores[activePlayer] += currentScore;
    document.getElementById(`score--${activePlayer}`).textContent =
      scores[activePlayer];
    //check if player's score is >- 100
    if (scores[activePlayer] >= 20) {
      diceEl.classList.add('hidden');
      playing = false;
      document
        .querySelector(`.player--${activePlayer}`)
        .classList.add('player--winner');
      document
        .querySelector(`.player--${activePlayer}`)
        .classList.add('player--active');
    } else {
      //switch to next player
      switchPlayer();
    }
  }
});

btnNew.addEventListener('click', function () {
  resetGame();
});
