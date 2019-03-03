var uiPlus = {};
var uiMinus = {};
var hueOffsetFocus = false;

function ui_init(){
	$(".single").on("click", function(){
		var group = $(this).data("group");
		$(".single[data-group="+group+"]").removeClass("active");
		$(this).addClass("active");
	});
	$(".smoothing").on("click", function(e){
		var old = smoothing;
		smoothing = $(this).data("val") == "on";
		if(old != smoothing) ui_apply_values();
	});
	$(".hue-timer").on("click", function(e){
		var old = hueTimer;
		hueTimer = $(this).data("val") == "on";
		if(old != hueTimer) ui_apply_values();
	});
	$(".fading").on("click", function(e){
		var old = fading;
		fading = parseInt($(this).data("val"));
		if(old != fading) ui_apply_values();
	});
	$(".saturation").on("click", function(e){
		var old = saturation;
		saturation = parseInt($(this).data("val"));
		if(old != saturation) ui_apply_values();
	});
	$("button.numbers[data-val='plus']").on("mousedown touchstart", function(e){
		uiPlus[$(this).data("group")] = true;
		abortEvent(e);
	});
	$("button.numbers[data-val='plus']").on("mouseup mouseleave touchend", function(e){
		uiPlus[$(this).data("group")] = false;
		abortEvent(e);
	});
	$("button.numbers[data-val='minus']").on("mousedown touchstart", function(e){
		uiMinus[$(this).data("group")] = true;
		abortEvent(e);
	});
	$("button.numbers[data-val='minus']").on("mouseup mouseleave touchend", function(e){
		uiMinus[$(this).data("group")] = false;
		abortEvent(e);
	});
	$("input[type=text].numbers").each(function(){
		uiPlus[$(this).data("group")] = false;
		uiMinus[$(this).data("group")] = false;
	});
	$("input[type=text].numbers").on("keyup change", function(){
		var val = ui_clamp_numbers($(this));
		window[$(this).data("group")] = val;
	});
	$(".random-brot").on("click", function(){
		generateRandomBrot();
	});
	$(".mutate-brot").on("click", function(){
		generateMutateBrot();
	});
	$("button.num-iterations[data-val='plus']").on("click", function(){
		setNumIterations(Math.floor(numIterations+1)+0.5);
	});
	$("button.num-iterations[data-val='minus']").on("click", function(){
		setNumIterations(Math.floor(numIterations-1)+0.5);
	});
	$("button.num-iterations").on("blur", function(){
		setNumIterations(Math.floor(numIterations-1)+0.5);
	});
	$(".minimize").on("click", function(){
		$(".minimize").hide();
		$(".maximize").show();
		$("#left-anchor-2 .category").hide();
		Gfw.inputOverlay.focus();
	});
	$(".maximize").on("click", function(){
		$(".minimize").show();
		$(".maximize").hide();
		$("#left-anchor-2 .category").show();
		Gfw.inputOverlay.focus();
	});
	$("#left-anchor-2 button").on("click", function(){
		Gfw.inputOverlay.focus();
	});
	$("#left-anchor-2").show();
	$(".hue-offset").on("focus", function(){
		hueOffsetFocus = true;		
	});
	$(".hue-offset").on("blur", function(){
		hueOffsetFocus = false;
		while(hueOffset < 0){
			hueOffset += 1.0;
		}
		while(hueOffset > 1){
			hueOffset -= 1.0;
		}
		$("input[type=text].hue-offset").val(roundToFixed(hueOffset, 3));	
	});
}

function ui_clamp_numbers($input){
	var val = parseFloat($input.val());
	var max = $input.data("max");
	var min = $input.data("min");
	console.log(val, min, max);
	if(max !== null && max !== undefined){
		max = parseFloat(max);
		if(!isNaN(max) && val > max){
			val = max;
			$input.val(max);
			return max;
		}
	}
	if(min !== null && min !== undefined){
		min = parseFloat(min);
		if(!isNaN(min) && val < min){
			val = min;
			$input.val(min);
			return min;
		}
	}
	return val;
}

function abortEvent(e){	
/*	e.preventDefault && e.preventDefault();
	e.stopPropagation && e.stopPropagation();
	e.cancelBubble = true;
	e.returnValue = false; */
}

function ui_apply_values(){
	$(".smoothing[data-val='" +  (smoothing ? "on" : "off") + "']").trigger("click");
	$(".hue-timer[data-val='" +  (hueTimer ? "on" : "off") + "']").trigger("click");
	$(".fading[data-val='"+fading+"']").trigger("click");
	$(".saturation[data-val='"+saturation+"']").trigger("click");
	$("input[type=text].hue-scale").val(roundToFixed(hueScale, 3));
	$("input[type=text].hue-offset").val(roundToFixed(hueOffset, 3));
	$("input[type=text].num-iterations").val(Math.floor(numIterations));
	$("input[type=text].fading-scale").val(roundToFixed(fadingScale, 3));
	$("input[type=text].saturation-scale").val(roundToFixed(saturationScale, 3));
	$("input[type=text].hue-timer-speed").val(roundToFixed(hueTimerSpeed, 3));
	$(".fading-scale").prop("disabled", fading == 0);
	$(".hue-timer-speed").prop("disabled", hueTimer == false);
}
