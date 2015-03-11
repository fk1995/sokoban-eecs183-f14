var KEYLEFT  = 37;
var KEYUP    = 38;
var KEYRIGHT = 39;
var KEYDOWN  = 40;

function init() {
    // create stage object. It will be the closure where we set our other objects.
    var stage = new createjs.Stage("Canvas")
    // set ticker function
    createjs.Ticker.addEventListener("tick", handleTick);
    var bmoves; // Text object to display the best move record
	var map,move,worker; //These variables have to be declared in this scope
	function handleTick(event) {
        // this function is called every tick(every frame loop)
        // main loop
        if (worker.moving){
            if (worker.pushing){
                worker.push();
            }
            worker.frameMove();
        }
        else{
            if (!worker.still)
                worker.frameStop();
            // accept onkeydown event again here
            this.onkeydown = move;
        }
        // make sure the worker is in the right position!
        worker.updatePos();
        // update move counter
        moves.text = "Moves:"+String(map.moves);
        // update best move
        if (localStorage.records){
            if (JSON.parse(localStorage.records)[map.name]){
                if (JSON.parse(localStorage.records)[map.name].length != 0){
                    // Be careful here to make sure the record does exist!
                    if (bmoves==undefined){
                        // if we did not create bmoves...
                        bmoves = new createjs.Text("Record:"+
                            String(JSON.parse(localStorage.records)[map.name][1]) +" By "+
                            String(JSON.parse(localStorage.records)[map.name][0])
                            ,"20px Arial");
                        bmoves.x = 400;
                        bmoves.y = 550;
                        stage.addChild(bmoves);
                    }
                    else{
                        // update it!
                        bmoves.text =   "Record:"+String(JSON.parse(localStorage.records)[map.name][1]) +
                                        " By "+ String(JSON.parse(localStorage.records)[map.name][0]);
                    }
                }
            }
        }
        // Set it into right position
        moves.x = 400;
        moves.y = 500;
        stage.addChild(moves);
        // redraw stage
  		stage.update();
        // check if complete
        if (map.pass){
            //print congrat info!
            var mes = new createjs.Text("Congratulations!","30px Rockwell");
            mes.x = 33;
            mes.y = 469;
            map.stage.addChild(mes);
            document.onkeydown = function (){};
            document.onkeyup = function (){};
            // update best move record
            if (JSON.parse(localStorage.records)[map.name]!=undefined){
                if (JSON.parse(localStorage.records)[map.name].length == 0 || 
                    map.moves <= JSON.parse(localStorage.records)[map.name][1]){
                    alert("You solved this level within the fewest moves!");
                    var name;
                    while (!name)
                    { 
                        name = prompt("What's your name?");
                    }
                    var o = JSON.parse(localStorage.records);
                    o[map.name] = [name,map.moves];
                    localStorage.records = JSON.stringify(o);
                    alert("Your record has been saved!")
                }
            }
            map.pass = false;
        }
	}
    // Create Map instance
    var mapinit = ( function (){
	    var mapnames = ["map01","map02","map03","map04","map05","map06","map07","map08","map09"]
        // use url parameter to determine which level to play
        var url = window.location.href;
        var len = url.length;
        var offset = url.indexOf("?");
        if (offset != -1 && !document.mapid){
            var str = url.substr(offset, len);
            var mapid = Number(str.split("=")[1])
        }
        else{
            // random level
	       var mapid = (document.mapid == undefined)? Math.floor(Math.random()*mapnames.length)+1:document.mapid;
	    }
        // save it to DOM so we can retrieve the level id later
        document.mapid = mapid;
        // create map instace
	    map = new Map(mapnames[mapid-1],mapid,stage);
	    if (localStorage.records){
            // if there is records for this map...
	        if (JSON.parse(localStorage.records)[map.name]){
	            if (JSON.parse(localStorage.records)[map.name].length != 0){
                    // Be careful to read the records...
	                var r = JSON.parse(localStorage.records);
	                bmoves = new createjs.Text("Record:"+String(r[map.name][1]) +" By "+
	                String(r[map.name][0])
	                ,"20px Arial");
                    // set position for bmoves
	                bmoves.x = 400;
	                bmoves.y = 550;
	                stage.addChild(bmoves);
	            }
	        }
	        else{
                // create records info for it
	            var n = map.name;
	            var o = JSON.parse(localStorage.records);
	            o[n] = [];
	            localStorage.records = JSON.stringify(o);
	        }
	    }
	    else{
	        var n = map.name;
	        var o = {};
	        o[n] = [];
	        localStorage.records = JSON.stringify(o);
	    }
        // move counter Text object
	    moves = new createjs.Text("Moves:"+String(map.moves),"20px Arial");
	    // load from a const variable
	    map.load(eval(map.name));
	    // Create Worker instance
	    var initx = 0,inity = 0;
	    switch(map.name){
            // decide where to spawn the worker
	        case "map01":
	        	initx = 6;
	        	inity = 6;
	            break;
	        case "map02":
	        	initx = 4;
	        	inity = 6;
	            break;
	        case "map03":
	        	initx = 3;
	        	inity = 1;
	            break;
	        case "map04":
	        	initx = 1;
	        	inity = 2;
	        	break;
	       	case "map05":
	       		initx = 4;
	       		inity = 3;
	       		break;
	       	case "map06":
	       		initx = 2;
	       		inity = 3;
	       		break;
	       	case "map07":
	       		initx = 5;
	       		inity = 4;
	       		break;
	       	case "map08":
	       		initx = 2;
	       		inity = 2;
	       		break;
	       	case "map09":
	       		initx = 3;
	       		inity = 3;
	       		break;
	    }
	    worker = new Worker(map.get(initx,inity,FLOOR));
	    // Put him in the right place
	    map.set(initx,inity,EVENT,worker);
	    map.update();
	});
    // Call the function above
    // We are going to call it when "Reset" button is pressed
	mapinit();
    // Set callback events
    this.document.onkeydown = move;
    this.document.onkeyup = moveend;
    function move(e){
        // disable onkeydown event to prevent any potential bugs
        this.onkeydown = function (e){};
        this.onkeyup = moveend;
        var dir;
        switch (e.keyCode){
            // decide the direction of movement
            case (KEYLEFT):
                dir = "l";
                break;
            case (KEYDOWN):
                dir = "d";
                break;
            case (KEYUP):
                dir = "u";
                break;
            case(KEYRIGHT):
                dir = "r";
                break;
            }
        if (!worker.moving && !worker.endmoving && !worker.pushing)
            //only change worker's face direction if he is not doing anything!!
            worker.face = dir;
        if (!worker.moving && worker.image.x % 32 == 0 && worker.image.y % 32 ==0 && 
            (!worker.look() || worker.look().type != "Wall")
            ){
            // make sure the worker is in the right place to move
            // and he is not facing a wall!
            worker.pushing = false;
            worker.still = false;
            if (worker.look() == null){
                // simply move
                worker.moving = e.keyCode;
                worker.pos.map.data[worker.y][worker.x][EVENT] = null;
                switch (e.keyCode){
                    case (KEYLEFT):
                        worker.image.gotoAndPlay("left");
                        break;
                    case (KEYDOWN):
                        worker.image.gotoAndPlay("down");
                        break;
                    case (KEYUP):
                        worker.image.gotoAndPlay("up");
                        break;
                    case(KEYRIGHT):
                        worker.image.gotoAndPlay("right");
                        break;
                }
            }
            else{
                // it should be a box, check if it is movable
                if (worker.look().isMovable(worker.face)){
                    worker.moving=e.keyCode;
                    worker.still = false;
                    worker.pushing = true;
                    switch (e.keyCode){
                        case (KEYLEFT):
                            worker.image.gotoAndPlay("left");
                            break;
                        case (KEYDOWN):
                            worker.image.gotoAndPlay("down");
                            break;
                        case (KEYUP):
                            worker.image.gotoAndPlay("up");
                            break;
                        case(KEYRIGHT):
                            worker.image.gotoAndPlay("right");
                            break;
                    }
                }
                else{
                    // it is a unmovable box, stop right there
                    worker.pushing = false;
                    worker.still = true;
                    switch (e.keyCode){
                        case (KEYLEFT):
                            worker.image.gotoAndStop("l");
                            break;
                        case (KEYDOWN):
                            worker.image.gotoAndStop("d");
                            break;
                        case (KEYUP):
                            worker.image.gotoAndStop("u");
                            break;
                        case(KEYRIGHT):
                            worker.image.gotoAndStop("r");
                            break;
                    }
                    stage.update();
                }
            }
        }
        else if (!worker.moving && worker.image.x % 32 == 0 && worker.image.y % 32 ==0 && worker.look().type == "Wall"){
            // it's a wall.
            switch (e.keyCode){
                case (KEYLEFT):
                    worker.image.gotoAndStop("l");
                    break;
                case (KEYDOWN):
                    worker.image.gotoAndStop("d");
                    break;
                case (KEYUP):
                    worker.image.gotoAndStop("u");
                    break;
                case(KEYRIGHT):
                    worker.image.gotoAndStop("r");
                    break;
            }
            stage.update();
        }
    }
    function moveend(e){
        // end of movement
        if (worker.moving == e.keyCode){
            // only triggered if the key released is the key first pressed!
            worker.moving=false;
            switch (e.keyCode){
                case (KEYLEFT):
                    worker.image.gotoAndStop("l");
                    break;
                case (KEYDOWN):
                    worker.image.gotoAndStop("d");
                    break;
                case (KEYUP):
                    worker.image.gotoAndStop("u");
                    break;
                case(KEYRIGHT):
                    worker.image.gotoAndStop("r");
                    break;
            }
            stage.update();
        }
    }
    $(document).ready(function(){
        $('#reset').click(function(){
            stage.removeAllChildren();
            mapinit();
            document.onkeydown = move;
            document.onkeyup = moveend;
        })
        $('#undo').click(function(){
            if (map.history.length>1){
                var state2 = map.history.pop();
                var state1 = map.history.pop();
                var ox = state1[0];
                var oy = state1[1];
                var nx = state2[0];
                var ny = state2[1];
                map.set(worker.x,worker.y,EVENT,null);
                map.moves = state1[2];
                if (ox==nx){
                    // move vertically
                    if (oy == ny - 1){
                        // move down
                        worker.face="d";
                        worker.image.gotoAndStop("d");
                        worker.x = ox;
                        worker.y = oy-1;
                    }
                    else{
                        // move up
                        worker.face="u";
                        worker.image.gotoAndStop("u");
                        worker.x = ox;
                        worker.y = oy+1;
                    }
                }
                else{
                    if (ox == nx - 1){
                        // move right
                        worker.face="r";
                        worker.image.gotoAndStop("r");
                        worker.x = ox - 1;
                        worker.y = oy;
                    }
                    else{
                        // move left
                        worker.face="l";
                        worker.image.gotoAndStop("l");
                        worker.x = ox + 1;
                        worker.y = oy;
                    }
                }
                worker.image.x = worker.x * 32;
                worker.image.y = worker.y * 32;
                worker.pos = map.get(worker.x,worker.y,FLOOR);
                map.set(worker.x,worker.y,EVENT,worker);
                map.set(ox,oy,EVENT,map.get(nx,ny,EVENT));
                map.set(nx,ny,EVENT,null);
                map.update();
                stage.update();
            }
            else{
                stage.removeAllChildren();
                mapinit();
            }
        })
    })
}