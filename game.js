var mandelbrotShader;
var vertices = [
	-1, -1, 0,
	1, -1, 0,
	-1, 1, 0,
	1, 1, 0,
];

var vertexBuffer;
var locations = {};
var w_mat3;
var w_vec2;

var hammer;

var cameraVelocity = new Vector();
var cameraVelocityLerp = new Lerp2();

$(document).ready(function(){
	Monitor.setup({showTitle: false});
	// setup Gfw 
	Gfw.setup({height:256});
	Gfw.createCanvas("main", {"renderMode": RenderMode.Canvas3d});
	Gfw.getCanvas("main").setActive();
	Gfw.update = update;
	Gfw.render = render;
	// init
	init();
	// start
	Gfw.setBackgroundColor("#002");
	Gfw.start();
	
	Gfw.inputOverlay.off("touchstart");
	Gfw.inputOverlay.off("touchmove");
	Gfw.inputOverlay.off("touchend");
	
	Toast.info("Welcome to the Mandelbrot", 3);
	
});

var lastPinchEvent;
var pinchStartPosition;
var pinchStartZoom;
var panStartPosition;

function init(){
	
	hammer = new Hammer(Gfw.inputOverlay[0], {domEvents: true});
	hammer.get("pinch").set({enable:true});
	
	hammer.on("pinchstart", function(e){
		cameraVelocityLerp.stop();
		cameraVelocity.setFloats(0, 0);
		lastPinchEvent = e;
		pinchStartZoom = Gfw.camera.zoom;		
		pinchStartPosition = {x: Gfw.camera.position.x, y: Gfw.camera.position.y};
		cameraVelocity.x = cameraVelocity.y = 0;
	});
	hammer.on("pinchmove", function(e){
		console.log(e);
		var rotation = e.rotation - lastPinchEvent.rotation;
		var scale = e.scale - lastPinchEvent.scale;
		Gfw.camera.rotation -= rotation/180*Math.PI;
		Gfw.camera.zoom = pinchStartZoom * e.scale;
		lastPinchEvent = e;
	});
	hammer.on("panstart", function(e){
		cameraVelocityLerp.stop();
		cameraVelocity.setFloats(0, 0);
		panStartPosition = {x: Gfw.camera.position.x, y: Gfw.camera.position.y};
		cameraVelocity.x = cameraVelocity.y = 0;
	});
	hammer.on("panmove", function(e){
		var dx = (e.deltaX) / Gfw.scale / Gfw.camera.zoom;
		var dy = (e.deltaY) / Gfw.scale / Gfw.camera.zoom;
		var angle = Gfw.camera.rotation + Math.atan2(dy,dx);
		var length = Math.sqrt(dx*dx+dy*dy);
		dx = Math.cos(angle)*length;
		dy = Math.sin(angle)*length;
		Gfw.camera.position.x = panStartPosition.x - dx;
		Gfw.camera.position.y = panStartPosition.y - dy;
	});
	hammer.on("panend", function(e){
		var tresh = 10;
		var vel = Math.sqrt(e.velocityX*e.velocityX+e.velocityY*e.velocityY)*1000;
		if(vel > tresh){
			var diag = Math.sqrt(window.innerWidth*window.innerWidth+window.innerHeight*window.innerHeight);
			var vx = -e.velocityX * 1000 / Gfw.scale / Gfw.camera.zoom;
			var vy = -e.velocityY * 1000 / Gfw.scale / Gfw.camera.zoom;
			var angle = Gfw.camera.rotation + Math.atan2(vy,vx);
			var length = Math.sqrt(vx*vx+vy*vy);
			vx = Math.cos(angle)*length;
			vy = Math.sin(angle)*length;
			console.log(cameraVelocityLerp);
			var time = vel/diag*0.25;
			console.log(time);
			cameraVelocityLerp.start(vx, vy, 0, 0, time > 0.65 ? 0.65 : time);
		}
	});
	
	// buffers
	vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
	// shaders
	var source = document.querySelector("#vertex-shader").innerHTML;
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, source);
	gl.compileShader(vertexShader);
	source = document.querySelector("#fragment-shader").innerHTML
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, source);
	gl.compileShader(fragmentShader);
	mandelbrotShader = gl.createProgram();
	gl.attachShader(mandelbrotShader, vertexShader);
	gl.attachShader(mandelbrotShader, fragmentShader);
	gl.linkProgram(mandelbrotShader);
	gl.useProgram(mandelbrotShader);
	
	if(!gl.getProgramParameter(mandelbrotShader, gl.LINK_STATUS)) {
		var linkErrLog = gl.getProgramInfoLog(mandelbrotShader);
		console.log("Shader mandelbrotShader did not link successfully. " + "Error log: " + linkErrLog);
		var compilationLog = gl.getShaderInfoLog(vertexShader);
		if(compilationLog != "") console.log(compilationLog);
		compilationLog = gl.getShaderInfoLog(fragmentShader);
		if(compilationLog != "") console.log(compilationLog);
		return;
	}
	
	// shader locations
	locations.a_pos = gl.getAttribLocation(mandelbrotShader, "a_pos");
//	locations.u_mvp = gl.getUniformLocation(mandelbrotShader, "u_mvp");
	locations.u_green_off = gl.getUniformLocation(mandelbrotShader, "u_green_off");
	locations.u_transform = gl.getUniformLocation(mandelbrotShader, "u_transform");
	locations.u_iterations = gl.getUniformLocation(mandelbrotShader, "u_iterations");
	locations.u_hue_offset = gl.getUniformLocation(mandelbrotShader, "u_hue_offset");
	locations.u_hue_scale = gl.getUniformLocation(mandelbrotShader, "u_hue_scale");
	locations.u_smoothing = gl.getUniformLocation(mandelbrotShader, "u_smoothing");
	locations.u_fading = gl.getUniformLocation(mandelbrotShader, "u_fading");
	locations.u_fading_scale = gl.getUniformLocation(mandelbrotShader, "u_fading_scale");
	locations.u_saturation = gl.getUniformLocation(mandelbrotShader, "u_saturation");
	locations.u_saturation_scale = gl.getUniformLocation(mandelbrotShader, "u_saturation_scale");
	console.log(locations);
	
	// matrix
	w_mat3 = glMatrix.mat3.create();
	w_vec2 = glMatrix.vec2.create();
	
	Gfw.camera.zoom = 100;
	
	Ui.init();
	Mandelbrot.generateRandomBrot();
	
	var state = getUrlParameter("state");
	if(state !== null && state !== undefined && state !== ""){
		var json = $.parseJSON(state);
		console.log(json);
		Mandelbrot.loadState(json);
		Ui.applyValues();
	}
	
}

function update(){
	if(Input.isKeyDown(81)){
		Gfw.camera.rotation -= Time.deltaTime*1.25;
	} else if(Input.isKeyDown(69)){
		Gfw.camera.rotation += Time.deltaTime*1.25;
	}	
	Gfw.cameraMovement(250.0);
	if(Input.isKeyDown(37) || Ui.minus.numIterations){
		Mandelbrot.setNumIterations(Mandelbrot.state.numIterations-Mandelbrot.state.numIterations*Time.deltaTime*0.75);
	} else if(Input.isKeyDown(39) || Ui.plus.numIterations){
		Mandelbrot.setNumIterations(Mandelbrot.state.numIterations+Mandelbrot.state.numIterations*Time.deltaTime*075);
	}
	if(Input.isKeyDown(74) || Ui.minus.hueOffset){
		Mandelbrot.state.hueOffset = Mandelbrot.state.hueOffset-Time.deltaTime*0.2;
		Ui.applyValues();
	} else if(Input.isKeyDown(76) || Ui.plus.hueOffset){
		Mandelbrot.state.hueOffset = Mandelbrot.state.hueOffset+Time.deltaTime*0.2;
		Ui.applyValues();
	}
	if(Input.isKeyDown(75) || Ui.minus.hueScale){
		Mandelbrot.state.hueScale = Mandelbrot.state.hueScale-Time.deltaTime;
		Ui.applyValues();
	} else if(Input.isKeyDown(73) || Ui.plus.hueScale){
		Mandelbrot.state.hueScale = Mandelbrot.state.hueScale+Time.deltaTime;
		Ui.applyValues();
	}
	if(Input.isKeyDown(40) || Ui.minus.fadingScale){
		Mandelbrot.state.fadingScale = Numbers.clamp(Mandelbrot.state.fadingScale-Time.deltaTime, 0, Infinity);
		Ui.applyValues();
	} else if(Input.isKeyDown(38) || Ui.plus.fadingScale){
		Mandelbrot.state.fadingScale = Numbers.clamp(Mandelbrot.state.fadingScale+Time.deltaTime, 0, Infinity);
		Ui.applyValues();
	}
	if(Input.isKeyDown(40) || Ui.minus.saturationScale){
		Mandelbrot.state.saturationScale = Numbers.clamp(Mandelbrot.state.saturationScale-Time.deltaTime*0.5, 0, 1);
		Ui.applyValues();
	} else if(Input.isKeyDown(38) || Ui.plus.saturationScale){
		Mandelbrot.state.saturationScale = Numbers.clamp(Mandelbrot.state.saturationScale+Time.deltaTime*0.5, 0, 1);
		Ui.applyValues();
	}
	if(Ui.minus.hueTimerSpeed){
		Mandelbrot.state.hueTimerSpeed -= Time.deltaTime*0.05;
		Ui.applyValues();
	} else if(Ui.plus.hueTimerSpeed){
		Mandelbrot.state.hueTimerSpeed += Time.deltaTime*0.05;
		Ui.applyValues();
	}
	if(Mandelbrot.state.hueTimer && !Ui.hueOffsetFocus){
		Mandelbrot.state.hueOffset += Time.deltaTime * Mandelbrot.state.hueTimerSpeed;
	}
	while(Mandelbrot.state.hueOffset < 0){
		Mandelbrot.state.hueOffset += 1.0;
	}
	while(Mandelbrot.state.hueOffset > 1){
		Mandelbrot.state.hueOffset -= 1.0;
	}
	if(Mandelbrot.state.hueTimer && !Ui.hueOffsetFocus){
		$("input[type=text].hue-offset").val(roundToFixed(Mandelbrot.state.hueOffset, 3));
	}
	if(Input.matchSequence(Mandelbrot.saveSequence, 1)){
		Mandelbrot.saveState();
		Input.clearSequence();
	}
	if(Input.matchSequence(Mandelbrot.statesSequence, 1)){
		window.location = "states";
	}
	if(cameraVelocityLerp.running){
		cameraVelocityLerp.update();
		cameraVelocityLerp.apply(cameraVelocity);
	}
	Gfw.camera.position.x += cameraVelocity.x * Time.deltaTime;
	Gfw.camera.position.y += cameraVelocity.y * Time.deltaTime;
	// monitor stuffs
	Monitor.set("FPS", Time.fps);
//	Monitor.set("Time", roundToFixed(Time.sinceStart, 1));
	/*
	Monitor.set("Iterations", Math.floor(numIterations));
	Monitor.set("Smoothing", smoothing ? "On" : "Off");
	Monitor.set("HueTimer", hueTimer ? "On" : "Off");
	Monitor.set("hueScale", roundToFixed(hueScale,3));
	Monitor.set("HueOffset", roundToFixed(hueOffset,3));
	Monitor.set("Fading", fading == 0 ? "None" : (fading == 1 ? "Inner" : "Outer"));
	Monitor.set("FadingScale", roundToFixed(fadingScale, 3)); */
}

function render(){
	Colors.hslToRgb(Time.sinceStart*0.01, 0.5, 0.25);
	gl.clearColor(Colors.r, Colors.g, Colors.b, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);	
	// draw 
	gl.useProgram(mandelbrotShader);	
	// vertex attribute
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.vertexAttribPointer(locations.a_pos, 3, gl.FLOAT, false, 0, 0); 
	gl.enableVertexAttribArray(locations.a_pos);
	// color uniform
	gl.uniform1f(locations.u_green_off, Math.sin(Time.sinceStart)/2+0.5);
	// num iterations
	gl.uniform1i(locations.u_iterations, Math.floor(Mandelbrot.state.numIterations));
	// smoothing
	gl.uniform1i(locations.u_smoothing, Mandelbrot.state.smoothing ? 1 : 0);
	// border fading
	gl.uniform1i(locations.u_fading, Mandelbrot.state.fading);
	gl.uniform1f(locations.u_fading_scale, Mandelbrot.state.fadingScale);
	// saturation
	gl.uniform1i(locations.u_saturation, Mandelbrot.state.saturation);
	gl.uniform1f(locations.u_saturation_scale, Mandelbrot.state.saturationScale);
	// hue
	gl.uniform1f(locations.u_hue_offset, Mandelbrot.state.hueOffset);
	gl.uniform1f(locations.u_hue_scale, Mandelbrot.state.hueScale);
	// color matrix
	glMatrix.mat3.identity(w_mat3); 
	// mirror-y (again)
	glMatrix.vec2.set(w_vec2, 1, -1);
	glMatrix.mat3.scale(w_mat3, w_mat3, w_vec2);
	// camera translate
	glMatrix.vec2.set(w_vec2, Gfw.camera.position.x, Gfw.camera.position.y);
	glMatrix.mat3.translate(w_mat3, w_mat3, w_vec2);
	// camera zoom 
	glMatrix.vec2.set(w_vec2, 1.0/Gfw.camera.zoom, 1.0/Gfw.camera.zoom);
	glMatrix.mat3.scale(w_mat3, w_mat3, w_vec2);
	// camera rotation 
	glMatrix.mat3.rotate(w_mat3, w_mat3, Gfw.camera.rotation);
	// gfw scale and mirror-y
	glMatrix.vec2.set(w_vec2, 1/Gfw.scale, -1/Gfw.scale);
	glMatrix.mat3.scale(w_mat3, w_mat3, w_vec2);
	// translate to center
	glMatrix.vec2.set(w_vec2, -window.innerWidth/2.0, -window.innerHeight/2.0);
	glMatrix.mat3.translate(w_mat3, w_mat3, w_vec2);
	// camera movement
	// apply matrix
	gl.uniformMatrix3fv(locations.u_transform, false, w_mat3);
	// draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}





































