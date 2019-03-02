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
var numIterations = 20.0;
var hueOffset = 0.575;
var hueScale = 0.1;
var hueTimer = true;
var hueTimerSpeed = 0.035;
var smoothing = true;
var fading = 0;
var fadingScale = 1.0;
var saturation = 0;
var saturationScale = 1.0;

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
});

function init(){
	
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
	
	ui_init();
	generateRandomBrot();
	
}

function generateRandomBrot(){
	hueScale = randomFloat(0.1, 1.0);
	hueOffset = randomFloat(0.0, 1.0);
	fading = randomInt(0,3);
	fadingScale = randomFloat(0.5, 1.5);
	saturation = randomInt(0,3);
	if(randomFloat(0,100) < 25.0){
		saturationScale = randomFloat(0, 1);	
	} else {
		saturationScale = randomFloat(0.666-0.2, 0.666+0.2);
	}
	hueTimerSpeed = randomFloat(0.02, 0.05);
	ui_apply_values();
}

function generateMutateBrot(){
	var strength = 0.1;
	setNumIterations(numIterations+numIterations*randomFloat(-strength, strength));
	hueScale += hueScale * randomFloat(-strength, strength);
	hueOffset += randomFloat(-0.05, 0.05);
	fadingScale += fadingScale * randomFloat(-strength, strength);
	saturationScale = Numbers.clamp(fadingScale + randomFloat(-0.05, 0.05), 0, 1);
	hueTimerSpeed += hueTimerSpeed * randomFloat(-strength, strength);
	ui_apply_values();
}

function setNumIterations(num){
	numIterations = Numbers.clamp(num, 0, 99999);	
	ui_apply_values();
}

function update(){
	if(Input.isKeyDown(81)){
		Gfw.camera.rotation -= Time.deltaTime*1.25;
	} else if(Input.isKeyDown(69)){
		Gfw.camera.rotation += Time.deltaTime*1.25;
	}	
	Gfw.cameraMovement(250.0);
	if(Input.isKeyDown(37) || uiMinus.numIterations){
		setNumIterations(numIterations-numIterations*Time.deltaTime, 0, 50000);
	} else if(Input.isKeyDown(39) || uiPlus.numIterations){
		setNumIterations(numIterations+numIterations*Time.deltaTime, 0, 50000);
	}
	if(Input.isKeyDown(74) || uiMinus.hueOffset){
		hueOffset = hueOffset-Time.deltaTime*0.2;
		ui_apply_values();
	} else if(Input.isKeyDown(76) || uiPlus.hueOffset){
		hueOffset = hueOffset+Time.deltaTime*0.2;
		ui_apply_values();
	}
	if(Input.isKeyDown(75) || uiMinus.hueScale){
		hueScale = Numbers.clamp(hueScale-Time.deltaTime, -100, 100);
		ui_apply_values();
	} else if(Input.isKeyDown(73) || uiPlus.hueScale){
		hueScale = Numbers.clamp(hueScale+Time.deltaTime, -100, 100);
		ui_apply_values();
	}
	if(Input.isKeyDown(40) || uiMinus.fadingScale){
		fadingScale = Numbers.clamp(fadingScale-Time.deltaTime, 0, 100);
		ui_apply_values();
	} else if(Input.isKeyDown(38) || uiPlus.fadingScale){
		fadingScale = Numbers.clamp(fadingScale+Time.deltaTime, 0, 100);
		ui_apply_values();
	}
	if(Input.isKeyDown(40) || uiMinus.saturationScale){
		saturationScale = Numbers.clamp(saturationScale-Time.deltaTime*0.5, 0, 1);
		ui_apply_values();
	} else if(Input.isKeyDown(38) || uiPlus.saturationScale){
		saturationScale = Numbers.clamp(saturationScale+Time.deltaTime*0.5, 0, 1);
		ui_apply_values();
	}
	if(uiMinus.hueTimerSpeed){
		hueTimerSpeed -= Time.deltaTime*0.05;
		ui_apply_values();
	} else if(uiPlus.hueTimerSpeed){
		hueTimerSpeed += Time.deltaTime*0.05;
		ui_apply_values();
	}
	if(hueTimer){
		hueOffset += Time.deltaTime * hueTimerSpeed;
	}
	hueOffset = (hueOffset-Time.deltaTime*0.2);
	hueOffset = (hueOffset+Time.deltaTime*0.2)%1.0;
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
	gl.uniform1i(locations.u_iterations, Math.floor(numIterations));
	// smoothing
	gl.uniform1i(locations.u_smoothing, smoothing ? 1 : 0);
	// border fading
	gl.uniform1i(locations.u_fading, fading);
	gl.uniform1f(locations.u_fading_scale, fadingScale);
	// saturation
	gl.uniform1i(locations.u_saturation, saturation);
	gl.uniform1f(locations.u_saturation_scale, saturationScale);
	// hue
	gl.uniform1f(locations.u_hue_offset, hueOffset);
	gl.uniform1f(locations.u_hue_scale, hueScale);
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




































