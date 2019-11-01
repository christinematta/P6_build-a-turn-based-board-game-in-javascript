var Position = {
    initPosition: function (x, y) {
        this.x = x;
        this.y = y;
    },
};

var Player = {
    initPlayer: function (id, name, position) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.health = 100; // starts with health 100

        this.weapon = Object.create(Weapon);
        this.weapon.initWeapon("knife", 10, this.position); //starts with weapon knife

        console.log("creating player id " + this.id + "at position x:" + this.position.x + " y: " + this.position.y + " holding " + this.weapon.name);
    },
    draw: function () {
        return "player-" + this.id;
    },
    type: function () {
        return "player";
    },
    canTake: function () {
        return false;
    },
    moveUp: function () {
        console.log("moving player with id" + this.id + " up");
        this.position.x -= 1;
    },
    moveDown: function () {
        console.log("moving player with id " + this.id + " down");
        this.position.x += 1;
    },
    moveLeft: function () {
        console.log("moving player with id " + this.id + " left");
        this.position.y -= 1
    },
    moveRight: function () {
        console.log("moving player with id " + this.id + " right");
        this.position.y += 1
    },
    takeObject: function (object) {
        if (object != null) {
            console.log("taking object" + object.type());
            if (object.type() == 'life') {
                this.updateHealth(object);
            } else if (object.type() == 'weapon') {
                this.updateWeapon(object);
            }
        }
    },
    updateHealth: function (life) {
        this.health += life.value;
        updatePlayerHealth(this); ///////////////
    },
    updateWeapon: function (weapon) {
        console.log("player id " + this.id + " got weapon " + weapon.name);
        this.weapon = weapon;
        updatePlayerWeapon(this);
    },

    attack: function (weapon) {
        this.health -= weapon.getDamage(); // this.health = this.health - weapon.getDamage()
        if (this.health <= 0) {
            this.health = 0;
        } 
    },
    defend: function (weapon) {
        this.health -= weapon.getDamage() / 2;
        if (this.health <= 0) {
            this.health = 0;
        }
    },

};

var Obstacle = {
    initObstacle: function (position) {
        this.position = position;
        this.name = "obstacle";
    },
    draw: function () {
        return "obstacle";
    },
    type: function () {
        return "obstacle";
    },
    canTake: function () {
        return false;
    }
};

var Weapon = {
    initWeapon: function (name, damage, position) {
        this.name = name;
        this.damage = damage;
        this.position = position;

    },
    draw: function () {
        return this.name;
    },
    drawInfo: function () {
        return this.name + "-info";
    },
    type: function () {
        return "weapon";
    },
    getDamage: function () {
        return this.damage;
    },
    canTake: function () {
        return true;
    }
};

var Life = {
    initLife: function (position) {

        this.value = 10;
        this.position = position;

    },
    draw: function () {
        return "life";
    },
    type: function () {
        return "life";
    },
    canTake: function () {
        return true;
    }

};

var GameTurn = {
    initGameTurn: function () {
        this.turnCount = 0;
        this.moveDirection = Object.create(MoveDirection);
    },
    getRandomTurn: function (players) {
        var startTurn = Math.floor(Math.random() * players.length); // random nomber 0 or 1 
        this.lastTurn = players[startTurn].id; // return 1 or 2 , 
        $('#player-' + this.lastTurn + '-turn').text("your turn").show();
        this.moveDirection.initMoveDirection(this.lastTurn);
        return this.lastTurn;
    },
    getTurn: function (players, direction) {

        //assuming 2 players only 
        if (this.turnCount == 3) { //toggel after 3 times
            this.turnCount = 0; //reset number of steps for the new player

            // pass the turn to the other player [condition ? exprT : exprF ]
            players[0].id == this.lastTurn ? this.lastTurn = players[1].id : this.lastTurn = players[0].id;
        }
        if (!this.moveDirection.canMove(this.lastTurn, direction)) {
            return null;
        }
        this.turnCount++;
        return this.lastTurn;
    },
    getRemainingTurn: function () {
        return 3 - this.turnCount;
    },
    display: function (players) {
        // check for the next round 
        if (this.turnCount == 3) { //condition ? exprT : exprF 
            var nextTurn = this.lastTurn == players[1].id ? players[0].id : players[1].id;

            $('#player-' + nextTurn + '-turn').text("your turn").show();
            $('#player-' + this.lastTurn + '-turn').hide();

        } else {
            $('#player-' + this.lastTurn + '-turn').text("your turn").show();
        }
    },
    cancelMove: function () { // in case of obstacle or invalid direction
        this.turnCount--;
    }
};

var MoveDirection = {
    initMoveDirection: function (playerId) {
        this.lastPlayer = playerId;
        this.direction = null;
    },
    canMove: function (playerId, direction) {
        if (playerId != this.lastPlayer) { //
            this.lastPlayer = playerId;
            this.direction = direction;
            return true;
        }
        if (this.direction == null) {
            this.direction = direction;
            return true;
        }
        if (direction == 'right' || direction == 'left') {
            return this.direction == 'right' || this.direction == 'left';
        }
        if (direction == 'up' || direction == 'down') {
            return this.direction == 'up' || this.direction == 'down';
        }
    }
};

var Map = {
    initMap: function (lenght) {
        this.length = lenght;
        this.grid = new Array(lenght);
        for (var i = 0; i < lenght; i++) {
            this.grid[i] = new Array(lenght);
        }

        // Adding Objects to the grid
        this.initPlayers();
        this.initWeapons();
        this.initLifes();
        this.initObstacles();
    },

    initPlayers: function () {
        this.players = [];
        var player1 = Object.create(Player);
        player1.initPlayer("1", "Blue Knight", this.findPlace());
        this.addObject(player1);

        this.players.push(player1);

        var player2 = Object.create(Player);
        player2.initPlayer("2", "Red Knight", this.nonAdjacent(player1.position));
        this.addObject(player2);

        this.players.push(player2);
        showWeaponDamage(player1);
        showWeaponDamage(player2);
    },
    initWeapons: function () {
        this.weapons = [];
        var sword = Object.create(Weapon);
        sword.initWeapon("sword", 20, this.findPlace());
        this.addObject(sword);

        this.weapons.push(sword);

        var ark = Object.create(Weapon);
        ark.initWeapon("ark-arrow", 30, this.findPlace());
        this.addObject(ark);
        this.weapons.push(ark);

        var axe = Object.create(Weapon);
        axe.initWeapon("axe", 40, this.findPlace());
        this.addObject(axe);
        this.weapons.push(axe);

        var pinBall = Object.create(Weapon);
        pinBall.initWeapon("pin-ball", 50, this.findPlace());
        this.addObject(pinBall);
        this.weapons.push(pinBall);
    },
    initLifes: function () {
        // Create 3 lifes on the grid
        for (var i = 0; i < 3; i++) {
            var life = Object.create(Life);
            life.initLife(this.findPlace());
            this.addObject(life);
        }
    },
    initObstacles: function () {
        // Create 10 obstacles
        for (var i = 0; i < 10; i++) {
            var obstacle = Object.create(Obstacle);
            obstacle.initObstacle(this.findPlace());
            this.addObject(obstacle);
        }
    },

    addObject: function (obj) { // adds object on the map
        this.grid[obj.position.x][obj.position.y] = obj;
    },
    removeObject: function (position) {
        this.grid[position.x][position.y] = null;
    },
    findPlace: function () {

        var generatedX = Math.floor(Math.random() * 10);
        var generatedY = Math.floor(Math.random() * 10);

        if (this.grid[generatedX][generatedY] == null) { // doesnt exsist
            var position = Object.create(Position);
            position.initPosition(generatedX, generatedY);
            return position;
        } else {
            return this.findPlace();
        }
    },
    nonAdjacent: function (position) {
        var generatedPosition = this.findPlace();

        if (Math.abs(position.x - generatedPosition.x) > 5 ||
            (Math.abs(position.y - generatedPosition.y) > 5)) {

            return generatedPosition;
        } else {
            return this.nonAdjacent(position);
        }
    },
    getPlayers: function () {
        return this.players;
    },
    getWeapons: function () {
        return this.weapons;
    },
    getPlayerById: function (id) {
        for (var i = 0; i < this.getPlayers().length; i++) {
            if (id == this.getPlayers()[i].id) {
                return this.getPlayers()[i];
            }
        }
    },
    hasObjectAt: function (x, y) {
        if (this.grid[x][y] == null) {
            return false;
        }
        var obj = this.getObjectAtPos(x, y);
        return !obj.canTake(); // is player or obstacle
    },
    getObjectAtPos: function (x, y) {
        return this.grid[x][y];
    },
};
// visual drawing 
function drawMap(map) {

    for (var rows = 0; rows < map.length; rows++) {
        for (var colums = 0; colums < map.length; colums++) {
            var idValue = $('.grid');
            $('#board').append('<div id="id' + (idValue.length) + '"class ="grid"></div>');
            if (map.grid[rows][colums] != null) { // not empty 
                var style = map.grid[rows][colums].draw();
                $('#id' + idValue.length).addClass(style);
            }
        }
        $('.grid').width(710.500 / map.length);
        $('.grid').height(710.500 / map.length);
    }
};

function showWeaponDamage(player) {
    $('#p' + player.id + '-damage').text(player.weapon.damage);
}
// draw the highlighted possible steps at the begining
function drawPossibleStart(player, map, maxLength) {
    var pos = player.position;
    // +ve x
    for (var i = pos.x + 1; i <= pos.x + 3; i++) {
        if (i < 0 || i >= maxLength || i == pos.x) { // check the boundries 
            continue;
        }
        if (map.hasObjectAt(i, pos.y)) { // check if have object
            break;
        }
        var position = parseInt(i) * 10 + parseInt(pos.y);
        $("#id" + position).addClass('grid-move');

    }
    // -ve x
    for (var i = pos.x - 1; i >= pos.x - 3; i--) {
        if (i < 0 || i >= maxLength || i == pos.x) {
            continue;
        }
        if (map.hasObjectAt(i, pos.y)) {
            break;
        }
        var position = parseInt(i) * 10 + parseInt(pos.y);
        $("#id" + position).addClass('grid-move');

    }

    // +ve Y
    for (var i = pos.y + 1; i <= pos.y + 3; i++) {
        if (i < 0 || i >= maxLength || i == pos.y) {
            continue;
        }
        if (map.hasObjectAt(pos.x, i)) {
            break;
        }

        var position = parseInt(pos.x) * 10 + parseInt(i);
        $("#id" + position).addClass('grid-move');
    }
    // -ve Y
    for (var i = pos.y - 1; i >= pos.y - 3; i--) {
        if (i < 0 || i >= maxLength || i == pos.y) {
            continue;
        }
        if (map.hasObjectAt(pos.x, i)) {
            break;
        }
        var position = parseInt(pos.x) * 10 + parseInt(i);
        $("#id" + position).addClass('grid-move');

    }
}
// draw possible direction after 1st move
function drawPossibleDirection(pos, map, maxLength, direction, remainingMoves) {

    if (direction == 'left') {
        var count = remainingMoves;
        var temp = pos.y;
        while (count-- > 0) { // decrement y 
            temp--;
            if (temp < 0 || temp >= maxLength) {// check for boundries 
                continue;
            }
            // if position is not empty and have obstacle 
            if (map.getObjectAtPos(pos.x, temp) != null && map.getObjectAtPos(pos.x, temp).type() == "obstacle") {
                break; 
            }
            // if the position inside the boundries and 
            if (temp >= 0 && temp < maxLength && !map.hasObjectAt(pos.x, temp)) {
                var position = parseInt(pos.x) * 10 + parseInt(temp);
                $("#id" + position).addClass('grid-move');
            }
        }

        var count = remainingMoves;
        temp = pos.y;
        while (count-- >= 0) {
            if (temp < 0 || temp >= maxLength) {
                continue;
            }
            if (map.getObjectAtPos(pos.x, temp) != null && map.getObjectAtPos(pos.x, temp).type() == "obstacle") {
                break;
            }
            if (temp >= 0 && temp < maxLength && !map.hasObjectAt(pos.x, temp)) {
                var position = parseInt(pos.x) * 10 + parseInt(temp);
                $("#id" + position).addClass('grid-move');
            }
            temp++; // increment y
        }
    } else if (direction == 'right') { // draw on y
        var count = remainingMoves;
        var temp = pos.y;
        while (count-- > 0) {
            temp++;
            if (temp < 0 || temp >= maxLength) {
                continue;
            }
            if (map.getObjectAtPos(pos.x, temp) != null && map.getObjectAtPos(pos.x, temp).type() == "obstacle") {
                break;
            }
            if (temp >= 0 && temp < maxLength && !map.hasObjectAt(pos.x, temp)) {
                var position = parseInt(pos.x) * 10 + parseInt(temp);
                $("#id" + position).addClass('grid-move');
            }
        }

        var count = remainingMoves;
        var temp = pos.y;
        while (count-- > 0) {
            temp--;
            if (temp < 0 || temp >= maxLength) {
                continue;
            }
            if (map.getObjectAtPos(pos.x, temp) != null && map.getObjectAtPos(pos.x, temp).type() == "obstacle") {
                break;
            }
            if (temp >= 0 && temp < maxLength) {
                var position = parseInt(pos.x) * 10 + parseInt(temp);
                $("#id" + position).addClass('grid-move');
            };
         
        }
    } else if (direction == 'up') { // draw on x
        var count = remainingMoves;
        var temp = pos.x;
        while (count-- > 0) {
            temp++; // increment x
            if (temp < 0 || temp >= maxLength) {
                continue;
            }
            if (map.getObjectAtPos(temp, pos.y) != null && map.getObjectAtPos(temp, pos.y).type() == "obstacle") {
                break;
            }
            if (temp >= 0 && temp < maxLength && !map.hasObjectAt(temp, pos.y)) {
                var position = parseInt(temp) * 10 + parseInt(pos.y);
                $("#id" + position).addClass('grid-move');
            }
        }

        var count = remainingMoves;
        var temp = pos.x;
        while (count-- >= 0) {
            if (temp < 0 || temp >= maxLength) {
                continue;
            }
            if (map.getObjectAtPos(temp, pos.y) != null && map.getObjectAtPos(temp, pos.y).type() == "obstacle") {
                break;
            }
            if (temp >= 0 && temp < maxLength && !map.hasObjectAt(temp, pos.y)) {
                var position = parseInt(temp) * 10 + parseInt(pos.y);
                $("#id" + position).addClass('grid-move');
            }
            temp--;
        }

    } else if (direction == 'down') {
        var count = remainingMoves;
        var temp = pos.x;
        while (count-- > 0) {
            temp--;
            if (temp < 0 || temp >= maxLength) {
                continue;
            }
            if (map.getObjectAtPos(temp, pos.y) != null && map.getObjectAtPos(temp, pos.y).type() == "obstacle") {
                break;
            }
            if (temp >= 0 && temp < maxLength && !map.hasObjectAt(temp, pos.y)) {
                var position = parseInt(temp) * 10 + parseInt(pos.y);
                $("#id" + position).addClass('grid-move');
            }
        }
        var count = remainingMoves;
        var temp = pos.x;
        while (count-- >= 0) {
            if (temp < 0 || temp >= maxLength) {
                continue;
            }
            if (map.getObjectAtPos(temp, pos.y) != null && map.getObjectAtPos(temp, pos.y).type() == "obstacle") {
                break;
            }
            if (temp >= 0 && temp < maxLength && !map.hasObjectAt(temp, pos.y)) {
                var position = parseInt(temp) * 10 + parseInt(pos.y);
                $("#id" + position).addClass('grid-move');
            }
            temp++;
        }
    }
}

function moveObject(position, newObject) {
    if (position.x != newObject.position.x ||
        position.y != newObject.position.y) {
        console.log("updating object position");
        var oldObjectPos = parseInt(position.x) * 10 + parseInt(position.y); //return the old cell number
        console.log(oldObjectPos);
        $("#id" + oldObjectPos).attr('class', 'grid'); //clear cell, remove class player-id

        console.log("moving player" + newObject.id);
        var newObjectPos = parseInt(newObject.position.x) * 10 + parseInt(newObject.position.y);
        $("#id" + newObjectPos).addClass(newObject.draw()); // draw the player in the new possition
    }
}

function removeObject(position) {
    var oldObjectPos = parseInt(position.x) * 10 + parseInt(position.y);
    $("#id" + oldObjectPos).attr('class', 'grid'); //clear cell
}

function updatePlayerHealth(player) {
    $("#player-" + player.id + "-health").text(player.health);
}

function updatePlayerWeapon(player) {
    $('#player-' + player.id + '-weapon').attr('class', player.weapon.drawInfo()); // add class with weapon-info
}

function addWeapon(weapon) {
    var weaponPos = parseInt(weapon.position.x) * 10 + parseInt(weapon.position.y);
    $("#id" + weaponPos).attr('class', 'grid');
    $("#id" + weaponPos).addClass(weapon.draw());
}

function clearAround(player, maxLength, map) { // to clear the hieghlighted cells after the move 
    var pos = player.position;
    //+ve x
    for (var i = pos.x + 1; i <= pos.x + 3; i++) {

        if (i >= 0 && i < maxLength) {
            var position = parseInt(i) * 10 + parseInt(pos.y);
            $("#id" + position).removeClass('grid-move');
        }
    }
    //+ve Y
    for (var i = pos.y + 1; i <= pos.y + 3; i++) {
        if (i >= 0 && i < maxLength) {
            var position = parseInt(pos.x) * 10 + parseInt(i);
            $("#id" + position).removeClass('grid-move');
        }
    }
    //-ve x
    for (var i = pos.x - 1; i >= pos.x - 3; i--) {
        if (i >= 0 && i < maxLength) {
            var position = parseInt(i) * 10 + parseInt(pos.y);
            $("#id" + position).removeClass('grid-move');
        }
    }
    //-ve Y
    for (var i = pos.y - 1; i >= pos.y - 3; i--) {
        if (i >= 0 && i < maxLength) {
            var position = parseInt(pos.x) * 10 + parseInt(i);
            $("#id" + position).removeClass('grid-move');
        }
    }

}

function showAttackDefence(playerIdTurn) {
    $('#player-' + playerIdTurn + '-attack').show();
    $('#player-' + playerIdTurn + '-attack').attr('disabled', 'true');
    $('#player-' + playerIdTurn + '-attack').text('Attacking');

    $('#player-' + playerIdTurn + '-defend').hide();
    $('#player-' + playerIdTurn + '-turn').hide();

    var otherPlayerId;
    if (playerIdTurn == 1) {
        otherPlayerId = 2;
    } else {
        otherPlayerId = 1;
    }
    $('#player-' + otherPlayerId + '-attack').show();
    $('#player-' + otherPlayerId + '-attack').removeAttr('disabled');
    $('#player-' + otherPlayerId + '-attack').text('attack');

    $('#player-' + otherPlayerId + '-defend').show();
    $('#player-' + otherPlayerId + '-turn').hide();


}

var Game = {
    initGame: function (maxLength) {
        this.maxLength = maxLength;
        this.map = Object.create(Map);
        this.map.initMap(maxLength);
        drawMap(this.map);

        this.turn = Object.create(GameTurn);
        this.turn.initGameTurn();

        this.leftWeapons = [];
        this.stTurn = this.turn.getRandomTurn(this.map.getPlayers());
        drawPossibleStart(this.map.getPlayerById(this.stTurn), this.map, this.maxLength);
        this.player1Actions = null;
        this.player2Actions = null;
        this.attackTurn = 0;
    },
    moveObject: function (oldPosition, object) {
        this.map.removeObject(oldPosition);
        this.map.addObject(object);
        moveObject(oldPosition, object);
    },
    handleMove: function (direction) {
        if (this.canAttack()) return;
        var turn = this.turn.getTurn(this.map.getPlayers(), direction); // playerid
        if (turn == null) return;
        var player = this.map.getPlayerById(turn); // get player id from player object
        var oldPosition = Object.create(Position);
        oldPosition.initPosition(player.position.x, player.position.y);
        
        if (!this.canMove(direction, player)) { // The cell is  player or obstacle
            this.turn.cancelMove();
            return;
        }
        clearAround(player, this.maxLength, this.map);
        this.turn.display(this.map.getPlayers()); // player will move 
        if (direction == 'left') {
            player.moveLeft();
        } else if (direction == 'right') {
            player.moveRight();
        } else if (direction == 'down') {
            player.moveDown();
        } else if (direction == 'up') {
            player.moveUp();
        }

        var obj = this.map.getObjectAtPos(player.position.x, player.position.y);
        if (obj != null && obj.type() == "weapon") {
            this.leaveWeapon(player.weapon, player.position); // add the weapon to the map object
        }

        // if the cell has weapone or life
        if (obj != null && obj.canTake()) {
            player.takeObject(obj);
            showWeaponDamage(player);
            this.map.removeObject(obj.position);
            removeObject(obj.position);
        }
        this.moveObject(oldPosition, player); // move player to the new cell
        this.putWeapons(); // draw the weapon after player leave the cell 
        var nextTurn = this.getNextTurn(turn);
        if (this.canAttack()) {
            console.log("player " + nextTurn + " can attack");
            this.attackTurn = nextTurn;
            showAttackDefence(nextTurn);
        } else { // draw possible moves
            if (nextTurn != turn) { // toogle then draw the start
                drawPossibleStart(this.map.getPlayerById(nextTurn), this.map, this.maxLength);
                var prevPlayerPos = this.map.getPlayerById(turn).position;
                var position = parseInt(prevPlayerPos.x) * 10 + parseInt(prevPlayerPos.y);
                $("#id" + position).removeClass('grid-move');
            } else { // draw the possible
                drawPossibleDirection(player.position, this.map, this.maxLength, direction, this.turn.getRemainingTurn());
            }
        }
    },
    getNextTurn: function (turn) {
        var nextTurn = turn;
        if (this.turn.getRemainingTurn() == 0) {
            if (turn == 1) {
                nextTurn = 2;
            } else {
                nextTurn = 1;
            }
        }
        return nextTurn;
    },
    canMove: function (direction, player) {
        var x = parseInt(player.position.x);
        var y = parseInt(player.position.y);
        if (direction == 'left' && y - 1 >= 0) {
            return !this.map.hasObjectAt(x, y - 1);
        } else if (direction == 'right' && y + 1 < this.maxLength) {
            return !this.map.hasObjectAt(x, y + 1);
        } else if (direction == 'up' && x - 1 >= 0) {
            return !this.map.hasObjectAt(x - 1, y);
        } else if (direction == 'down' && x + 1 < this.maxLength) {
            return !this.map.hasObjectAt(x + 1, y);
        }
        return false;
    },
    // check if players are adjacent
    canAttack: function () {
        var player1Position = this.map.getPlayers()[0].position;
        var player2Position = this.map.getPlayers()[1].position;

        if ((Math.abs(player1Position.x - player2Position.x) == 1 &&
                Math.abs(player1Position.y - player2Position.y) == 0) ||
            (Math.abs(player1Position.x - player2Position.x) == 0 &&
                Math.abs(player1Position.y - player2Position.y) == 1)) {
            return true;
        }
        return false;
    },
    leaveWeapon: function (weapon, position) {
        var leftWeapon = Object.create(Weapon);
        var newPosition = Object.create(Position);
        newPosition.initPosition(position.x, position.y);
        leftWeapon.initWeapon(weapon.name, weapon.damage, newPosition);
        this.leftWeapons.push(leftWeapon);
    },
    putWeapons: function () {
        for (var x = 0; x < this.leftWeapons.length; x++) {
            var weapon = this.leftWeapons[x];
            // check if the cell is empty , then i can add the weapon
            if (this.map.getObjectAtPos(weapon.position.x, weapon.position.y) == null) {
                this.map.addObject(weapon);
                addWeapon(weapon);
                this.leftWeapons.shift();// remove item at index zero
            }
        }
    },
    attack: function (playerId) {
        if (playerId == 1) {
            this.player1Actions = 'attack';
            this.player2Actions = 'attack';
        } else {
            this.player2Actions = 'attack';
            this.player1Actions = 'attack';
        }
        this.decide();
    },
    defend: function (playerId) {
        if (playerId == 1) {
            this.player1Actions = 'defend';
            this.player2Actions = 'attack';
        } else {
            this.player2Actions = 'defend';
            this.player1Actions = 'attack';
        }
        this.decide();
    },
    decide: function () {
        if (this.player1Actions != null && this.player2Actions != null) {
            var p1Action = this.player1Actions;
            var p2Action = this.player2Actions;
            var p1 = this.map.getPlayerById(1);
            var p2 = this.map.getPlayerById(2);
            if (this.attackTurn == 1) { // player 1 attack                 
                if (p2Action == 'attack') {
                    p2.attack(p1.weapon);
                } else {
                    p2.defend(p1.weapon);
                }
                updatePlayerHealth(p2);
            } else { // p2 is attacking
                if (p1Action == 'attack') {
                    p1.attack(p2.weapon);
                } else {
                    p1.defend(p2.weapon);
                }

                updatePlayerHealth(p1);
            }
            // in the Gameover
            if (p1.health <= 0) {
                $('#player-1-attack,#player-1-defend, #player-2-attack,#player-2-defend ').removeClass('btn btn-attack btn-defend');
                $('#player-1-attack,#player-1-defend, #player-2-attack,#player-2-defend ').css('display', 'none');
                //$('#player-1-attack ,#player-2-attack').prop('disabled', false);
                $('.game-over').show();
                $('.grid').removeClass('life obstacle knife sword ark-arrow axe pin-ball player-1 player-2');
                $('#player-win').text(p2.name + " wins");
                $('#winner-img').prepend('<img src="/img/red-knight-ts.png" style="height:193px;">');

            } else if (p2.health <= 0) {
                $('#player-1-attack,#player-1-defend,#player-2-attack,#player-2-defend ').removeClass('btn btn-attack btn-defend ');
                $('#player-1-attack,#player-1-defend, #player-2-attack,#player-2-defend ').css('display', 'none');
                //                                $('#player-1-attack ,#player-2-attack').prop('disabled', false);
                $('.game-over').show();
                $('.grid').removeClass('life obstacle knife sword ark-arrow axe pin-ball player-1 player-2');
                $('#player-win').text(p1.name + " wins");
                $('#winner-img').prepend('<img src="/img/blue-knight-ts.png" style="height:193px;">');

            }

            if (this.attackTurn == 1) {
                this.attackTurn = 2;
            } else {
                this.attackTurn = 1;
            }
            this.player1Actions = null; // reset actions 
            this.player2Actions = null;
            showAttackDefence(this.attackTurn);
        } else {
            console.log("not ready to decide");
        }
    }
};

function initGame() {
    var maxLength = 10;
    var game = Object.create(Game);
    game.initGame(maxLength);
    $(document).ready(function () {
        $('#player-1-attacking').hide();
        $('#player-2-attacking').hide();
        $('#player-1-attack').click(function () {
            console.log('player 1 is attacking');
            game.attack(1);
        });

        $('#player-2-attack').click(function () {
            console.log('player 2 is attacking');
            game.attack(2);
        });

        $('#player-1-defend').click(function () {
            console.log('player 1 is defending');
            game.defend(1);
        });
        $('#player-2-defend').click(function () {
            console.log('player 2 is defending');
            game.defend(2);
        });
    });
    $('html').keydown(function (e) {
        switch (e.which) {
            case 37: // left
                console.log("left arrow pressed");
                game.handleMove('left');
                break;
            case 38: // up
                console.log("up arrow pressed");
                game.handleMove('up');
                break;
            case 39: // right
                console.log("right arrow pressed");
                game.handleMove('right');
                break;
            case 40: // down
                console.log("down arrow pressed");
                game.handleMove('down');
                break;
            default:
                return; // exit this handler for other keys
        }
    });
}


initGame();
