$(document).ready(function(){
	$("video").hide();
	$(".switch").click(function(){
		$("video").slideToggle();
		$("#explain").slideToggle();
		$(".switch").toggle();
	})
})