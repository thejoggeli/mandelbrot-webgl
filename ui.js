function Ui(){}

Ui.plus = {};
Ui.minus = {};
Ui.hueOffsetFocus = false;

Ui.init = function(){
	$(".single").on("click", function(){
		var group = $(this).data("group");
		$(".single[data-group="+group+"]").removeClass("active");
		$(this).addClass("active");
	});
	$(".smoothing").on("click", function(e){
		var old = Mandelbrot.state.smoothing;
		Mandelbrot.state.smoothing = $(this).data("val") == "on";
		if(old != Mandelbrot.state.smoothing) Ui.applyValues();
	});
	$(".hue-timer").on("click", function(e){
		var old = Mandelbrot.state.hueTimer;
		Mandelbrot.state.hueTimer = $(this).data("val") == "on";
		if(old != Mandelbrot.state.hueTimer) Ui.applyValues();
	});
	$(".fading").on("click", function(e){
		var old = Mandelbrot.state.fading;
		Mandelbrot.state.fading = parseInt($(this).data("val"));
		if(old != Mandelbrot.state.fading) Ui.applyValues();
	});
	$(".saturation").on("click", function(e){
		var old = Mandelbrot.state.saturation;
		Mandelbrot.state.saturation = parseInt($(this).data("val"));
		if(old != Mandelbrot.state.saturation) Ui.applyValues();
	});
	$("button.numbers[data-val='plus']").on("mousedown touchstart", function(e){
		Ui.plus[$(this).data("group")] = true;
		abortEvent(e);
	});
	$("button.numbers[data-val='plus']").on("mouseup mouseleave touchend", function(e){
		Ui.plus[$(this).data("group")] = false;
		abortEvent(e);
	});
	$("button.numbers[data-val='minus']").on("mousedown touchstart", function(e){
		Ui.minus[$(this).data("group")] = true;
		abortEvent(e);
	});
	$("button.numbers[data-val='minus']").on("mouseup mouseleave touchend", function(e){
		Ui.minus[$(this).data("group")] = false;
		abortEvent(e);
	});
	$("input[type=text].numbers").each(function(){
		Ui.plus[$(this).data("group")] = false;
		Ui.minus[$(this).data("group")] = false;
	});
	$("input[type=text].numbers").on("keyup change", function(){
		var val = Ui.clampNumbers($(this));
		Mandelbrot.state[$(this).data("group")] = val;
	});
	$(".random-brot").on("click", function(){
		Mandelbrot.generateRandomBrot();
	});
	$(".mutate-brot").on("click", function(){
		Mandelbrot.generateMutateBrot();
	});
	$("button.num-iterations[data-val='plus']").on("click", function(){
		Mandelbrot.setNumIterations(Math.floor(Mandelbrot.state.numIterations+1)+0.5);
	});
	$("button.num-iterations[data-val='minus']").on("click", function(){
		Mandelbrot.setNumIterations(Math.floor(Mandelbrot.state.numIterations-1)+0.5);
	});
	$("button.num-iterations").on("blur", function(){
		Mandelbrot.setNumIterations(Math.floor(Mandelbrot.state.numIterations-1)+0.5);
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
		Ui.hueOffsetFocus = true;		
	});
	$(".hue-offset").on("blur", function(){
		Ui.hueOffsetFocus = false;
		while(Mandelbrot.state.hueOffset < 0){
			Mandelbrot.state.hueOffset += 1.0;
		}
		while(Mandelbrot.state.hueOffset > 1){
			Mandelbrot.state.hueOffset -= 1.0;
		}
		$("input[type=text].hue-offset").val(roundToFixed(Mandelbrot.state.hueOffset, 3));	
	});
	$(".save-state").on("click", function(){
		Mandelbrot.saveState();
	});
}

Ui.clampNumbers = function($input){
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

Ui.applyValues = function(){
	$(".smoothing[data-val='" +  (Mandelbrot.state.smoothing ? "on" : "off") + "']").trigger("click");
	$(".hue-timer[data-val='" +  (Mandelbrot.state.hueTimer ? "on" : "off") + "']").trigger("click");
	$(".fading[data-val='"+Mandelbrot.state.fading+"']").trigger("click");
	$(".saturation[data-val='"+Mandelbrot.state.saturation+"']").trigger("click");
	$("input[type=text].hue-scale").val(roundToFixed(Mandelbrot.state.hueScale, 3));
	$("input[type=text].hue-offset").val(roundToFixed(Mandelbrot.state.hueOffset, 3));
	$("input[type=text].num-iterations").val(Math.floor(Mandelbrot.state.numIterations));
	$("input[type=text].fading-scale").val(roundToFixed(Mandelbrot.state.fadingScale, 3));
	$("input[type=text].saturation-scale").val(roundToFixed(Mandelbrot.state.saturationScale, 3));
	$("input[type=text].hue-timer-speed").val(roundToFixed(Mandelbrot.state.hueTimerSpeed, 3));
	$(".fading-scale").prop("disabled", Mandelbrot.state.fading == 0);
	$(".hue-timer-speed").prop("disabled", Mandelbrot.state.hueTimer == false);
}
