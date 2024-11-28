vec3 pos = position;

pos.y += uTime;
pos += noise(pos);

float pattern = fract(pos.y * 5.0);

vDisplacement = pattern;

float dispalcement = vDisplacement / 3.0;

transformed += normalize( objectNormal ) * dispalcement;
