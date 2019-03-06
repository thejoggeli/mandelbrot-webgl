function Mandelbrot(){}
Mandelbrot.state = {
	numIterations: 20.0,
	hueOffset: 0.575,
	hueScale: 0.1,
	hueTimer: true,
	hueTimerSpeed: 0.035,
	smoothing: true,
	fading: 0,
	fadingScale: 1.0,
	saturation: 0,
	saturationScale: 1.0,	
};
Mandelbrot.saveSequence = [48, 48];
Mandelbrot.statesSequence = [57, 57];
Mandelbrot.loadState = function(state){
	for(var key in state){
		if(key === "camera") continue;
		Mandelbrot.state[key] = state[key];
	}
	if(state.camera !== undefined){
		Gfw.camera.position.x = state.camera.position.x;
		Gfw.camera.position.y = state.camera.position.y;
		Gfw.camera.position.z = state.camera.position.z;
		Gfw.camera.zoom = state.camera.zoom;
		Gfw.camera.rotation = state.camera.rotation;
	}
}
Mandelbrot.saveState = function(){
	var json = {};
	for(var x in Mandelbrot.state){
		json[x] = Mandelbrot.state[x];
	}
	json.camera = {
		position: {
			x: Gfw.camera.position.x,
			y: Gfw.camera.position.y,
			z: Gfw.camera.position.z,
		},
		zoom: Gfw.camera.zoom,
		rotation: Gfw.camera.rotation,
	};	
	console.log(json);
	$.ajax({
		url: "ajax/save-state.php",
		type: "post",
		data: {state: JSON.stringify(json)},
	}).done(function(json){
		console.log(json);
		if(json.error !== undefined){
			console.error(json.error);
			if(json.message !== undefined){
				Toast.error(json.message, 2.0);
			} else {
				Toast.error("Couldn't save state", 2.0);
			}
		} else {
			var str = "State saved";
			if(json.name !== null) str += "<br>"+json.name;
			if(json.ip !== null) str += "<br>"+json.ip;
		Toast.success(str, 2.0);		
		}
	}).fail(function(data){
		console.error(data);
		Toast.error("Couldn't save state", 2.0);		
	});	
}

Mandelbrot.generateRandomBrot = function(){
	var random = randomFloat(0,100);
	if(random > 15.0){
		Mandelbrot.state.hueScale = randomFloat(-1.0, 1.0);
	} else if(random > 5.0){
		Mandelbrot.state.hueScale = randomFloat(-4, 4);		
	} else {
		Mandelbrot.state.hueScale = randomFloat(-8, 8);		
	}
	Mandelbrot.state.hueOffset = randomFloat(0.0, 1.0);
	Mandelbrot.state.fading = randomInt(0,3);
	Mandelbrot.state.fadingScale = randomFloat(0.5, 1.5);
	Mandelbrot.state.saturation = randomInt(0,3);
	if(randomFloat(0,100) < 25.0){
		Mandelbrot.state.saturationScale = randomFloat(0, 1);	
	} else {
		Mandelbrot.state.saturationScale = randomFloat(0.666-0.2, 0.666+0.2);
	}
	Mandelbrot.state.hueTimerSpeed = randomFloat(0.02, 0.05);
	Ui.applyValues();
	Toast.info("The Mandelbrot just got randomized", 2.5);
}

Mandelbrot.generateMutateBrot = function(){
	var strength = 0.1;
	Mandelbrot.setNumIterations(Mandelbrot.state.numIterations+Mandelbrot.state.numIterations*randomFloat(-strength, strength));
	Mandelbrot.state.hueScale += Mandelbrot.state.hueScale * randomFloat(-strength, strength);
	Mandelbrot.state.hueOffset += randomFloat(-0.05, 0.05);
	Mandelbrot.state.fadingScale += Mandelbrot.state.fadingScale * randomFloat(-strength, strength);
	Mandelbrot.state.saturationScale = Numbers.clamp(Mandelbrot.state.saturationScale + randomFloat(-0.05, 0.05), 0, 1);
	Mandelbrot.state.hueTimerSpeed += Mandelbrot.state.hueTimerSpeed * randomFloat(-strength, strength);
	Ui.applyValues();
	Toast.info("The Mandelbrot mutated", 2.5);
}

Mandelbrot.setNumIterations = function(num){
	Mandelbrot.state.numIterations = Numbers.clamp(num, 0, 5000);	
	Ui.applyValues();
}
