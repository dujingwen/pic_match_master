/**
 * Created by fukan on 2015/10/12.
 */
function rand(i){
    return Math.floor(Math.random()*i);
}
var colorArray = new Array();
colorArray[0] = "#F48300";
colorArray[1] = "#691BB8";
colorArray[2] = "#199900";
colorArray[3] = "#C1004F";
colorArray[4] = "#E56C19";
colorArray[5] = "#FF2E12";

function point(_x,_y,_type,_status){
    this.x = _x;
    this.y = _y;
    this.type = _type;
    this.exist = _status;
}

point.prototype.drawArcRect=function(radius,length){
    var left = this.x*length+2;
    var right = left+length-2;
    var top = this.y*length+2;
    var bottom = top+length-2;

    //画圆角矩形
    context.beginPath();
    context.moveTo( left+radius,top);
    context.lineTo( right-radius,top);
    context.arc(right-radius, top+radius, radius, 3*Math.PI/2, Math.PI*2, false);
    context.lineTo(right,bottom-radius);
    context.arc(right-radius, bottom-radius, radius, 0, Math.PI/2, false);
    context.lineTo(left+radius, bottom);
    context.arc(left+radius, bottom-radius, radius, Math.PI/2, Math.PI, false);
    context.lineTo(left,top+radius);
    context.arc(left+radius, top+radius, radius, Math.PI, 3*Math.PI/2, false);
    context.closePath();
}
point.prototype.draw=function(length){
    context.fillStyle = colorArray[0];
    this.drawArcRect(5,length);
    context.fill();

    var row = Math.floor(this.type/5);
    var column = this.type%5;
    context.drawImage(imageArray[0],column*96,row*96,96,96,this.x*length, this.y*length,length,length);
}

function road(){
    this.num = 0;
    this.list = new Array();
}
road.prototype.add = function(p){
    this.list[this.num] = p;
    this.num++;
}
road.prototype.draw=function(length){
    context.beginPath();

    context.strokeStyle=colorArray[3];
    context.lineWidth = 4;
    context.moveTo(this.list[0].x*length+length/2,this.list[0].y*length+length/2);
    for(var i=1;i<this.num;i++){
        context.lineTo(this.list[i].x*length+length/2,this.list[i].y*length+length/2);
    }

    context.stroke();
    context.closePath();
}

function board(){
    //base
    //如果width=12,height=8,那么typenum可以设置为16。因为12*8=96,能被6整除
    //this.width = 12;
    //this.height = 8;
    //15*8=120,能被20整除
    this.width = 15;
    this.height = 8;
    this.length = 48;
    this.lastpoint = null;
    this.lastroad = null;
    this.array = new Array();

    //array to make hint more quickly
    this.typenum = 20;
    this.typearray = new Array();

    //record
    this.starttime = null;
    this.bartimerid = null;
    this.timerid = null;
    this.pointnum = this.width*this.height;
    this.best = eval(window.localStorage.getItem("score"));
    this.hintnum = 5;
    this.rearrangenum = 3;
    this.initial_array();
    this.initial_typearray();
}
board.prototype.initial_array=function(){
    for(var i=0;i<this.width+2;i++){
        this.array[i] = new Array();
        for(var j=0;j<this.height+2;j++){
            if(i==0 || i==this.width+1 || j==0 || j==this.height+1){
                this.array[i][j] = new point(i,j,0,false);
            }
            else {
                this.array[i][j] = new point(i,j,0,true);
            }
            this.array[i][j].type = ((j-1)*this.width+(i-1))%this.typenum;
        }
    }
    ////initial the borad icon !
    for(var i=0;i<1000;i++){
        var p1 = this.array[rand(this.width)+1][rand(this.height)+1];
        var p2 = this.array[rand(this.width)+1][rand(this.height)+1];
        var tmp = p1.type;
        p1.type = p2.type;
        p2.type = tmp;
    }
}

board.prototype.initial_typearray= function (){
    for(var i=0;i<this.typenum;i++){
        this.typearray[i] = new Array();
    }
    for(var i=1;i<this.width+1;i++){
        for(var j=1;j<this.height+1;j++){
            var n = this.array[i][j].type;
            this.typearray[n].push(this.array[i][j]);
        }
    }
}
board.prototype.drawboard = function(){
    context.beginPath();
    context.clearRect(0, 0, 800, 600);
    for(var i=0;i<this.width+2;i++){
        for(var j=0;j<this.height+2;j++){
            if(this.array[i][j].exist){
                this.array[i][j].draw(this.length);
            }
        }
    }
    if(this.lastpoint){
        context.strokeStyle = colorArray[2];
        context.lineWidth = 3;
        context.strokeRect(this.lastpoint.x*this.length,this.lastpoint.y*this.length,this.length,this.length);
    }
    if(this.lastroad){
        this.lastroad.draw(this.length);
    }
}
board.prototype.checkline = function(begin,end){
    if(begin == end){
        return false;
    }
    if(begin.x == end.x){
        var dy = (end.y>begin.y ?1:-1);
        for(var i = begin.y+dy;i!=end.y;i+=dy){
            if(this.array[begin.x][i].exist){
                return false;
            }
        }
        return true;
    }
    else if(begin.y == end.y){
        var dx = (end.x>begin.x ? 1:-1);
        for(var i=begin.x+dx;i!=end.x;i+=dx){
            if(this.array[i][begin.y].exist){
                return false;
            }
        }
        return true;
    }
    return false;
}

board.prototype.getroad= function (begin,end) {
    var result = null;
    if(begin==end)
        return null;
    ///try  to use 0 turn to access
    if(begin.y==end.y || begin.x==end.x){
        if(this.checkline(begin,end)){
            result = new road();
            result.add(begin);
            result.add(end);
            return result;
        }
    }

    ///try to use 1 turn to access
    for(var i=0;i<2;i++){
        var middle = null;
        if(i==0){
            middle = this.array[begin.x][end.y];
        }
        else {
            middle = this.array[end.x][begin.y];
        }

        if(!middle.exist && this.checkline(begin,middle) && this.checkline(middle,end)){
            result = new road();
            result.add(begin);
            result.add(middle);
            result.add(end);
            return result;
        }
    }

    ////try to use 2 turn to access
    for(var i=0;i<this.width+2;i++){
        if(i==begin.x || i==end.x)
            continue;
        var middle1 = this.array[i][begin.y];
        var middle2 = this.array[i][end.y];
        if(!middle1.exist && !middle2.exist){
            if(this.checkline(begin,middle1) && this.checkline(middle1,middle2) && this.checkline(middle2,end)){
                result = new road();
                result.add(begin);
                result.add(middle1);
                result.add(middle2);
                result.add(end);
                return result;
            }
        }
    }
    for(var j=0;j<this.height+2;j++){
        if(j==begin.y || j==end.y)
            continue;
        var middle1 = this.array[begin.x][j];
        var middle2 = this.array[end.x][j];
        if(!middle1.exist && !middle2.exist){
            if(this.checkline(begin,middle1) && this.checkline(middle1,middle2) && this.checkline(middle2,end)){
                result = new road();
                result.add(begin);
                result.add(middle1);
                result.add(middle2);
                result.add(end);
                return result;
            }
        }
    }
    return null;
}
board.prototype.gethint = function () {
    for(var n=0;n<this.typenum;n++){
        var arr = this.typearray[n];
        var length = arr.length;
        for(var i=0;i<length;i++){
            for(var j=i+1;j<length;j++){
                if(!arr[i].exist || !arr[j].exist)
                    continue;
                var road = this.getroad(arr[i],arr[j]);
                if(road!=null)
                    return road;
            }
        }
    }
    return null;
}
function updatebar(){
    var now = new Date();
    var width = now - gameboard.starttime;
    width = 100 - width/10/gameboard.best;
    $("#bar").width(width+"%");
}
var imageArray = new Array();
for(var i=0;i<4;i++){
    imageArray[i] = new Image();
}
imageArray[0].src = "pkm.png";
var context = document.getElementById('board').getContext('2d');
imageArray[0].onload = function(){
    gameboard.drawboard();
    gameboard.starttime = new Date();
    if(gameboard.best!=null){
        $("#best").text(gameboard.best+" s");
    }
    $("#hint").text("hint("+gameboard.hintnum+")");
    $("#rearrange").text("rearrange("+gameboard.rearrangenum+")");
    if(gameboard.best!=null && gameboard.best>0){
        if(gameboard.best>100){
            gameboard.bartimeid = setInterval(function(){updatebar()},1000);
        }
        else{
            gameboard.bartimeid = setInterval(function(){updatebar()},100);
        }
    }
}
var gameboard = new board();