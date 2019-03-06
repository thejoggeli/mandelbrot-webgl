<!DOCTYPE html>
<html><head>
	<title>Mandelbrot GmbH</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
	<script src="jquery-3.2.1.min.js"></script>
	<script src="gl-matrix/dist/gl-matrix.js"></script>
	<script src="ui.js"></script>
	<script src="gfw.js"></script>
	<script src="mandelbrot.js"></script>
	<script src="game.js"></script>
	<script src="hammer.min.js"></script>
	<link rel="stylesheet" type="text/css" href="gfw.css">
	<link rel="stylesheet" type="text/css" href="game.css">
	<?php require_once("shaders.php") ?>
</head><body>
	<div id="left-anchor" class="noselect">
		<div id="monitor-box">
			<div class="monitor-header">Monitor</div>
		</div>
		<div id="controls-box">
			<div class="controls-header">Controls</div>
		</div>
		<button class="save-state" style="display:none">Save state</button>
	</div>
	<div class="toast">
		<div class="inner">
			<span class="toast-text">Toast</div>
		</div>
	</div>
	<div id="left-anchor-2" style="display:none">
		<div class="maximize">+</div>
		<div class="category">
			<div class="title">Smoothing<div class="minimize">-</div></div>
			<div class="row">
				<span class="label">State</span>
				<button class="smoothing single" data-group="smoothing" data-val="on">On</button>
				<button class="smoothing single" data-group="smoothing" data-val="off">Off</button>
			</div>
		</div>
		<div class="category">
			<div class="title">Iterations</div>
			<div class="row">
				<span class="label">Count</span>
				<button class="num-iterations numbers" data-group="numIterations" data-val="minus" title="Decrease  (Left)">-</button>
				<input type="text" class="num-iterations numbers" data-group="numIterations" data-min="0" data-max="5000">
				<button class="num-iterations numbers" data-group="numIterations" data-val="plus" title="Increase (Right)">+</button>
			</div>
		</div>
		<div class="category">
			<div class="title">Hue</div>
			<div class="row">
				<span class="label">Range</span>
				<button class="hue-scale numbers" data-group="hueScale" data-val="minus" title="Decrease (k)">-</button>
				<input type="text" class="hue-scale numbers" data-group="hueScale">
				<button class="hue-scale numbers" data-group="hueScale" data-val="plus" title="Increase (i)">+</button> 
			</div>
			<div class="row">
				<span class="label">Offset</span>
				<button class="hue-offset numbers" data-group="hueOffset" data-val="minus" title="Decrease(j)">-</button>
				<input type="text" class="hue-offset numbers" data-group="hueOffset">
				<button class="hue-offset numbers" data-group="hueOffset" data-val="plus" title="Increase (l)">+</button>
			</div>
			<div class="row">
				<span class="label">Timer</span>
				<button class="hue-timer single numbers" data-group="hue-timer" data-val="on">On</button>
				<button class="hue-timer single numbers" data-group="hue-timer" data-val="off">Off</button>
			</div>
			<div class="row">
				<span class="label">Speed</span>
				<button class="hue-timer-speed numbers" data-group="hueTimerSpeed" data-val="minus" title="Decrease">-</button>
				<input type="text" class="hue-timer-speed numbers" data-group="hueTimerSpeed">
				<button class="hue-timer-speed numbers" data-group="hueTimerSpeed" data-val="plus" title="Increase">+</button> 
			</div>
		</div>
		<div class="category">
			<div class="title">Saturation</div>
		<!--<div class="row">
				<span class="label">Mode</span>
				<button class="saturation single" data-group="saturation" data-val="0">0</button>
				<button class="saturation single" data-group="saturation" data-val="1">1</button>
				<button class="saturation single" data-group="saturation" data-val="2">2</button>
			</div>-->
			<div class="row">
				<span class="label">Value</span>
				<button class="saturation-scale numbers" data-group="saturationScale" data-val="minus" title="Decrease">-</button>
				<input type="text" class="saturation-scale numbers" data-group="saturationScale" data-min="0.0" data-max="1.0">
				<button class="saturation-scale numbers" data-group="saturationScale" data-val="plus" title="Increase">+</button>
			</div>
		</div>
		<div class="category">
			<div class="title">Lightness</div>
			<div class="row">
				<span class="label">Mode</span>
				<button class="fading single" data-group="fading" data-val="0">0</button>
				<button class="fading single" data-group="fading" data-val="1">1</button>
				<button class="fading single" data-group="fading" data-val="2">2</button>
			</div>
			<div class="row">
				<span class="label">Scale</span>
				<button class="fading-scale numbers" data-group="fadingScale" data-val="minus" title="Decrease (Down)">-</button>
				<input type="text" class="fading-scale numbers" data-group="fadingScale" data-min="0">
				<button class="fading-scale numbers" data-group="fadingScale" data-val="plus" title="Increase (Up)">+</button>
			</div>
		</div>
		<div class="category">
			<div class="title">Other</div>
			<div class="row">
				<div class="desc-title">Camera controls</div>
				<div class="desc">Move&nbsp;&nbsp;&nbsp;W,A,S,D</div>
				<div class="desc">Zoom&nbsp;&nbsp;&nbsp;R,F</div>
				<div class="desc">Rotate&nbsp;Q,E</div>
				<button class="random-brot">Random Brot</button>
				<button class="mutate-brot">Mutate Brot</button>
			</div>
		</div>
	</div>
</body></html>
