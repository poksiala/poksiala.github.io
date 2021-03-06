/* Made hastily for Ludum Dare 37. Please don't judge */

var W = 400;
var H = 500;

var UL = [0, 0];
var LL = [0, H];
var UR = [W, 0];
var LR = [W, H];

var M = 50;

var DUL = [M, M];
var DLL = [M, H-M];
var DUR = [W-M, M];
var DLR = [W-M, H-M];

var DW = W/2 - M;
var FPS = 30;
var TIME = 30*60*3;
var timeElem = document.getElementById("time");

var SPEED = 0;
var MAXPATIENCE = 2000;
var NUMFLOORS = 7;

var SCORE = 0;
var scoreElem = document.getElementById("score");

function newGame(c) {
    var newGame = {
        places: [[50, 490],[100, 470],[150, 490],[200, 470],[250, 490],[300, 470],[350, 490]],
        dudes: [],
        speed: 0,
        floorColor: "#4F1319",
        ceilingColor: "#BBBCBD",
        wallColor: "#4F4D4E",
        liftPos: -500 * (NUMFLOORS -1),
        ctx: c.getContext("2d"),
        update: function (){
            this.liftPos +=  SPEED * Math.abs(SPEED);
            this.doors.update();

            this.dudes.forEach(function (d) {
                d.update();
            });

            floors.forEach(function (f) {
                f.update();
            });

            TIME -= 1;
            if (TIME == 0) {
                clearInterval(this.loop);
                clearInterval(this.dudeLoop);
            }
            timeElem.innerHTML = Math.floor(TIME/30/60) + ":" + Math.floor(TIME/30 % 60);

        },

        doors: {
            color: "#636062",
            status: 1.00,
            moving: 0,
            speed: 0.05,
            areClosed: function () {
                return this.status == 1.0;
            },
            areOpen: function () {
                return this.status == 0.0;
            },
            draw: function(ctx) {

                var leftDoor = [DUL, [M + DW * this.status, M], [M + DW * this.status, H - M], DLL];
                var leftDoorHole = [[M+ 50 *this.status, M +20 ], [M+ 50 *this.status, H-M -20],
                    [M + (DW -50) * this.status, H - M -20],[M + (DW -50) * this.status, M+20]];

                var rightDoor =     [DUR, [W - M - DW * this.status, M], [W - M - DW * this.status, H - M], DLR];
                var rightDoorHole = [[W-M - 50 * this.status, M + 20], [W-M - 50*this.status, H-M -20],
                    [W - M + (50 - DW) * this.status, H - M -20], [W - M + (50 - DW) * this.status, M + 20]];

                drawHole(ctx, this.color, leftDoor, leftDoorHole);
                drawHole(ctx, this.color, rightDoor, rightDoorHole);
            },
            update: function () {
                this.status += this.moving * this.speed;
                if (this.status <= 0.0) {
                    this.status = 0.0;
                    this.status = 0;
                }
                if (this.status >= 1.0) {
                    this.status = 1.0;
                    this.moving = 0;
                }



            },
            buttonPressed: function () {
                if (this.areOpen()) {
                    this.moving = 1;
                } else if (this.areClosed() && Math.abs(SPEED) <= 1) {
                    this.moving = -1;
                } else {
                    this.moving = this.moving * (-1);
                }
            }
        },

        draw: function() {
            this.ctx.beginPath();
            this.ctx.rect(0, 0, W, H);
            this.ctx.fillStyle = "black";
            this.ctx.fill();
            var that = this;
            floors.forEach(function (f) {
                f.draw(that.ctx, that.liftPos)
            });
            this.doors.draw(this.ctx);
            this.drawWalls();
            for (var i = 0; i < this.dudes.length; i++) {
                this.dudes[i].setPos(this.places[i]);
                this.dudes[i].draw(that.ctx);
            }
        },

        drawWalls: function() {
            var ceiling = [UL, UR, DUR, DUL];
            var leftWall = [UL, DUL, DLL, LL];
            var floor = [LL, DLL, DLR, LR];
            var rightWall = [UR, DUR, DLR, LR];
            drawPoly(this.ctx, this.ceilingColor, ceiling);
            drawPoly(this.ctx, this.floorColor, floor);
            drawPoly(this.ctx, this.wallColor, rightWall);
            drawPoly(this.ctx, this.wallColor, leftWall);
        },

        changeSpeed: function(amount) {
            if ((this.doors.areClosed() && Math.abs(SPEED + amount) <= 3)
                                        || Math.abs(SPEED + amount) <= 1) {
                SPEED += amount;
            }
        },
        /** Insert dude into lift
         *
         * @param dude
         * @returns {boolean} whether or not insertion was successful
         */
        dudeIn: function (dude) {
            if (this.dudes.length <7) {
                dude.inLift = true;
                this.dudes.push(dude);
                return true;
            } else {
                return false;
            }
        },

        dudeOut: function (dude) {
            var i = this.dudes.indexOf(dude);
            this.dudes.splice(i, 1);
            SCORE +=Math.floor (((dude.patience/MAXPATIENCE)*10) * ((dude.patience/MAXPATIENCE)*10));
            scoreElem.innerHTML = SCORE;
            dude.isOut = true;
        },

        /** Get current floor
         *
         * @returns {number} floor number, else -1
         */
        floor: function () {
            if (Math.abs(this.liftPos % 500) <= 5) {
                return NUMFLOORS - Math.abs( Math.round(this.liftPos/500));
            } else {
                return -1
            }

        }
    };
    return newGame
}


window.addEventListener('keydown', function (event) {
        switch (event.keyCode) {

            case 38: // Up
                event.preventDefault();
                Game.changeSpeed(1);
                break;

            case 40: // Down
                event.preventDefault();
                Game.changeSpeed(-1);
                break;

            case 32: // Space
                event.preventDefault();
                Game.doors.buttonPressed();
                break;
        }
    }, false);

function newDude(pos, f) {
    var dude = {
        x: 0,
        y: 0,
        inLift: false,
        legW: 20,
        legH: 100,
        bodyH: 100,
        armH: 90,
        armW: 20,
        headR: 20,
        color: "black",
        wantsTo: f,
        patience: MAXPATIENCE,
        isOut: false,
        update: function () {
            if (!this.isOut && this.inLift) {
                if (this.wantsTo == Game.floor() && Game.doors.areOpen()) {
                    Game.dudeOut(this);
                }
                if (this.patience>1) {
                    this.patience = this.patience - 1;
                }
            }
            if (this.patience>1) {
                this.patience = this.patience - 1;
            }
        },
        draw: function (ctx, x, y) {
            x = typeof x !== 'undefined' ? x : this.x;
            y = typeof y !== 'undefined' ? y : this.y;
            // head
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.arc(x, y - this.legH - this.bodyH - this.headR/2, this.headR, 0, Math.PI * 2, true);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(x, y - this.legH - this.bodyH - this.headR/2, this.headR, 0, Math.PI * 2 - Math.PI *2 * (this.patience / MAXPATIENCE), true);
            ctx.strokeStyle = "white";
            ctx.stroke();


            ctx.font="20px Georgia";
            ctx.fillStyle = "white";
            ctx.fillText(this.wantsTo , x -5 ,y - this.legH - this.bodyH - this.headR/3);

            ctx.beginPath();
            // body
            ctx.moveTo(x, y - this.legH);
            ctx.lineTo(x, y - this.legH - this.bodyH);
            // arms
            ctx.moveTo(x - this.armW, y - this.legH);
            ctx.lineTo(x, y - this.legH - this.armH);
            ctx.lineTo(x + this.armW, y - this.legH);
            // legs
            ctx.moveTo(x - this.legW, y);
            ctx.lineTo(x, y - this.legH);
            ctx.lineTo(x + this.legW, y);
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.color;
            ctx.stroke();
        },
        setPos: function (cords) {
            this.x = cords[0];
            this.y = cords[1];
        }

    };
    dude.setPos(pos);
    return dude
}

function newFloor(color, pos) {
    return {
        dudes: [],
        color: color,
        h: 500,
        num: NUMFLOORS - pos,
        pos: pos * 500,

        update: function () {

            this.dudes.forEach(function (d) {
                d.update();
            });
            if (this.num == Game.floor()) {
                // lift is on the floor


                if (Game.doors.areOpen()) {
                    var insertedDudes = [];

                    for (var i = 0; i < this.dudes.length; i++) {
                        if (Game.dudeIn(this.dudes[i])) {
                            insertedDudes.push(this.dudes[i]);
                        }
                    }
                    for (var i = 0; i < insertedDudes.length; i++) {
                        var ii = this.dudes.indexOf(insertedDudes[i]);
                        this.dudes.splice(ii, 1);
                    }

                }
            }
        },

        draw: function (ctx, y) {
            // helping variables
            var top = y + this.pos;
            var bottom = y + this.pos + this.h;
            // floor backgorund
            drawPoly(ctx, "black", [[0, top], [W, top], [W, bottom], [0, bottom]]);
            drawPoly(ctx, this.color, [[0, top+50], [W, top+50], [W, bottom-50], [0, bottom-50]]);

            // dudes
            for (var i = this.dudes.length-1; i >= 0; i--) {
                this.dudes[i].draw(ctx, 250+ (10*i), bottom - 70 - (10*i))
            }

            // floor number
            ctx.font="30px Georgia";
            ctx.fillStyle = "white";
            ctx.fillText(this.num, W - 140, top + 100);
        },
        addDude: function () {
            var n = -1;
            while (n < 0 || n == this.num) {
                n = Math.floor((Math.random() * NUMFLOORS) + 1);
            }
            this.dudes.push(newDude([-100,-100], n));
        }
    };
}

var floors = [];

for (var n = 0; n < NUMFLOORS; n++) {
    floors.push(newFloor(getRandomColor(), n));
}
floors[floors.length - 1].addDude();


function drawPoly(ctx, fillStyle, corners) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    var x = corners[0][0];
    var y = corners[0][1];
    corners.shift();
    ctx.moveTo(x, y);
    for (var i = 0; i < corners.length; i++) {
        x = corners[i][0];
        y = corners[i][1];
        ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
}

function drawHole(ctx, color, plane, hole) {
    ctx.beginPath();

    var x = plane[0][0];
    var y = plane[0][1];
    plane.shift();
    ctx.moveTo(x, y);
    for (var i = 0; i < plane.length; i++) {
        x = plane[i][0];
        y = plane[i][1];
        ctx.lineTo(x, y);
    }
    ctx.closePath();

    var x = hole[0][0];
    var y = hole[0][1];
    hole.shift();
    ctx.moveTo(x, y);
    for (var i = 0; i < hole.length; i++) {
        x = hole[i][0];
        y = hole[i][1];
        ctx.lineTo(x, y);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}


window.onload = main();

function main() {
    Game = newGame(document.getElementById("canv"));
    Game.loop = setInterval(function() {
       // if (!GAMEOVER){
            Game.draw();
            Game.update();
        //}
    }, 1000/FPS);
    Game.dudeLoop = setInterval(spawnDude, 4000)
}

function getRandomFloor() {
    var n = Math.floor((Math.random() * NUMFLOORS));
    return floors[n];
}

function spawnDude() {
    var floor = getRandomFloor();
    floor.addDude()
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

