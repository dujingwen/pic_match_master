/**
 * Created by fukan on 2015/10/12.
 */
document.getElementById('board').onclick=function(event){
    if(gameboard.lastroad){
        gameboard.lastroad = null;
    }
    var x;
    var y;
    if(event.offsetX){
        x = Math.floor(event.offsetX/gameboard.length);
        y = Math.floor(event.offsetY/gameboard.length);
    }
    else{
        x = Math.floor((event.layerX-this.offsetLeft)/gameboard.length);
        y = Math.floor((event.layerY-this.offsetTop)/gameboard.length);
    }
    if(x>=gameboard.width+2 || y>=gameboard.height+2){
        gameboard.drawboard();
        return;
    }
    var p = gameboard.array[x][y];
    if(!p.exist){
        gameboard.drawboard();
    }
    else if(p.exist && (gameboard.lastpoint==null || gameboard.lastpoint.type!= p.type)){
        gameboard.lastpoint = p;
        gameboard.drawboard();
    }
    else {
        var r = gameboard.getroad(gameboard.lastpoint,p);
        if(!r){
            gameboard.lastpoint = p;
            gameboard.drawboard();
            return;
        }
        gameboard.lastroad = r;
        var tmp = gameboard.lastpoint;
        gameboard.lastpoint = null;
        gameboard.drawboard();
        gameboard.lastroad = null;
        tmp.exist = false;
        p.exist = false;
        gameboard.pointnum -= 2;
        checkgameover();
        clearTimeout(gameboard.timerid);
        gameboard.timerid = setTimeout(function(){gameboard.drawboard()},300);
    }
}
document.getElementById('hint').onclick = function (event) {
    if(gameboard.hintnum>0){
        gameboard.hintnum--;
        $("#hint").text("hint("+gameboard.hintnum+")");
        if(gameboard.hintnum==0){
            $("#hint").attr("disabled","disabled");
        }
    }
    else {
        $("#hint").attr("disabled","disabled");
        return;
    }

    gameboard.lastpoint = null;
    var road = gameboard.gethint();
    if(road==null){
        gameboard.lastpoint = null;
        gameboard.drawboard();
        return;
    }
    gameboard.lastroad = road;
    gameboard.drawboard();
    gameboard.lastroad = null;
    road.list[0].exist = false;
    road.list[road.num-1].exist = false;
    gameboard.pointnum-=2;
    checkgameover();
    clearTimeout(gameboard.timerid);
    gameboard.timerid = setTimeout(function(){gameboard.drawboard()},300);
}
document.getElementById('rearrange').onclick = function(event){
    if(gameboard.rearrangenum>0){
        gameboard.rearrangenum--;
        $("#rearrange").text("rearrange("+gameboard.rearrangenum+")");
        if(gameboard.rearrangenum==0) {
            $("#rearrange").attr("disabled", "disabled");
        }
    }
    else{
        $("rearrange").attr("disabled","disabled");
        return;
    }

    for(var i=0;i<1000;i++){
        var p1 = gameboard.array[rand(gameboard.width)+1][rand(gameboard.height)+1];
        var p2 = gameboard.array[rand(gameboard.width)+1][rand(gameboard.height)+1];
        var tmp = p1.type;
        p1.type = p2.type;
        p2.type = tmp;

        tmp = p1.exist;
        p1.exist = p2.exist;
        p2.exist = tmp;
    }
    gameboard.lastpoint = null;
    gameboard.lastroad = null;
    gameboard.typearray = new Array();
    gameboard.initial_typearray();
    gameboard.drawboard();
}
var checkgameover = function(){
    if(gameboard.pointnum!=0){
        return;
    }
    var endtime = new Date();
    endtime = parseInt((endtime-gameboard.starttime)/1000);
    if(gameboard.best==null || gameboard.best>endtime){
        $("#newrecord").text("new record!");
        window.localStorage.setItem("score",endtime);
    }
    $("#score").text(endtime);
    if(gameboard.bartimerid){
        clearInterval(gameboard.bartimerid);
    }
    $("#myModal").modal();
}