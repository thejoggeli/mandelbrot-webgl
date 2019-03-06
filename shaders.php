<script type="x-shader/x-vertex" id="vertex-shader">
	attribute vec3 a_pos;
	void main() {
		gl_Position = vec4(a_pos, 1.0);
		gl_PointSize = 64.0;
	}
</script>
<script type="x-shader/x-fragment" id="fragment-shader">
	precision highp float;
	uniform float u_hue_scale;
	uniform float u_hue_offset;
	uniform bool u_smoothing;
	uniform int u_saturation;
	uniform float u_saturation_scale;
	uniform int u_fading;
	uniform float u_fading_scale;
	uniform mat3 u_transform;
	uniform int u_iterations;
	const int MAX_ITERATIONS = 5000;
	void colorize_brot(int);
	vec3 hsl2rgb(vec3 hsl);
	float cr, ci, zr, zi, zr_sqr, zi_sqr;
	void main() {
		vec3 coords = u_transform * vec3(gl_FragCoord.x, gl_FragCoord.y, 1.0);
	/*	float dst = sqrt(coords.x*coords.x + coords.y*coords.y);
		if(dst <= 64.0){
			float c = dst/64.0*u_green_off;
			gl_FragColor = vec4(1.0-c, 0.0, c, 1.0);
		} else {
			gl_FragColor = vec4((coords.x+128.0)/256.0, u_green_off, 0, 1.0);
		}  */
		cr = coords.x;
		ci = coords.y;
		zr = cr;
		zi = ci;
		zr_sqr = cr*cr;
		zi_sqr = ci*ci;
		for(int iter = 0; iter < MAX_ITERATIONS; iter++){
			if(iter >= u_iterations) break;
			float a = zr;
			float b = zi;
			zr = a*a-b*b + cr;
			zi = a*b+b*a + ci;
			zr_sqr = zr*zr;
			zi_sqr = zi*zi;
			if(zr_sqr+zi_sqr > 4.0){
				colorize_brot(iter+1);
				return;
			}
		}
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}		
	void colorize_brot(int iterations){
		float numf = float(iterations);
		float maxf = float(u_iterations);
		float saturation = u_saturation_scale;
		float lightness;
		if(u_fading == 1){
			lightness = (numf/maxf)*(numf/maxf)*u_fading_scale;
			if(lightness > 0.5) lightness = 0.5;
			else if(lightness < 0.0) lightness = 0.0;
		} else if(u_fading == 2){
			lightness = 0.5+(numf/maxf)*(numf/maxf)*u_fading_scale;
			if(lightness < 0.5) lightness = 0.5;
			else if(lightness > 1.0) lightness = 1.0;
		} else {
			lightness = 0.5;
		}
		if(u_smoothing) numf += 1.0 - log(log2(sqrt(zi_sqr+zr_sqr)));
		vec3 rgb = hsl2rgb(vec3(mod(numf/maxf*u_hue_scale+u_hue_offset, 1.0), saturation, lightness));
		gl_FragColor = vec4(rgb, 1);
	}
	float hue2rgb(float f1, float f2, float hue) {
		if (hue < 0.0)
			hue += 1.0;
		else if (hue > 1.0)
			hue -= 1.0;
		float res;
		if ((6.0 * hue) < 1.0)
			res = f1 + (f2 - f1) * 6.0 * hue;
		else if ((2.0 * hue) < 1.0)
			res = f2;
		else if ((3.0 * hue) < 2.0)
			res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
		else
			res = f1;
		return res;
	}
	vec3 hsl2rgb(vec3 hsl) {
		vec3 rgb;			
		if (hsl.y == 0.0) {
			rgb = vec3(hsl.z); // Luminance
		} else {
			float f2;
			
			if (hsl.z < 0.5)
				f2 = hsl.z * (1.0 + hsl.y);
			else
				f2 = hsl.z + hsl.y - hsl.y * hsl.z;					
			float f1 = 2.0 * hsl.z - f2;				
			rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
			rgb.g = hue2rgb(f1, f2, hsl.x);
			rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
		}   
		return rgb;
	}
</script>