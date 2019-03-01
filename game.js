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

$(document).ready(function(){
	Monitor.setup();
//	Controls.setup();
//	Controls.add("move", "w,a,s,d");
//	Controls.add("zoom", "r,f");
	// setup Gfw 
	Gfw.setup({height:256});
	Gfw.createCanvas("main", {"renderMode": RenderMode.Canvas3d});
	Gfw.getCanvas("main").setActive();
	Gfw.update = update;
	Gfw.render = render;
	// init
	init();
	// start
	Gfw.camera.zoom = 100;
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
	console.log(locations);
	
	// matrix
	w_mat3 = glMatrix.mat3.create();
	w_vec2 = glMatrix.vec2.create();
	
}

function update(){
	Gfw.cameraMovement(500.0);
	// monitor stuffs	
	Monitor.set("fps", Time.fps);
	Monitor.set("time", roundToFixed(Time.sinceStart, 1));
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
	// color matrix
	glMatrix.mat3.identity(w_mat3);
	// gfw scale
	glMatrix.vec2.set(w_vec2, 1/Gfw.scale, 1/Gfw.scale);
	glMatrix.mat3.scale(w_mat3, w_mat3, w_vec2);
	// camera movement
	glMatrix.vec2.set(w_vec2, Gfw.camera.position.x, -Gfw.camera.position.y);
	glMatrix.mat3.translate(w_mat3, w_mat3, w_vec2);
	// camera zoom 
	glMatrix.vec2.set(w_vec2, 1.0/Gfw.camera.zoom, 1.0/Gfw.camera.zoom);
	glMatrix.mat3.scale(w_mat3, w_mat3, w_vec2);
	// camera rotation 
	glMatrix.mat3.rotate(w_mat3, w_mat3, Gfw.camera.rotation);
	// translate to center
	glMatrix.vec2.set(w_vec2, -window.innerWidth/2.0, -window.innerHeight/2.0);
	glMatrix.mat3.translate(w_mat3, w_mat3, w_vec2);
	// apply matrix
	gl.uniformMatrix3fv(locations.u_transform, false, w_mat3);
	// draw
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}




































