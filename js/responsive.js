$(document).ready(function() {
window.onerror = function() {

}
refHeight=window.innerHeight;
var selectedImage,ratio=window.devicePixelRatio;
if(window.innerWidth<901){
	if(ratio>1){
		selectedImage="images/puzzle/420x300.png";
	
	}
	else{
    selectedImage="images/puzzle/210x150.png";	
	}
}
else{
		if(refHeight<700){
	if(ratio>1){
		selectedImage="images/puzzle/560x400.png";
	
	}
	else{
    selectedImage="images/puzzle/280x200.png";	
	}
}
	if(refHeight>=700 && refHeight<800){
	if(ratio>1){
		selectedImage="images/puzzle/600x428.png";
	
	}
	else{
    selectedImage="images/puzzle/300x214.png";	
	}
}
if(refHeight>=800 && refHeight<901){
	if(ratio>1){
		selectedImage="images/puzzle/700x500.png";
	
	}
	else{
    selectedImage="images/puzzle/350x250.png";	
	}
}
if(refHeight>=901 && refHeight < 1001){
					if(ratio>1){
		selectedImage="images/puzzle/800x570.png";
	
	}
	else{
    selectedImage="images/puzzle/400x285.png";	
	}
				}
				if(refHeight>=1001 && refHeight < 1200){
					if(ratio>1){
		selectedImage="images/puzzle/980x700.png";
	
	}
	else{
    selectedImage="images/puzzle/490x350.png";	
	}
				}
			
					if(refHeight>=1200 && refHeight < 1400){
					if(ratio>1){
		selectedImage="images/puzzle/1100x700.png";
	
	}
	else{
    selectedImage="images/puzzle/550x350.png";	
	}
				}
			
			if(refHeight>=1400 && refHeight < 2000){
					if(ratio>1){
		selectedImage="images/puzzle/1300x900.png";
	
	}
	else{
    selectedImage="images/puzzle/650x450.png";	
	}
				}
				if(refHeight>=2000){
					if(ratio>1){
		selectedImage="images/puzzle/1580x1010.png";
	
	}
	else{
    selectedImage="images/puzzle/790x505.png";	
	}
				}

}
var jsaw = new jigsaw.Jigsaw({
        defaultImage: selectedImage,
        spread: .5,
        piecesNumberTmpl: "%d Pieces"
    });
    if (jigsaw.GET["image"]) { jsaw.set_image(jigsaw.GET["image"]); }
 if(document.getElementById("modal-window").className == "modal"){
	  var audio = new Audio('music.mp3');
                         audio.play();
	  }
    if((window.innerWidth>=768 && window.innerWidth <1025) && window.innerWidth< window.innerHeight ){
		screen.orientation.lock('landscape');
	    console.log("triggered");
	}
	  
	document.getElementById("body-container").style.height=$("body").height()- $("header").height() + "px";
	var navHeight=parseInt($("#nav-wrapper").height())-20;

	var marginHeight=120;
		var liHeight=Math.floor((navHeight-marginHeight)/6);
	
	$(".li-flex").css({"height": liHeight+"px", "margin-top": "20px"});

	var winHeight=document.getElementById("sidenav").clientHeight;
		
	 document.getElementById("progress-wrapper").style.height=winHeight+20+"px";
	 document.getElementById("game-container").style.height=parseInt(winHeight)+"px";
	 document.getElementById("canvas").height=parseInt(document.getElementById("game-container").style.height)*window.devicePixelRatio;
	 document.getElementById("canvas").style.height=document.getElementById("game-container").style.height;
	var gbtns=document.getElementsByClassName("gbtn");
	
    gbtns[0].style.height= gbtns[1].style.height= gbtns[2].style.height= gbtns[3].style.height=parseInt(document.getElementById("game-buttons").clientHeight)/4+"px";
	
	//console.log(document.getElementById("sidenav").clientWidth+"h:"+document.getElementById("sidenav").clientHeight+" "+window.innerHeight);

	 
	 
	 
	 
	 //sparkle
/* 	 $(".lesson-title,.level-name,.lesson-name,.gbtn,#clock").sparkle({
  color: "#FFFFFF",
  count: 30,
  overlap: 0,
  speed: 1,
  minSize: 4,
  maxSize: 7,
  direction: "both"
}); */
window.onresize = function(){ location.reload(); }
});
function redirect(){
window.location.href="2x2.html";
}