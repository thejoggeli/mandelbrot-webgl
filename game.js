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
var numIterations = 40.0;
var hueOffset = 0.575;
var hueRange = 0.1;
var hueTimer = true;
var smoothing = true;

$(document).ready(function(){
	Monitor.setup();
	Monitor.label("Info");
	Monitor.set("Fps", "");
	Monitor.set("Time", "");
	Monitor.label("Camera");
	Monitor.set("Position");
	Monitor.set("Zoom");
	Monitor.label("Mandelbrot");
	Controls.setup();
	Controls.label("Camera");
	Controls.add("Move", "[W][A][S][D]");
	Controls.add("Zoom", "[R][F]");
	Controls.add("Rotate", "[Q][E]");
	Controls.label("Mandelbrot");
	Controls.add("Iterations", "[&larr;][&rarr;]");
	Controls.add("Smoothing", "[P]");
	Controls.add("HueTimer", "[O]");
	Controls.add("HueRange", "[1][2]");
	Controls.add("HueOffset", "[3][4]");
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
	locations.u_hue_range = gl.getUniformLocation(mandelbrotShader, "u_hue_range");
	locations.u_smoothing = gl.getUniformLocation(mandelbrotShader, "u_smoothing");
	console.log(locations);
	
	// matrix
	w_mat3 = glMatrix.mat3.create();
	w_vec2 = glMatrix.vec2.create();
	
	Gfw.camera.zoom = 100;
	hueRange = randomFloat(0.1, 1.0);
	hueOffset = randomFloat(0.0, 1.0);
	numIterations = randomInt(16,24);
	
}

function update(){
	if(Input.isKeyDown(81)){
		Gfw.camera.rotation -= Time.deltaTime;
	} else if(Input.isKeyDown(69)){
		Gfw.camera.rotation += Time.deltaTime;
	}	
	Gfw.cameraMovement(250.0);
	if(Input.isKeyDown(37)){
		numIterations = Numbers.clamp(numIterations-numIterations*Time.deltaTime, 0, 1000);
	} else if(Input.isKeyDown(39)){
		numIterations = Numbers.clamp(numIterations+numIterations*Time.deltaTime, 0, 1000);	
	}
	if(Input.isKeyDown(51)){
		hueOffset = hueOffset-Time.deltaTime*0.2;
	} else if(Input.isKeyDown(52)){
		hueOffset = hueOffset+Time.deltaTime*0.2;
	}
	if(Input.isKeyDown(49)){
		hueRange = Numbers.clamp(hueRange-Time.deltaTime, -100, 100);
	} else if(Input.isKeyDown(50)){
		hueRange = Numbers.clamp(hueRange+Time.deltaTime, -100, 100);
	}		
	if(Input.keyDown(80)){
		smoothing = !smoothing;
	}		
	if(Input.keyDown(79)){
		hueTimer = !hueTimer;
	}
	if(hueTimer) hueOffset += Time.deltaTime * 0.035;
	hueOffset = (hueOffset-Time.deltaTime*0.2);
	hueOffset = (hueOffset+Time.deltaTime*0.2)%1.0;
	// monitor stuffs
	Monitor.set("Fps", Time.fps);
	Monitor.set("Time", roundToFixed(Time.sinceStart, 1));
	Monitor.set("Position", Gfw.camera.position.x.toExponential(2) + "/"+ Gfw.camera.position.y.toExponential(2));
	Monitor.set("Zoom", Gfw.camera.zoom.toExponential(2));
	Monitor.set("Iterations", Math.floor(numIterations));
	Monitor.set("Smoothing", smoothing ? "On" : "Off");
	Monitor.set("HueTimer", hueTimer ? "On" : "Off");
	Monitor.set("HueRange", roundToFixed(hueRange,3));
	Monitor.set("HueOffset", roundToFixed(hueOffset,3));
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
	// hue
	gl.uniform1f(locations.u_hue_offset, hueOffset);
	gl.uniform1f(locations.u_hue_range, hueRange);
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




































