const score = document.querySelector('.score');
const gameStart = document.querySelector(".gameStart");
const gameArea = document.querySelector(".gameArea");
const body = document.querySelector('body');
const end = document.querySelector('.end');

//Sounds
let drive = new Audio('./audio/drive.mp3');
let crash = new Audio('./audio/crash.mp3');
//Crash.pause();

//Images
let carsImg = ['./images/E1.png', './images/E2.jpg', './images/E3.jpg'];

//Object which init game play
let player = {
    speed: 5,
    score: 0
};

//Object which tracks the keyPresses
let keys = {
    ArrowUp: false,
    ArrowRight: false,
    ArrowDown: false,
    ArrowLeft: false
}

//Welcome window
gameStart.addEventListener('click', start);

//KeyPress Event
window.document.addEventListener('keydown', pressOn);
window.document.addEventListener('keyup', pressOff);

//Functions which tracks the keypress events
function pressOn(event) {
    keys[event.key] = true;
    //console.log(keys);
}

function pressOff(event) {
    keys[event.key] = false;
    //console.log(keys);
}

//Function which starts the game Play
function start() {
    //Reset the score to 0 every time the game starts
    player.score = 0;
    gameArea.innerHTML = "";
    //gameArea.classList.remove('hide');
    gameStart.classList.add('hide');
    player.start = true;

    for (let i = 0; i < 10; i++) { //RoadLines
        let div = document.createElement('div');
        div.classList.add("line");
        div.y = (i * 150);
        div.style.top = (i * 150) + 'px';
        gameArea.appendChild(div);
    }

    window.requestAnimationFrame(playGame);
    let car = document.createElement('div');
    car.setAttribute("class", "car");
    gameArea.appendChild(car);
    player.x = car.offsetLeft;
    player.y = car.offsetTop;
    //console.log(car.getBoundingClientRect());

    for (let i = 0; i < 5; i++) { //Enemy cars
        let enemy = document.createElement('div');
        enemy.classList.add("enemy");
        enemy.y = ((i + 1) * 600) * -1;
        enemy.style.top = enemy.y + "px";
        enemy.style.left = Math.floor(Math.random() * 150) + "px";
        enemy.style.backgroundColor = 'black'
        enemy.style.backgroundImage = `url(${carsImg[Math.floor(Math.random()*3)]})`;
        gameArea.appendChild(enemy);
    }
}

//Function which starts the game play
function playGame() {
    updateController(); // function for the controller
    //console.log("inplay");
    drive.play();
    let car = document.querySelector(".car");
    let road = gameArea.getBoundingClientRect();
    enemyCars(car);
    moveLines();
    score.style.display = "block";
    //console.log("x="+player.x);
    //console.log("y="+player.y);
    //console.log(road);

    if (player.start) {

        if (keys.ArrowUp && (player.y > (road.top = -250))) {
            player.y -= player.speed;
        }
        if (keys.ArrowDown && player.y < road.bottom) {
            player.y += player.speed;
        }
        if (keys.ArrowLeft && player.x > 0) {
            player.x -= player.speed;
        }
        if (keys.ArrowRight && player.x < (road.width - 50)) {
            player.x += player.speed;
        }
        car.style.left = player.x + 'px';
        car.style.top = player.y + 'px';
        player.score++;
        score.innerText = "Score : " + player.score;
        window.requestAnimationFrame(playGame);
    }
}

// Function which uses the controller
function updateController() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[0]; // Picks up the first connected gamepad

    if (!gamepad) return;

    // R2 for acceleration, L2 for brake
    if (gamepad.buttons[7].value > 0) { // R2 button for acceleration
        player.y -= player.speed * gamepad.buttons[7].value; // Speed ​​can be scaled with button pressure
    }
    if (gamepad.buttons[6].value > 0) { // L2 button for brake
        player.y += player.speed * gamepad.buttons[6].value;
    }

    // Left-right movement with the left joystick
    const leftStickX = gamepad.axes[0]; // Left joystick on the X-axis
    if (leftStickX < -0.1) { // Left
        player.x += player.speed * leftStickX;
    } else if (leftStickX > 0.1) { // Right
        player.x += player.speed * leftStickX;
    }

    // Apply the bounds to keep from going off the road
    const road = gameArea.getBoundingClientRect();
    const carRect = document.querySelector(".car").getBoundingClientRect();
    applyBoundaryLimits();
}

//Function which sets the limits on the road for the controller
function applyBoundaryLimits() {
    const road = gameArea.getBoundingClientRect();
    const car = document.querySelector(".car");
    const carRect = car.getBoundingClientRect();

    // Left and right limits
    if (player.x < 0) {
        player.x = 0;
    } else if (player.x > (road.width - carRect.width)) {
        player.x = road.width - carRect.width;
    }

    // Up and down limits
    if (player.y < 0) {
        player.y = 0;
    } else if (player.y > (road.height - carRect.height)) {
        player.y = road.height - carRect.height;
    }
}

//Function which moves lines
function moveLines() {
    let lines = document.querySelectorAll('.line');
    lines.forEach(function (item) {
        //console.log("y=" + item.y);
        if (item.y >= 750) {
            item.y -= 750;
        }
        item.y += player.speed;
        item.style.top = item.y + 'px';
    })
}

//Function which moves enemy cars
function enemyCars(car) {
    let ele = document.querySelectorAll(".enemy");
    ele.forEach(function (item) {
        if (isCollide(car, item)) {
            //console.log('hit');
            drive.pause();
            crash.play();
            endGame();
        }
    })
    ele.forEach(function (item) {
        if (item.y >= 1500) {
            item.y = -600;
            item.style.left = Math.floor(Math.random() * 300) + "px";
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    })
}

//Function which checks the collision detection 
function isCollide(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !(
        (aRect.top > bRect.bottom) ||
        (aRect.bottom < bRect.top) ||
        (aRect.left > bRect.right) ||
        (aRect.right < bRect.left)
    )
}

//Function which ends the game play and displays the score
function endGame() {
    player.start = false;
    endGameStyles();
}

//Function which displays the score and restarts the gameplay
function endGameStyles() {
  
    end.classList.remove('hide');
    end.classList.add('gameOver');
    end.innerHTML = " Game over! " + "<br>" + " Your score: " + player.score;
    crash.currentTime = 5;
    setTimeout(function () {
        drive.currentTime = 100;
       
        end.classList.add('hide');
        gameStart.classList.remove('hide');

    }, 1500);
}

//Function which return the random colors
function randomColors() {
    function color() {
        let c = Math.floor(Math.random() * 256);
        return c;
    }
    return "rgb(" + color() + "," + color() + "," + color() + ")";
}