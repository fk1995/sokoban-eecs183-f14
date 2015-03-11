$(document).ready(function(){
	$("#level div div").hide();
	$("#back").hide();
	document.current = "menu"
	var showMenu = function (){
		var stopAnimation = function(){
			$("#button_start").finish();
			$("#button_level").finish();
			$("#button_htp").finish();
			$(".b").hide();
		}
		var wait = 1;
		wait = 1;
		if (document.current == "level"){
			$("#level div div").fadeOut(1000);
			$("#back").fadeOut(1000);
			wait = 0
		}
		document.current = "menu";
		$(".b").hide();
		$("#button_start").delay(1500 - 1000 * wait).fadeIn(500);
		$("#button_level").delay(2000 - 1000 * wait).fadeIn(500);
		$("#button_htp").delay(2500 - 1000 * wait).fadeIn(500);
		$("#button_level").delay(2000 - 1000 * wait).click(function(){
			stopAnimation();
			showLevel();
		})
	}
	var showLevel = function(){
		var stopAnimation = function(){
			$("#eb").finish();
			$("#el").finish();
			$("#mb").finish();
			$("#ml").finish();
			$("#hb").finish();
			$("#hl").finish();
			$("#back").finish();
		}
		if (document.current == "menu"){
			$(".b").fadeOut(1000);
		}
		document.current = "level";
		$("#back").show();
		$("#eb").addClass(".l").fadeIn(400);
		$("#mb").delay(300).addClass(".l").fadeIn(400);
		$("#hb").delay(600).addClass(".l").fadeIn(400);
		if (!document.dropItem)
			document.dropItem = "easy";
		switch (document.dropItem){
			case "easy":$("#el").delay(900).addClass(".l").slideDown(400);break;
			case "medium":$("#ml").delay(900).addClass(".l").slideDown(400);break;
			case "hard":$("#hl").delay(900).addClass(".l").slideDown(400);break;
		}
		$("#el div").delay(900).addClass(".l").show();
		$("#hl div").delay(900).addClass(".l").show();
		$("#ml div").delay(900).addClass(".l").show();
		$("#back").click(function(){
			stopAnimation();
			showMenu();
		});
		$("#eb").click(function(){
			if (document.dropItem == "easy"){
				return;
			}
			stopAnimation();
			$("#ml").slideUp();
			$("#hl").slideUp();
			$("#el").slideDown();
			document.dropItem = "easy";
		});
		$("#mb").click(function(){
			if (document.dropItem == "medium"){
				return;
			}
			stopAnimation();
			$("#ml").slideDown();
			$("#hl").slideUp();
			$("#el").slideUp();
			document.dropItem = "medium";
		});
		$("#hb").click(function(){
			if (document.dropItem == "hard"){
				return;
			}
			stopAnimation();
			$("#ml").slideUp();
			$("#hl").slideDown();
			$("#el").slideUp();
			document.dropItem = "hard";
		});
	}
	showMenu();
})