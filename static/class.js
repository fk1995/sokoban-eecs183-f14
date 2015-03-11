/* global CONST */

FLOOR=0;
EVENT=1;

/* global CONST */
/*
Constructor function for Worker.
There should be only one instance of this class at any time,
but there is no restriction of this point in the implemention.
*/

var Worker = function (pos){
	this.type = "Worker";
    // class CONST
	UP = "u";
    DOWN = "d";
    LEFT = "l";
    RIGHT = "r";
    // class CONST
    var data = {
        /*
        this object is used for spritesheet
        */
    	images: ["static/worker.png"],
    	frames: {width:32, height:32},
    	animations: {
    		down:{
    			frames:[0,1,2,1],
    			speed:0.2,
    			next:true
    		},
    		left:{
    			frames:[3,4,5,4],
    			speed:0.2,
    			next:true
    		},
    		right:{
    			frames:[6,7,8,7],
    			speed:0.2,
    			next:true
    		},
    		up:{
    			frames:[9,10,11,10],
    			speed:0.2,
    			next:true
    		},
    		d:1,
    		l:4,
    		r:7,
    		u:10
    	}
    }
    //private class varibale
    this.spritesheet = new createjs.SpriteSheet(data);
    //public class variable
	this.image = new createjs.Sprite(this.spritesheet,"d");
    //to enable local test
	this.image.crossOrigin="Anonymous";
	this.image.x = 32*this.x;
	this.image.y = 32*this.y;
    this.pos = pos; // an instance of Area class
	this.face = DOWN;
	this.moving = false; // true if the worker is moving
    this.pushing = false; // true if the worker is pushing box
	this.endMoving = false; // true if the worker is finishing moving
    this.still = true; // true if the worker is still
    // true if the worker is moving to a new block and
    // player released the key before the movement finished
}

/*
Require: The map is surrounded by at least one layer of walls.
Modify: Nothing
Effect: return whatever on the EVENT layer in front of the worker by the direction of his face.
        NO BOUND CHECK! All maps should be surrounded by at least one layer of walls.
*/
Worker.prototype.look = function (){

    switch (this.face){
    	case UP:
    		return this.pos.map.data[this.y-1][this.x][EVENT];
    	case DOWN:
    		return this.pos.map.data[this.y+1][this.x][EVENT];
    	case LEFT:
    		return this.pos.map.data[this.y][this.x-1][EVENT];
    	case RIGHT:
    		return this.pos.map.data[this.y][this.x+1][EVENT];
    }
}

/*
Require: Nothing
Modify: this.image, this.pos
Effect: the function is called every tick in the main loop if the worker is moving.
        We move the image of the worker first, and then check if we need to update his
        position and if he should stop at some point where he cannot go further.
*/
Worker.prototype.frameMove = function (){
	this.imageMove();
    this.updatePos();
}


/*
Require: Nothing
Modify: this.x,this.y,this.pos,this.pos.map,this.moving,this.endMoving
Effect: check if we should update worker's pos,x,y and move status.
*/
Worker.prototype.updatePos = function (){
    if (this.image.x % 32 == 0 && this.image.y % 32 ==0 &&
        (this.x != this.image.x / 32 || this.y != this.image.y/32)
        ){
        // 32px is the width and height of a cell in the spritesheet
        this.pos.map.data[this.y][this.x][EVENT] = null;
        this.x = this.image.x / 32;
        this.y = this.image.y / 32;
        this.pos = this.pos.map.get(this.x,this.y,FLOOR);
        this.pos.map.set(this.x,this.y,EVENT,this);
        this.pos.map.moves++;
        if (this.look() != null){
            // if there is "something" in front of the worker
            if (this.look().type == "Wall" || (this.look().type == "Box" && !this.look().isMovable())){
                // unmovable object, stop moving
                this.moving = false;
                this.endMoving = true;
            }
        }
    }
}

/*
Require: Nothing
Modify: this.endMoving,this.pushing
Effect: this function is called when we need to stop the worker from moving, and help him to finish his
        movement if he didn't reach the next block when players release the arrow key.
*/
Worker.prototype.frameStop = function (){
    if (!this.endMoving && (this.image.x % 32 != 0 || this.image.y % 32 !=0)){
        this.endMoving = true;
    }
    else if (this.endMoving && (this.image.x % 32 != 0 || this.image.y % 32 !=0)){
        this.finishMove();
    }
    else{
       this.stopMove();
       this.pushing=false;
       this.still=true;
    }
}

/*
Require: Nothing
Modify: this.x,this.y,this.endMoving,document.onkeydown
Effect: this function is called when the worker completely stops. We update his pos and any keyboard
        event should be ignored during this process to prevent any possible bugs.
*/
Worker.prototype.stopMove = function (){
    document.onkeydown = function (e){}; // disable the onkeydown event callback
    this.endMoving = false;
    this.stop();// set face
    this.pos.map.set(this.x,this.y,EVENT,null);
    this.x = this.image.x / 32;
    this.y = this.image.y / 32;
    this.pos = this.pos.map.get(this.x,this.y,FLOOR);
    this.pos.map.set(this.x,this.y,EVENT,this);
}

/*
Require: Nothing
Modify: this.image.x,this.image.y
Effect: move the image of the worker in proper direction.
*/
Worker.prototype.imageMove = function (){
    if (this.image.x % 32 == 0 || this.image.y % 32 == 0){
    	switch (this.image.currentAnimation){
            case "left":
                this.image.x -=4;
                break;
            case "right":
                this.image.x +=4;
                break;
            case "up":
                this.image.y -=4;
                break;
            case "down":
                this.image.y +=4;
                break;
        }
    }
}

/*
Require: Nothing
Modify:  this.image
Effect: When the player releases the arrow key and the worker is not in a proper position,
        then this function is called to finish the uncompleted movement.
*/
Worker.prototype.finishMove = function (){
    // disable onkeydown event callback
    document.onkeydown = function (e){};
    if (this.image.x % 32 == 0 || this.image.y % 32 == 0){
    	switch (this.image.currentAnimation){
            case "l":
                this.image.gotoAndPlay("left");
            case "left":
                this.image.x -=4;
                break;
            case "r":
                this.image.gotoAndPlay("right");
            case "right":
                this.image.x +=4;
                break;
            case "u":
                this.image.gotoAndPlay("up");
            case "up":
                this.image.y -=4;
                break;
            case "d":
                this.image.gotoAndPlay("down");
            case "down":
                this.image.y +=4;
                break;
        }
        // If the worker is pushing the box, just make the box move with him together
        if (this.pushing){
            this.push();
        }
    }
}

/*
Require: Nothing
Modify: this.face, this.image
Effect: Stop worker from moving.
*/
Worker.prototype.stop = function (){
    if (!this.moving){
    	switch (this.image.currentAnimation){
    	    case "left":
    	        this.image.gotoAndPlay("l");
                this.face = "l";
    	        break;
    	    case "right":
    	        this.image.gotoAndPlay("r");
                this.face = "r";
    	        break;
    	    case "up":
    	        this.image.gotoAndPlay("u");
                this.face = "u";
    	        break;
    	    case "down":
    	        this.image.gotoAndPlay("d");
                this.face = "d";
    	        break;
        }
    }
}

/*
Require: Nothing
Modify: box (which is pushed)
Effect: This function implements the push movement.
*/
Worker.prototype.push = function (){
    var box = this.look() // get target box
    box.imageMove(this.face); // move the box in the same direction as worker's face
    if (box.image.x % 32 == 0 && box.image.y % 32 ==0){
        //record the state
        box.pos.map.history.push([box.x,box.y,box.pos.map.moves])
        //update pos and map for box if it moves to a new area
        box.x = box.image.x / 32;
        box.y = box.image.y / 32;
        box.pos.map.history.push([box.x,box.y])
        //update map
        box.pos.map.set(box.x,box.y,EVENT,box);
        box.pos = box.pos.map.get(box.x,box.y,FLOOR);
        //set onDest property
        box.onDest =  box.pos.isDest;
        switch (this.face){
            case ("l"):
                box.pos.map.set(box.x+1,box.y,EVENT,null);
                break;
            case ("r"):
                box.pos.map.set(box.x-1,box.y,EVENT,null);
                break;
            case ("u"):
                box.pos.map.set(box.x,box.y+1,EVENT,null);
                break;
            case ("d"):
                box.pos.map.set(box.x,box.y-1,EVENT,null);
                break;
        }
        if (box.onDest){
            //if it is moved to a destination, check whether every box is onDest
            box.pos.map.pass = box.pos.map.checkComplete();
        }
    }
}
/*
Constructor function for class map.
Note that only instance map has access to the global variable "stage".
If a worker or a box instance want to access stage, do like this:

    worker.pos.map.stage
    
*/
var Map = function (name,id,stage){
    this.type = "Map";
	this.stage = stage;
	this.id = id;
	this.name = name;
    this.width = 0;
    this.height = 0;
    this.rawdata = null;
    this.data = [];
    this.floor = new createjs.Container(); // FLOOR layer
    this.event = new createjs.Container(); // EVENT layer
    this.layers = [this.floor,this.event];
    this.pass = false;
    this.moves = 0;
    this.bestmoves = 0;
    this.history = [];
}

/*
Require: x>=0,y>=0,x<width,y<width,layer=EVENT or FLOOR
Modify: this.data
Effect: set this.data[y][x][layer] to object o.
*/
Map.prototype.set = function (x,y,layer,o){
    if (!this.data[y][x]){
        this.data[y][x]=[null,null];
    }
    this.data[y][x][layer] = o;
    if (o){
        o.x = x;
        o.y = y;
    }
}

/*
Require: x>=0,y>=0,x<width,y<width,layer=EVENT or FLOOR
Modify: Nothing
Effect: get this.data[y][x][layer]
*/
Map.prototype.get = function (x,y,layer){
    return this.data[y][x][layer];
}

/*
Require: mapdata to be a valid object
Modify: this.rawdata, this.width, this.height, this.data(in this.init())
Effect: load mapdata and initialize this.data.
*/
Map.prototype.load = function (mapdata){
    this.rawdata = mapdata;
    this.width = this.rawdata.width;
    this.height = this.rawdata.height;
    this.init();
}

/*
Require: Nothing
Modify: this.data
Effect: set this.data according to this.rawdata. Implemented by nested for loops.
*/

Map.prototype.init = function (){
    for (var y=0;y<this.rawdata.height;y++){
        // create rows
        this.data[y] = [];
    }
    for (var y=0;y<this.rawdata.height;y++){
        for (var x=0;x<this.rawdata.width;x++){
            switch (this.rawdata.layers[FLOOR].data[y*this.rawdata.width+x]){
                case (0):
                    //empty block
                    this.set(x,y,FLOOR,null);
                    break;
                case (3):
                    //floor which is not a dest
                    this.set(x,y,FLOOR,new Area(x,y,false,this));
                    break;
                case (4):
                    //floor which is a dest
                    this.set(x,y,FLOOR,new Area(x,y,true,this));
                    break;
            }
        }
    }
    for (var y=0;y<this.rawdata.height;y++){
        for (var x=0;x<this.rawdata.width;x++){
            switch (this.rawdata.layers[EVENT].data[y*this.rawdata.width+x]){
                case (0):
                    //empty block
                    this.set(x,y,EVENT,null);
                    break;
                case (1):
                    //wall, call the constructor
                    this.set(x,y,EVENT,new Wall());
                    break;
                case (2):
                    //box, call the constructor. Note that this has to be done after the former loop
                    this.set(x,y,EVENT,new Box(x,y,this.get(x,y,FLOOR)));
                    break;
            }
        }
    }
    this.update(); // redraw the map after init
}

/*
Require: Nothing
Modify: this.floor, this.event, this.stage
Effect: update this.stage based on this.data. Use this.floor and this.event as layers.
*/
Map.prototype.update = function (){
    for (var y = 0; y < this.height; y++){
        for (var x = 0; x < this.width; x++){
            var im = this.get(x,y,FLOOR).image;
            im.x = x * 32;
            im.y = y * 32;
            this.floor.addChild(im); // use addChild to append the image to the layer
            if (this.get(x,y,EVENT)){
                im = this.get(x,y,EVENT).image;
                im.x = x * 32;
                im.y = y * 32;
                this.event.addChildAt(im,0);
            }
        }
    }
    // append layers to stage
    this.floor.x = (640 - (this.width*32))/2;
    this.floor.y = (640 - (this.height*32))/2 - 100;
    this.event.x = (640 - (this.width*32))/2;
    this.event.y = (640 - (this.height*32))/2 - 100;
    this.stage.addChildAt(this.floor,0);
    this.stage.addChildAt(this.event,1);
    this.stage.update();
}

/*
Require: Nothing
Modify: Nothing
Effect: Check current map. Return true if all boxes are on the dest area and false otherwise.
*/
Map.prototype.checkComplete = function(){
    for (var y = 0; y < this.height; y++){
        for (var x = 0; x < this.width; x++){
            var e = this.data[y][x][EVENT]
            if (e){
                if (e.type == "Box" && !e.onDest)
                    return false;
            }
        }
    }
    return true;
}
/*
Constructor function for wall. Very simple. No method needed for this class.
Using a part of tiles.png as its source.
*/
var Wall = function (){
    this.type = "Wall";
    this.image = new createjs.Bitmap("static/tiles.png");
    this.image.sourceRect = new createjs.Rectangle(x=0,y=0,width=32,height=32);
}

/*
Constructor function for box.
Using a part of tiles.png as its source.
*/
var Box = function (x,y,area){
    this.type = "Box";
    this.x = x;
    this.y = y;
    this.pos = area;
    this.onDest = this.pos.isDest;
    this.image = new createjs.Bitmap("static/tiles.png");
    this.image.sourceRect = new createjs.Rectangle(x=32,y=0,width=32,height=32);
}

/*
Require: dir to be one of "u", "d", "l", "r". It is recommended that you call this function like
         box.isMovable(worker.face);
Modify: Nothing
Effect: check if this box is movable in given direction.
*/
Box.prototype.isMovable = function(dir){
    switch (dir){
        case ("u"):
            return (!this.pos.map.get(this.x,this.y-1,EVENT));
        case ("d"):
            return (!this.pos.map.get(this.x,this.y+1,EVENT));
        case ("l"):
            return (!this.pos.map.get(this.x-1,this.y,EVENT));
        case ("r"):
            return (!this.pos.map.get(this.x+1,this.y,EVENT));
    }
}

/*
Require: dir to be one of "u", "d", "l", "r". It is recommended that you call this function like
         box.imageMove(worker.face);
Modify: this.image
Effect: move the image of the box in given direction. 
        This function is very similar to Worker.imagemove(),
        but note that a box does not have a face and thus a direction is required to be specified.
*/
Box.prototype.imageMove = function(dir){
    if (this.image.x % 32 == 0 || this.image.y % 32 == 0){
        switch (dir){
            case "l":
                this.image.x -=4;
                break;
            case "r":
                this.image.x +=4;
                break;
            case "u":
                this.image.y -=4;
                break;
            case "d":
                this.image.y +=4;
                break;
        }
    }
}

/*
Constructor function for Area class.
No method implemented for this class.
Note that the only way a worker or a box instance to access map object is through the area object,
i.e. worker.map or box.map doesn't work; only worker.pos.map or box.pos.map works.
The instance will use different images based on the value of isDest.
*/
var Area = function (x,y,isDest,map){
    this.type = "Area";
    this.x = x;
    this.y = y;
    this.isDest = isDest;
    this.map = map;
    if (!this.isDest){
        this.image = new createjs.Bitmap("static/tiles.png");
        this.image.sourceRect = new createjs.Rectangle(x=64,y=0,width=32,height=32);
    }
    else{
        this.image = new createjs.Bitmap("static/tiles.png");
        this.image.sourceRect = new createjs.Rectangle(x=96,y=0,width=32,height=32);
    }
}
