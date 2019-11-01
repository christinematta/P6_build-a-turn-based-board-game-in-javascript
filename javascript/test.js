var Map = {
    initMap: function (lenght) {
        this.length = lenght;
        this.grid = new Array(lenght);
        for (var i = 0; i < lenght; i++) {
            this.grid[i] = new Array(lenght);
        }
        
        
        
        var p1Position = getRandomPosition();
        
        if (!hasObject(p1Position)) {
            
            var player1 = Object.create(Player);
            player1.initPlayer("1", "p1");
            this.addObject(player1);
        
        } 
        
        else {
             var p1NewPosition = getRandomPosition();

        }
        
        
       
        
        
        
        
        var player2 = Object.create(Player);
        player2.initPlayer("2", "p2");
        this.addObject(player2);

        var sword = Object.create(Weapon);
        sword.initWeapon("sword", 20, getRandomPosition());
        this.addObject(sword);


        for (var i = 0; i < 6; i++) {

            var life = Object.create(Life);
            life.initLife();
            this.addObject(life);
        }
    },
    addObject: function (obj) {
        this.grid[obj.position.x][obj.position.y] = obj;

    },
    hasObject: function (postion) { // no object at position
        return this.grid[obj.position.x][obj.position.y] != null;

    }

};

// visual drawing 
function drawMap(map) {

    for (var rows = 0; rows < map.length; rows++) {
        for (var colums = 0; colums < map.length; colums++) {
            var idValue = $('.grid');
            $('#board').append('<div id="id' + (idValue.length) + '"class ="grid"></div>');
            if (map.grid[rows][colums] != null) { // not empty 
                var style = map.grid[rows][colums].draw();
                console.log(style);
                $('#id' + idValue.length).addClass(style);
            }
        }
        $('.grid').width(712.500 / map.length);
        $('.grid').height(712.500 / map.length);
    }
}


var Position = {
    initPosition: function (x, y) {
        this.x = x;
        this.y = y;
    },
};


function getRandomPosition() {
    var position = Object.create(Position);
    var x = Math.floor(Math.random() * 10);
    var y = Math.floor(Math.random() * 10);
    position = Object.create(Position);
    position.initPosition(x, y);
    return position;

}

var Player = {

    initPlayer: function (id, name, position) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.health = 100; // starts with health 100
        this.weapon = Object.create(Weapon);

        this.weapon.initWeapon("Knife", 10, this.position); //starts with weapon knife

        console.log("creating player id " + this.id + "at position x:" + this.position.x + " y: " + this.position.y);


    },

    moveVertical: function () {

    },

    moveHorizontal: function () {

    },

    draw: function () {
        return "player-" + this.id;
    }
}

var Weapon = {
    initWeapon: function (name, damage, position) {
        this.name = name;
        this.damage = damage;
        this.position = position;

    },
    draw: function () {
        return this.name;
    }
}

var Life = {
    initLife: function (position) {

        this.value = 10;
        this.position = position;

    },
    draw: function () {
        return "life";
    }

}


function initGame() {
    var maxLength = 10;
    var map = Object.create(Map);
    map.initMap(maxLength);
    drawMap(map);
}


initGame();