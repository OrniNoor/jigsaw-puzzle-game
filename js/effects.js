$(document).ready(function() {
$('.lesson-title,.level-name,.lesson-name, .read').hover(function() {
  $(this).toggleClass('glow');
});	

 //check page
	 var href = document.location.href;
var lastPathSegment = href.substr(href.lastIndexOf('/') + 1);
	 if(lastPathSegment == "2x2.php"){
		
		 $("#easy").addClass('selected');
	 }
	 else if(lastPathSegment == "3x3.php"){
		
		 $("#medium").addClass('selected');
	 }
	 else if(lastPathSegment == "4x4.php"){
		
		 $("#hard").addClass('selected');
	 }
	 
	 //pixie dust
		var fadeDelay = 100;
	var fadeDuration = 300;
    $(document).click(function(e){
		var div = $('<div class="click-wrapper">')
			.css({
				"left": e.pageX + 'px',
				"top": e.pageY + 'px'
			})
			.append($('<img src="images/giphy.gif" alt="myimage" width="300" height="300"/>'))
			.appendTo(document.body);
				
		setTimeout(function() {
			div.addClass('fade-out');			
			setTimeout(function() { div.remove(); }, fadeDuration);
		}, fadeDelay);
    });
	
});