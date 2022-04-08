/*
 * **************************************************************************************
 * Copyright (C) 2021 FoE-Helper team - All Rights Reserved
 * You may use, distribute and modify this code under the
 * terms of the AGPL license.
 *
 * See file LICENSE.md or go to
 * https://github.com/mainIine/foe-helfer-extension/blob/master/LICENSE.md
 * for full license details.
 *
 * **************************************************************************************
 */

/*
 Highcharts JS v8.0.4 (2020-03-10)

 Boost module

 (c) 2010-2019 Highsoft AS
 Author: Torstein Honsi

 License: www.highcharts.com/license

 This is a Highcharts module that draws long data series on a canvas in order
 to increase performance of the initial load time and tooltip responsiveness.

 Compatible with WebGL compatible browsers (not IE < 11).

 If this module is taken in as part of the core
 - All the loading logic should be merged with core. Update styles in the
   core.
 - Most of the method wraps should probably be added directly in parent
   methods.

 Notes for boost mode
 - Area lines are not drawn
 - Lines are not drawn on scatter charts
 - Zones and negativeColor don't work
 - Dash styles are not rendered on lines.
 - Columns are always one pixel wide. Don't set the threshold too low.
 - Disable animations
 - Marker shapes are not supported: markers will always be circles

 Optimizing tips for users
 - Set extremes (min, max) explicitly on the axes in order for Highcharts to
   avoid computing extremes.
 - Set enableMouseTracking to false on the series to improve total rendering
      time.
 - The default threshold is set based on one series. If you have multiple,
   dense series, the combined number of points drawn gets higher, and you may
   want to set the threshold lower in order to use optimizations.
 - If drawing large scatter charts, it's beneficial to set the marker radius
   to a value less than 1. This is to add additional spacing to make the chart
   more readable.
 - If the value increments on both the X and Y axis aren't small, consider
   setting useGPUTranslations to true on the boost settings object. If you do
   this and the increments are small (e.g. datetime axis with small time
   increments) it may cause rendering issues due to floating point rounding
   errors, so your millage may vary.

 Settings
    There are two ways of setting the boost threshold:
    - Per series: boost based on number of points in individual series
    - Per chart: boost based on the number of series

  To set the series boost threshold, set seriesBoostThreshold on the chart
  object.
  To set the series-specific threshold, set boostThreshold on the series
  object.

  In addition, the following can be set in the boost object:
  {
      //Wether or not to use alpha blending
      useAlpha: boolean - default: true
      //Set to true to perform translations on the GPU.
      //Much faster, but may cause rendering issues
      //when using values far from 0 due to floating point
      //rounding issues
      useGPUTranslations: boolean - default: false
      //Use pre-allocated buffers, much faster,
      //but may cause rendering issues with some data sets
      usePreallocated: boolean - default: false
  }
*/
(function(c){"object"===typeof module&&module.exports?(c["default"]=c,module.exports=c):"function"===typeof define&&define.amd?define("highcharts/modules/boost",["highcharts"],function(u){c(u);c.Highcharts=u;return c}):c("undefined"!==typeof Highcharts?Highcharts:void 0)})(function(c){function u(c,w,p,G){c.hasOwnProperty(w)||(c[w]=G.apply(null,p))}c=c?c._modules:{};u(c,"modules/boost/boostables.js",[],function(){return"area arearange column columnrange bar line scatter heatmap bubble treemap".split(" ")});
u(c,"modules/boost/boostable-map.js",[c["modules/boost/boostables.js"]],function(c){var m={};c.forEach(function(c){m[c]=1});return m});u(c,"modules/boost/wgl-shader.js",[c["parts/Globals.js"],c["parts/Utilities.js"]],function(c,w){var m=w.clamp,G=w.error,r=c.pick;return function(e){function c(){p.length&&G("[highcharts boost] shader error - "+p.join("\n"))}function v(a,d){var b=e.createShader("vertex"===d?e.VERTEX_SHADER:e.FRAGMENT_SHADER);e.shaderSource(b,a);e.compileShader(b);return e.getShaderParameter(b,
e.COMPILE_STATUS)?b:(p.push("when compiling "+d+" shader:\n"+e.getShaderInfoLog(b)),!1)}function t(){function b(a){return e.getUniformLocation(h,a)}var d=v("#version 100\n#define LN10 2.302585092994046\nprecision highp float;\nattribute vec4 aVertexPosition;\nattribute vec4 aColor;\nvarying highp vec2 position;\nvarying highp vec4 vColor;\nuniform mat4 uPMatrix;\nuniform float pSize;\nuniform float translatedThreshold;\nuniform bool hasThreshold;\nuniform bool skipTranslation;\nuniform float xAxisTrans;\nuniform float xAxisMin;\nuniform float xAxisMinPad;\nuniform float xAxisPointRange;\nuniform float xAxisLen;\nuniform bool  xAxisPostTranslate;\nuniform float xAxisOrdinalSlope;\nuniform float xAxisOrdinalOffset;\nuniform float xAxisPos;\nuniform bool  xAxisCVSCoord;\nuniform bool  xAxisIsLog;\nuniform bool  xAxisReversed;\nuniform float yAxisTrans;\nuniform float yAxisMin;\nuniform float yAxisMinPad;\nuniform float yAxisPointRange;\nuniform float yAxisLen;\nuniform bool  yAxisPostTranslate;\nuniform float yAxisOrdinalSlope;\nuniform float yAxisOrdinalOffset;\nuniform float yAxisPos;\nuniform bool  yAxisCVSCoord;\nuniform bool  yAxisIsLog;\nuniform bool  yAxisReversed;\nuniform bool  isBubble;\nuniform bool  bubbleSizeByArea;\nuniform float bubbleZMin;\nuniform float bubbleZMax;\nuniform float bubbleZThreshold;\nuniform float bubbleMinSize;\nuniform float bubbleMaxSize;\nuniform bool  bubbleSizeAbs;\nuniform bool  isInverted;\nfloat bubbleRadius(){\nfloat value = aVertexPosition.w;\nfloat zMax = bubbleZMax;\nfloat zMin = bubbleZMin;\nfloat radius = 0.0;\nfloat pos = 0.0;\nfloat zRange = zMax - zMin;\nif (bubbleSizeAbs){\nvalue = value - bubbleZThreshold;\nzMax = max(zMax - bubbleZThreshold, zMin - bubbleZThreshold);\nzMin = 0.0;\n}\nif (value < zMin){\nradius = bubbleZMin / 2.0 - 1.0;\n} else {\npos = zRange > 0.0 ? (value - zMin) / zRange : 0.5;\nif (bubbleSizeByArea && pos > 0.0){\npos = sqrt(pos);\n}\nradius = ceil(bubbleMinSize + pos * (bubbleMaxSize - bubbleMinSize)) / 2.0;\n}\nreturn radius * 2.0;\n}\nfloat translate(float val,\nfloat pointPlacement,\nfloat localA,\nfloat localMin,\nfloat minPixelPadding,\nfloat pointRange,\nfloat len,\nbool  cvsCoord,\nbool  isLog,\nbool  reversed\n){\nfloat sign = 1.0;\nfloat cvsOffset = 0.0;\nif (cvsCoord) {\nsign *= -1.0;\ncvsOffset = len;\n}\nif (isLog) {\nval = log(val) / LN10;\n}\nif (reversed) {\nsign *= -1.0;\ncvsOffset -= sign * len;\n}\nreturn sign * (val - localMin) * localA + cvsOffset + \n(sign * minPixelPadding);\n}\nfloat xToPixels(float value) {\nif (skipTranslation){\nreturn value;// + xAxisPos;\n}\nreturn translate(value, 0.0, xAxisTrans, xAxisMin, xAxisMinPad, xAxisPointRange, xAxisLen, xAxisCVSCoord, xAxisIsLog, xAxisReversed);// + xAxisPos;\n}\nfloat yToPixels(float value, float checkTreshold) {\nfloat v;\nif (skipTranslation){\nv = value;// + yAxisPos;\n} else {\nv = translate(value, 0.0, yAxisTrans, yAxisMin, yAxisMinPad, yAxisPointRange, yAxisLen, yAxisCVSCoord, yAxisIsLog, yAxisReversed);// + yAxisPos;\nif (v > yAxisLen) {\nv = yAxisLen;\n}\n}\nif (checkTreshold > 0.0 && hasThreshold) {\nv = min(v, translatedThreshold);\n}\nreturn v;\n}\nvoid main(void) {\nif (isBubble){\ngl_PointSize = bubbleRadius();\n} else {\ngl_PointSize = pSize;\n}\nvColor = aColor;\nif (skipTranslation && isInverted) {\ngl_Position = uPMatrix * vec4(aVertexPosition.y + yAxisPos, aVertexPosition.x + xAxisPos, 0.0, 1.0);\n} else if (isInverted) {\ngl_Position = uPMatrix * vec4(yToPixels(aVertexPosition.y, aVertexPosition.z) + yAxisPos, xToPixels(aVertexPosition.x) + xAxisPos, 0.0, 1.0);\n} else {\ngl_Position = uPMatrix * vec4(xToPixels(aVertexPosition.x) + xAxisPos, yToPixels(aVertexPosition.y, aVertexPosition.z) + yAxisPos, 0.0, 1.0);\n}\n}",
"vertex"),m=v("precision highp float;\nuniform vec4 fillColor;\nvarying highp vec2 position;\nvarying highp vec4 vColor;\nuniform sampler2D uSampler;\nuniform bool isCircle;\nuniform bool hasColor;\nvoid main(void) {\nvec4 col = fillColor;\nvec4 tcol;\nif (hasColor) {\ncol = vColor;\n}\nif (isCircle) {\ntcol = texture2D(uSampler, gl_PointCoord.st);\ncol *= tcol;\nif (tcol.r < 0.0) {\ndiscard;\n} else {\ngl_FragColor = col;\n}\n} else {\ngl_FragColor = col;\n}\n}","fragment");if(!d||!m)return h=!1,
c(),!1;h=e.createProgram();e.attachShader(h,d);e.attachShader(h,m);e.linkProgram(h);if(!e.getProgramParameter(h,e.LINK_STATUS))return p.push(e.getProgramInfoLog(h)),c(),h=!1;e.useProgram(h);e.bindAttribLocation(h,0,"aVertexPosition");g=b("uPMatrix");l=b("pSize");D=b("fillColor");A=b("isBubble");f=b("bubbleSizeAbs");a=b("bubbleSizeByArea");k=b("uSampler");N=b("skipTranslation");J=b("isCircle");L=b("isInverted");return!0}function n(a,d){e&&h&&(a=b[a]=b[a]||e.getUniformLocation(h,a),e.uniform1f(a,d))}
var b={},h,g,l,D,A,f,a,N,J,L,p=[],k;return e&&!t()?!1:{psUniform:function(){return l},pUniform:function(){return g},fillColorUniform:function(){return D},setBubbleUniforms:function(b,d,c){var g=b.options,l=Number.MAX_VALUE,k=-Number.MAX_VALUE;e&&h&&"bubble"===b.type&&(l=r(g.zMin,m(d,!1===g.displayNegative?g.zThreshold:-Number.MAX_VALUE,l)),k=r(g.zMax,Math.max(k,c)),e.uniform1i(A,1),e.uniform1i(J,1),e.uniform1i(a,"width"!==b.options.sizeBy),e.uniform1i(f,b.options.sizeByAbsoluteValue),n("bubbleZMin",
l),n("bubbleZMax",k),n("bubbleZThreshold",b.options.zThreshold),n("bubbleMinSize",b.minPxSize),n("bubbleMaxSize",b.maxPxSize))},bind:function(){e&&h&&e.useProgram(h)},program:function(){return h},create:t,setUniform:n,setPMatrix:function(a){e&&h&&e.uniformMatrix4fv(g,!1,a)},setColor:function(a){e&&h&&e.uniform4f(D,a[0]/255,a[1]/255,a[2]/255,a[3])},setPointSize:function(a){e&&h&&e.uniform1f(l,a)},setSkipTranslation:function(a){e&&h&&e.uniform1i(N,!0===a?1:0)},setTexture:function(a){e&&h&&e.uniform1i(k,
a)},setDrawAsCircle:function(a){e&&h&&e.uniform1i(J,a?1:0)},reset:function(){e&&h&&(e.uniform1i(A,0),e.uniform1i(J,0))},setInverted:function(a){e&&h&&e.uniform1i(L,a)},destroy:function(){e&&h&&(e.deleteProgram(h),h=!1)}}}});u(c,"modules/boost/wgl-vbuffer.js",[],function(){return function(c,w,p){function m(){r&&(c.deleteBuffer(r),e=r=!1);t=0;q=p||2;n=[]}var r=!1,e=!1,q=p||2,v=!1,t=0,n;return{destroy:m,bind:function(){if(!r)return!1;c.vertexAttribPointer(e,q,c.FLOAT,!1,0,0)},data:n,build:function(b,
h,g){var l;n=b||[];if(!(n&&0!==n.length||v))return m(),!1;q=g||q;r&&c.deleteBuffer(r);v||(l=new Float32Array(n));r=c.createBuffer();c.bindBuffer(c.ARRAY_BUFFER,r);c.bufferData(c.ARRAY_BUFFER,v||l,c.STATIC_DRAW);e=c.getAttribLocation(w.program(),h);c.enableVertexAttribArray(e);return!0},render:function(b,e,g){var l=v?v.length:n.length;if(!r||!l)return!1;if(!b||b>l||0>b)b=0;if(!e||e>l)e=l;c.drawArrays(c[(g||"points").toUpperCase()],b/q,(e-b)/q);return!0},allocate:function(b){t=-1;v=new Float32Array(4*
b)},push:function(b,c,e,l){v&&(v[++t]=b,v[++t]=c,v[++t]=e,v[++t]=l)}}}});u(c,"modules/boost/wgl-renderer.js",[c["parts/Globals.js"],c["modules/boost/wgl-shader.js"],c["modules/boost/wgl-vbuffer.js"],c["parts/Color.js"],c["parts/Utilities.js"]],function(c,w,p,G,r){var e=G.parse,q=r.isNumber,m=r.merge,t=r.objectEach,n=c.win.document,b=c.some,h=c.pick;return function(g){function l(a){if(a.isSeriesBoosting){var b=!!a.options.stacking;var d=a.xData||a.options.xData||a.processedXData;b=(b?a.data:d||a.options.data).length;
"treemap"===a.type?b*=12:"heatmap"===a.type?b*=6:ka[a.type]&&(b*=2);return b}return 0}function D(){d.clear(d.COLOR_BUFFER_BIT|d.DEPTH_BUFFER_BIT)}function A(a,d){function c(a){a&&(d.colorData.push(a[0]),d.colorData.push(a[1]),d.colorData.push(a[2]),d.colorData.push(a[3]))}function f(a,b,d,f,e){c(e);y.usePreallocated?v.push(a,b,d?1:0,f||1):(K.push(a),K.push(b),K.push(d?1:0),K.push(f||1))}function l(){d.segments.length&&(d.segments[d.segments.length-1].to=K.length)}function k(){d.segments.length&&d.segments[d.segments.length-
1].from===K.length||(l(),d.segments.push({from:K.length}))}function g(a,b,d,e,k){c(k);f(a+d,b);c(k);f(a,b);c(k);f(a,b+e);c(k);f(a,b+e);c(k);f(a+d,b+e);c(k);f(a+d,b)}function S(a,b){y.useGPUTranslations||(d.skipTranslation=!0,a.x=w.toPixels(a.x,!0),a.y=L.toPixels(a.y,!0));b?K=[a.x,a.y,0,2].concat(K):f(a.x,a.y,0,2)}var X=a.pointArrayMap&&"low,high"===a.pointArrayMap.join(","),J=a.chart,h=a.options,N=!!h.stacking,m=h.data,q=a.xAxis.getExtremes(),n=q.min;q=q.max;var p=a.yAxis.getExtremes(),t=p.min;p=
p.max;var r=a.xData||h.xData||a.processedXData,D=a.yData||h.yData||a.processedYData,A=a.zData||h.zData||a.processedZData,L=a.yAxis,w=a.xAxis,u=a.chart.plotWidth,ia=!r||0===r.length,F=h.connectNulls,x=a.points||!1,H=!1,I=!1,O;m=N?a.data:r||m;r={x:Number.MAX_VALUE,y:0};var M={x:-Number.MAX_VALUE,y:0},R=0,W=!1,E=-1,P=!1,U=!1,ta="undefined"===typeof J.index,Q=!1,ea=!1;var B=!1;var ua=ka[a.type],fa=!1,pa=!0,qa=!0,Z=h.zones||!1,V=!1,ra=h.threshold,ha=!1;if(!(h.boostData&&0<h.boostData.length)){h.gapSize&&
(ha="value"!==h.gapUnit?h.gapSize*a.closestPointRange:h.gapSize);Z&&(b(Z,function(a){if("undefined"===typeof a.value)return V=new G(a.color),!0}),V||(V=a.pointAttribs&&a.pointAttribs().fill||a.color,V=new G(V)));J.inverted&&(u=a.chart.plotHeight);a.closestPointRangePx=Number.MAX_VALUE;k();if(x&&0<x.length)d.skipTranslation=!0,d.drawMode="triangles",x[0].node&&x[0].node.levelDynamic&&x.sort(function(a,b){if(a.node){if(a.node.levelDynamic>b.node.levelDynamic)return 1;if(a.node.levelDynamic<b.node.levelDynamic)return-1}return 0}),
x.forEach(function(b){var d=b.plotY;if("undefined"!==typeof d&&!isNaN(d)&&null!==b.y){d=b.shapeArgs;var f=J.styledMode?b.series.colorAttribs(b):f=b.series.pointAttribs(b);b=f["stroke-width"]||0;B=e(f.fill).rgba;B[0]/=255;B[1]/=255;B[2]/=255;"treemap"===a.type&&(b=b||1,O=e(f.stroke).rgba,O[0]/=255,O[1]/=255,O[2]/=255,g(d.x,d.y,d.width,d.height,O),b/=2);"heatmap"===a.type&&J.inverted&&(d.x=w.len-d.x,d.y=L.len-d.y,d.width=-d.width,d.height=-d.height);g(d.x+b,d.y+b,d.width-2*b,d.height-2*b,B)}});else{for(;E<
m.length-1;){var C=m[++E];if(ta)break;if(ia){x=C[0];var z=C[1];m[E+1]&&(U=m[E+1][0]);m[E-1]&&(P=m[E-1][0]);if(3<=C.length){var sa=C[2];C[2]>d.zMax&&(d.zMax=C[2]);C[2]<d.zMin&&(d.zMin=C[2])}}else x=C,z=D[E],m[E+1]&&(U=m[E+1]),m[E-1]&&(P=m[E-1]),A&&A.length&&(sa=A[E],A[E]>d.zMax&&(d.zMax=A[E]),A[E]<d.zMin&&(d.zMin=A[E]));if(F||null!==x&&null!==z){U&&U>=n&&U<=q&&(Q=!0);P&&P>=n&&P<=q&&(ea=!0);if(X){ia&&(z=C.slice(1,3));var aa=z[0];z=z[1]}else N&&(x=C.x,z=C.stackY,aa=z-C.y);null!==t&&"undefined"!==typeof t&&
null!==p&&"undefined"!==typeof p&&(pa=z>=t&&z<=p);x>q&&M.x<q&&(M.x=x,M.y=z);x<n&&r.x>n&&(r.x=x,r.y=z);if(null!==z||!F)if(null!==z&&(pa||Q||ea)){if((U>=n||x>=n)&&(P<=q||x<=q)&&(fa=!0),fa||Q||ea){ha&&x-P>ha&&k();Z&&(B=V.rgba,b(Z,function(a,b){b=Z[b-1];if("undefined"!==typeof a.value&&z<=a.value){if(!b||z>=b.value)B=e(a.color).rgba;return!0}}),B[0]/=255,B[1]/=255,B[2]/=255);if(!y.useGPUTranslations&&(d.skipTranslation=!0,x=w.toPixels(x,!0),z=L.toPixels(z,!0),x>u&&"points"===d.drawMode))continue;if(ua){C=
aa;if(!1===aa||"undefined"===typeof aa)C=0>z?z:0;X||N||(C=Math.max(null===ra?t:ra,t));y.useGPUTranslations||(C=L.toPixels(C,!0));f(x,C,0,0,B)}d.hasMarkers&&fa&&!1!==H&&(a.closestPointRangePx=Math.min(a.closestPointRangePx,Math.abs(x-H)));!y.useGPUTranslations&&!y.usePreallocated&&H&&1>Math.abs(x-H)&&I&&1>Math.abs(z-I)?y.debug.showSkipSummary&&++R:(h.step&&!qa&&f(x,I,0,2,B),f(x,z,0,"bubble"===a.type?sa||1:2,B),H=x,I=z,W=!0,qa=!1)}}else k()}else k()}y.debug.showSkipSummary&&console.log("skipped points:",
R);W||!1===F||"line_strip"!==a.drawMode||(r.x<Number.MAX_VALUE&&S(r,!0),M.x>-Number.MAX_VALUE&&S(M))}l()}}function f(){F=[];W.data=K=[];R=[];v&&v.destroy()}function a(a){k&&(k.setUniform("xAxisTrans",a.transA),k.setUniform("xAxisMin",a.min),k.setUniform("xAxisMinPad",a.minPixelPadding),k.setUniform("xAxisPointRange",a.pointRange),k.setUniform("xAxisLen",a.len),k.setUniform("xAxisPos",a.pos),k.setUniform("xAxisCVSCoord",!a.horiz),k.setUniform("xAxisIsLog",a.isLog),k.setUniform("xAxisReversed",!!a.reversed))}
function N(a){k&&(k.setUniform("yAxisTrans",a.transA),k.setUniform("yAxisMin",a.min),k.setUniform("yAxisMinPad",a.minPixelPadding),k.setUniform("yAxisPointRange",a.pointRange),k.setUniform("yAxisLen",a.len),k.setUniform("yAxisPos",a.pos),k.setUniform("yAxisCVSCoord",!a.horiz),k.setUniform("yAxisIsLog",a.isLog),k.setUniform("yAxisReversed",!!a.reversed))}function J(a,b){k.setUniform("hasThreshold",a);k.setUniform("translatedThreshold",b)}function L(b){if(b)u=b.chartWidth||800,H=b.chartHeight||400;
else return!1;if(!(d&&u&&H&&k))return!1;y.debug.timeRendering&&console.time("gl rendering");d.canvas.width=u;d.canvas.height=H;k.bind();d.viewport(0,0,u,H);k.setPMatrix([2/u,0,0,0,0,-(2/H),0,0,0,0,-2,0,-1,1,-1,1]);1<y.lineWidth&&!c.isMS&&d.lineWidth(y.lineWidth);v.build(W.data,"aVertexPosition",4);v.bind();k.setInverted(b.inverted);F.forEach(function(f,c){var l=f.series.options,g=l.marker;var m="undefined"!==typeof l.lineWidth?l.lineWidth:1;var n=l.threshold,r=q(n),t=f.series.yAxis.getThreshold(n);
n=h(l.marker?l.marker.enabled:null,f.series.xAxis.isRadial?!0:null,f.series.closestPointRangePx>2*((l.marker?l.marker.radius:10)||10));g=I[g&&g.symbol||f.series.symbol]||I.circle;if(!(0===f.segments.length||f.segmentslength&&f.segments[0].from===f.segments[0].to)){g.isReady&&(d.bindTexture(d.TEXTURE_2D,g.handle),k.setTexture(g.handle));b.styledMode?g=f.series.markerGroup&&f.series.markerGroup.getStyle("fill"):(g=f.series.pointAttribs&&f.series.pointAttribs().fill||f.series.color,l.colorByPoint&&(g=
f.series.chart.options.colors[c]));f.series.fillOpacity&&l.fillOpacity&&(g=(new G(g)).setOpacity(h(l.fillOpacity,1)).get());g=e(g).rgba;y.useAlpha||(g[3]=1);"lines"===f.drawMode&&y.useAlpha&&1>g[3]&&(g[3]/=10);"add"===l.boostBlending?(d.blendFunc(d.SRC_ALPHA,d.ONE),d.blendEquation(d.FUNC_ADD)):"mult"===l.boostBlending||"multiply"===l.boostBlending?d.blendFunc(d.DST_COLOR,d.ZERO):"darken"===l.boostBlending?(d.blendFunc(d.ONE,d.ONE),d.blendEquation(d.FUNC_MIN)):d.blendFuncSeparate(d.SRC_ALPHA,d.ONE_MINUS_SRC_ALPHA,
d.ONE,d.ONE_MINUS_SRC_ALPHA);k.reset();0<f.colorData.length&&(k.setUniform("hasColor",1),c=p(d,k),c.build(f.colorData,"aColor",4),c.bind());k.setColor(g);a(f.series.xAxis);N(f.series.yAxis);J(r,t);"points"===f.drawMode&&(l.marker&&l.marker.radius?k.setPointSize(2*l.marker.radius):k.setPointSize(1));k.setSkipTranslation(f.skipTranslation);"bubble"===f.series.type&&k.setBubbleUniforms(f.series,f.zMin,f.zMax);k.setDrawAsCircle(Q[f.series.type]||!1);if(0<m||"line_strip"!==f.drawMode)for(m=0;m<f.segments.length;m++)v.render(f.segments[m].from,
f.segments[m].to,f.drawMode);if(f.hasMarkers&&n)for(l.marker&&l.marker.radius?k.setPointSize(2*l.marker.radius):k.setPointSize(10),k.setDrawAsCircle(!0),m=0;m<f.segments.length;m++)v.render(f.segments[m].from,f.segments[m].to,"POINTS")}});y.debug.timeRendering&&console.timeEnd("gl rendering");g&&g();f()}function r(a){D();if(a.renderer.forExport)return L(a);M?L(a):setTimeout(function(){r(a)},1)}var k=!1,v=!1,d=!1,u=0,H=0,K=!1,R=!1,W={},M=!1,F=[],I={},ka={column:!0,columnrange:!0,bar:!0,area:!0,arearange:!0},
Q={scatter:!0,bubble:!0},y={pointSize:1,lineWidth:1,fillColor:"#AA00AA",useAlpha:!0,usePreallocated:!1,useGPUTranslations:!1,debug:{timeRendering:!1,timeSeriesProcessing:!1,timeSetup:!1,timeBufferCopy:!1,timeKDTree:!1,showSkipSummary:!1}};return W={allocateBufferForSingleSeries:function(a){var b=0;y.usePreallocated&&(a.isSeriesBoosting&&(b=l(a)),v.allocate(b))},pushSeries:function(a){0<F.length&&F[F.length-1].hasMarkers&&(F[F.length-1].markerTo=R.length);y.debug.timeSeriesProcessing&&console.time("building "+
a.type+" series");F.push({segments:[],markerFrom:R.length,colorData:[],series:a,zMin:Number.MAX_VALUE,zMax:-Number.MAX_VALUE,hasMarkers:a.options.marker?!1!==a.options.marker.enabled:!1,showMarkers:!0,drawMode:{area:"lines",arearange:"lines",areaspline:"line_strip",column:"lines",columnrange:"lines",bar:"lines",line:"line_strip",scatter:"points",heatmap:"triangles",treemap:"triangles",bubble:"points"}[a.type]||"line_strip"});A(a,F[F.length-1]);y.debug.timeSeriesProcessing&&console.timeEnd("building "+
a.type+" series")},setSize:function(a,b){u===a&&H===b||!k||(u=a,H=b,k.bind(),k.setPMatrix([2/u,0,0,0,0,-(2/H),0,0,0,0,-2,0,-1,1,-1,1]))},inited:function(){return M},setThreshold:J,init:function(a,b){function c(a,b){var f={isReady:!1,texture:n.createElement("canvas"),handle:d.createTexture()},c=f.texture.getContext("2d");I[a]=f;f.texture.width=512;f.texture.height=512;c.mozImageSmoothingEnabled=!1;c.webkitImageSmoothingEnabled=!1;c.msImageSmoothingEnabled=!1;c.imageSmoothingEnabled=!1;c.strokeStyle=
"rgba(255, 255, 255, 0)";c.fillStyle="#FFF";b(c);try{d.activeTexture(d.TEXTURE0),d.bindTexture(d.TEXTURE_2D,f.handle),d.texImage2D(d.TEXTURE_2D,0,d.RGBA,d.RGBA,d.UNSIGNED_BYTE,f.texture),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MAG_FILTER,d.LINEAR),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR),d.bindTexture(d.TEXTURE_2D,null),f.isReady=!0}catch(Y){}}var l=0,g=["webgl",
"experimental-webgl","moz-webgl","webkit-3d"];M=!1;if(!a)return!1;for(y.debug.timeSetup&&console.time("gl setup");l<g.length&&!(d=a.getContext(g[l],{}));l++);if(d)b||f();else return!1;d.enable(d.BLEND);d.blendFunc(d.SRC_ALPHA,d.ONE_MINUS_SRC_ALPHA);d.disable(d.DEPTH_TEST);d.depthFunc(d.LESS);k=w(d);if(!k)return!1;v=p(d,k);c("circle",function(a){a.beginPath();a.arc(256,256,256,0,2*Math.PI);a.stroke();a.fill()});c("square",function(a){a.fillRect(0,0,512,512)});c("diamond",function(a){a.beginPath();
a.moveTo(256,0);a.lineTo(512,256);a.lineTo(256,512);a.lineTo(0,256);a.lineTo(256,0);a.fill()});c("triangle",function(a){a.beginPath();a.moveTo(0,512);a.lineTo(256,0);a.lineTo(512,512);a.lineTo(0,512);a.fill()});c("triangle-down",function(a){a.beginPath();a.moveTo(0,0);a.lineTo(256,512);a.lineTo(512,0);a.lineTo(0,0);a.fill()});M=!0;y.debug.timeSetup&&console.timeEnd("gl setup");return!0},render:r,settings:y,valid:function(){return!1!==d},clear:D,flush:f,setXAxis:a,setYAxis:N,data:K,gl:function(){return d},
allocateBuffer:function(a){var b=0;y.usePreallocated&&(a.series.forEach(function(a){a.isSeriesBoosting&&(b+=l(a))}),v.allocate(b))},destroy:function(){f();v.destroy();k.destroy();d&&(t(I,function(a){I[a].handle&&d.deleteTexture(I[a].handle)}),d.canvas.width=1,d.canvas.height=1)},setOptions:function(a){m(!0,y,a)}}}});u(c,"modules/boost/boost-attach.js",[c["parts/Globals.js"],c["modules/boost/wgl-renderer.js"],c["parts/Utilities.js"]],function(c,w,p){var m=p.error,r=c.win.document,e=r.createElement("canvas");
return function(q,p){var t=q.chartWidth,n=q.chartHeight,b=q,h=q.seriesGroup||p.group,g=r.implementation.hasFeature("www.http://w3.org/TR/SVG11/feature#Extensibility","1.1");b=q.isChartSeriesBoosting()?q:p;g=!1;b.renderTarget||(b.canvas=e,q.renderer.forExport||!g?(b.renderTarget=q.renderer.image("",0,0,t,n).addClass("highcharts-boost-canvas").add(h),b.boostClear=function(){b.renderTarget.attr({href:""})},b.boostCopy=function(){b.boostResizeTarget();b.renderTarget.attr({href:b.canvas.toDataURL("image/png")})}):
(b.renderTargetFo=q.renderer.createElement("foreignObject").add(h),b.renderTarget=r.createElement("canvas"),b.renderTargetCtx=b.renderTarget.getContext("2d"),b.renderTargetFo.element.appendChild(b.renderTarget),b.boostClear=function(){b.renderTarget.width=b.canvas.width;b.renderTarget.height=b.canvas.height},b.boostCopy=function(){b.renderTarget.width=b.canvas.width;b.renderTarget.height=b.canvas.height;b.renderTargetCtx.drawImage(b.canvas,0,0)}),b.boostResizeTarget=function(){t=q.chartWidth;n=q.chartHeight;
(b.renderTargetFo||b.renderTarget).attr({x:0,y:0,width:t,height:n}).css({pointerEvents:"none",mixedBlendMode:"normal",opacity:1});b instanceof c.Chart&&b.markerGroup.translate(q.plotLeft,q.plotTop)},b.boostClipRect=q.renderer.clipRect(),(b.renderTargetFo||b.renderTarget).clip(b.boostClipRect),b instanceof c.Chart&&(b.markerGroup=b.renderer.g().add(h),b.markerGroup.translate(p.xAxis.pos,p.yAxis.pos)));b.canvas.width=t;b.canvas.height=n;b.boostClipRect.attr(q.getBoostClipRect(b));b.boostResizeTarget();
b.boostClear();b.ogl||(b.ogl=w(function(){b.ogl.settings.debug.timeBufferCopy&&console.time("buffer copy");b.boostCopy();b.ogl.settings.debug.timeBufferCopy&&console.timeEnd("buffer copy")}),b.ogl.init(b.canvas)||m("[highcharts boost] - unable to init WebGL renderer"),b.ogl.setOptions(q.options.boost||{}),b instanceof c.Chart&&b.ogl.allocateBuffer(q));b.ogl.setSize(t,n);return b.ogl}});u(c,"modules/boost/boost-utils.js",[c["parts/Globals.js"],c["modules/boost/boostable-map.js"],c["modules/boost/boost-attach.js"]],
function(c,w,p){function m(){for(var b=[],c=0;c<arguments.length;c++)b[c]=arguments[c];var e=-Number.MAX_VALUE;b.forEach(function(b){if("undefined"!==typeof b&&null!==b&&"undefined"!==typeof b.length&&0<b.length)return e=b.length,!0});return e}function r(b,c,e){b&&c.renderTarget&&c.canvas&&!(e||c.chart).isChartSeriesBoosting()&&b.render(e||c.chart)}function e(b,c){b&&c.renderTarget&&c.canvas&&!c.chart.isChartSeriesBoosting()&&b.allocateBufferForSingleSeries(c)}function q(b,c,e,h,f,a){f=f||0;h=h||
3E3;for(var l=f+h,g=!0;g&&f<l&&f<b.length;)g=c(b[f],f),++f;g&&(f<b.length?a?q(b,c,e,h,f,a):t.requestAnimationFrame?t.requestAnimationFrame(function(){q(b,c,e,h,f)}):setTimeout(function(){q(b,c,e,h,f)}):e&&e())}function v(){var b=0,c,e=["webgl","experimental-webgl","moz-webgl","webkit-3d"],h=!1;if("undefined"!==typeof t.WebGLRenderingContext)for(c=n.createElement("canvas");b<e.length;b++)try{if(h=c.getContext(e[b]),"undefined"!==typeof h&&null!==h)return!0}catch(f){}return!1}var t=c.win,n=t.document,
b=c.pick,h={patientMax:m,boostEnabled:function(c){return b(c&&c.options&&c.options.boost&&c.options.boost.enabled,!0)},shouldForceChartSeriesBoosting:function(c){var e=0,h=0,g=b(c.options.boost&&c.options.boost.allowForce,!0);if("undefined"!==typeof c.boostForceChartBoost)return c.boostForceChartBoost;if(1<c.series.length)for(var f=0;f<c.series.length;f++){var a=c.series[f];0!==a.options.boostThreshold&&!1!==a.visible&&"heatmap"!==a.type&&(w[a.type]&&++h,m(a.processedXData,a.options.data,a.points)>=
(a.options.boostThreshold||Number.MAX_VALUE)&&++e)}c.boostForceChartBoost=g&&(h===c.series.length&&0<e||5<e);return c.boostForceChartBoost},renderIfNotSeriesBoosting:r,allocateIfNotSeriesBoosting:e,eachAsync:q,hasWebGLSupport:v,pointDrawHandler:function(b){var c=!0;this.chart.options&&this.chart.options.boost&&(c="undefined"===typeof this.chart.options.boost.enabled?!0:this.chart.options.boost.enabled);if(!c||!this.isSeriesBoosting)return b.call(this);this.chart.isBoosting=!0;if(b=p(this.chart,this))e(b,
this),b.pushSeries(this);r(b,this)}};c.hasWebGLSupport=v;return h});u(c,"modules/boost/boost-init.js",[c["parts/Globals.js"],c["parts/Utilities.js"],c["modules/boost/boost-utils.js"],c["modules/boost/boost-attach.js"]],function(c,w,p,u){var m=w.addEvent,e=w.extend,q=w.fireEvent,v=w.wrap,t=c.Series,n=c.seriesTypes,b=function(){},h=p.eachAsync,g=p.pointDrawHandler,l=p.allocateIfNotSeriesBoosting,G=p.renderIfNotSeriesBoosting,A=p.shouldForceChartSeriesBoosting,f;return function(){e(t.prototype,{renderCanvas:function(){function a(a,
b){var c=!1,f="undefined"===typeof k.index,e=!0;if(!f){if(ma){var h=a[0];var g=a[1]}else h=a,g=r[b];X?(ma&&(g=a.slice(1,3)),c=g[0],g=g[1]):ja&&(h=a.x,g=a.stackY,c=g-a.y);va||(e=g>=A&&g<=F);if(null!==g&&h>=v&&h<=w&&e)if(a=n.toPixels(h,!0),Q){if("undefined"===typeof T||a===D){X||(c=g);if("undefined"===typeof Y||g>ca)ca=g,Y=b;if("undefined"===typeof T||c<ba)ba=c,T=b}a!==D&&("undefined"!==typeof T&&(g=d.toPixels(ca,!0),S=d.toPixels(ba,!0),da(a,g,Y),S!==g&&da(a,S,T)),T=Y=void 0,D=a)}else g=Math.ceil(d.toPixels(g,
!0)),da(a,g,b)}return!f}function c(){q(e,"renderedCanvas");delete e.buildKDTree;e.buildKDTree();oa.debug.timeKDTree&&console.timeEnd("kd tree building")}var e=this,m=e.options||{},g=!1,k=e.chart,n=this.xAxis,d=this.yAxis,p=m.xData||e.processedXData,r=m.yData||e.processedYData,t=m.data;g=n.getExtremes();var v=g.min,w=g.max;g=d.getExtremes();var A=g.min,F=g.max,I={},D,Q=!!e.sampling,y=!1!==m.enableMouseTracking,S=d.getThreshold(m.threshold),X=e.pointArrayMap&&"low,high"===e.pointArrayMap.join(","),
ja=!!m.stacking,la=e.cropStart||0,va=e.requireSorting,ma=!p,ba,ca,T,Y,wa="x"===m.findNearestPointBy,na=this.xData||this.options.xData||this.processedXData||!1,da=function(a,b,c){a=Math.ceil(a);f=wa?a:a+","+b;y&&!I[f]&&(I[f]=!0,k.inverted&&(a=n.len-a,b=d.len-b),xa.push({x:na?na[la+c]:!1,clientX:a,plotX:a,plotY:b,i:la+c}))};g=u(k,e);k.isBoosting=!0;var oa=g.settings;if(this.visible){(this.points||this.graph)&&this.destroyGraphics();k.isChartSeriesBoosting()?(this.markerGroup&&this.markerGroup!==k.markerGroup&&
this.markerGroup.destroy(),this.markerGroup=k.markerGroup,this.renderTarget&&(this.renderTarget=this.renderTarget.destroy())):(this.markerGroup===k.markerGroup&&(this.markerGroup=void 0),this.markerGroup=e.plotGroup("markerGroup","markers",!0,1,k.seriesGroup));var xa=this.points=[];e.buildKDTree=b;g&&(l(g,this),g.pushSeries(e),G(g,this,k));k.renderer.forExport||(oa.debug.timeKDTree&&console.time("kd tree building"),h(ja?e.data:p||t,a,c))}}});["heatmap","treemap"].forEach(function(a){n[a]&&v(n[a].prototype,
"drawPoints",g)});n.bubble&&(delete n.bubble.prototype.buildKDTree,v(n.bubble.prototype,"markerAttribs",function(a){return this.isSeriesBoosting?!1:a.apply(this,[].slice.call(arguments,1))}));n.scatter.prototype.fill=!0;e(n.area.prototype,{fill:!0,fillOpacity:!0,sampling:!0});e(n.column.prototype,{fill:!0,sampling:!0});c.Chart.prototype.callbacks.push(function(a){m(a,"predraw",function(){a.boostForceChartBoost=void 0;a.boostForceChartBoost=A(a);a.isBoosting=!1;!a.isChartSeriesBoosting()&&a.didBoost&&
(a.didBoost=!1);a.boostClear&&a.boostClear();a.canvas&&a.ogl&&a.isChartSeriesBoosting()&&(a.didBoost=!0,a.ogl.allocateBuffer(a));a.markerGroup&&a.xAxis&&0<a.xAxis.length&&a.yAxis&&0<a.yAxis.length&&a.markerGroup.translate(a.xAxis[0].pos,a.yAxis[0].pos)});m(a,"render",function(){a.ogl&&a.isChartSeriesBoosting()&&a.ogl.render(a)})})}});u(c,"modules/boost/boost-overrides.js",[c["parts/Globals.js"],c["parts/Point.js"],c["parts/Utilities.js"],c["modules/boost/boost-utils.js"],c["modules/boost/boostables.js"],
c["modules/boost/boostable-map.js"]],function(c,w,p,u,r,e){var m=p.addEvent,v=p.error,t=p.isNumber,n=p.pick,b=p.wrap,h=u.boostEnabled,g=u.shouldForceChartSeriesBoosting;p=c.Chart;var l=c.Series,D=c.seriesTypes,A=c.getOptions().plotOptions;p.prototype.isChartSeriesBoosting=function(){return n(this.options.boost&&this.options.boost.seriesThreshold,50)<=this.series.length||g(this)};p.prototype.getBoostClipRect=function(b){var a={x:this.plotLeft,y:this.plotTop,width:this.plotWidth,height:this.plotHeight};
b===this&&this.yAxis.forEach(function(b){a.y=Math.min(b.pos,a.y);a.height=Math.max(b.pos-this.plotTop+b.len,a.height)},this);return a};l.prototype.getPoint=function(b){var a=b,c=this.xData||this.options.xData||this.processedXData||!1;!b||b instanceof this.pointClass||(a=(new this.pointClass).init(this,this.options.data[b.i],c?c[b.i]:void 0),a.category=n(this.xAxis.categories?this.xAxis.categories[a.x]:a.x,a.x),a.dist=b.dist,a.distX=b.distX,a.plotX=b.plotX,a.plotY=b.plotY,a.index=b.i,a.isInside=this.isPointInside(b));
return a};b(l.prototype,"searchPoint",function(b){return this.getPoint(b.apply(this,[].slice.call(arguments,1)))});b(w.prototype,"haloPath",function(b){var a=this.series,c=this.plotX,f=this.plotY,e=a.chart.inverted;a.isSeriesBoosting&&e&&(this.plotX=a.yAxis.len-f,this.plotY=a.xAxis.len-c);var g=b.apply(this,Array.prototype.slice.call(arguments,1));a.isSeriesBoosting&&e&&(this.plotX=c,this.plotY=f);return g});b(l.prototype,"markerAttribs",function(b,a){var c=a.plotX,f=a.plotY,e=this.chart.inverted;
this.isSeriesBoosting&&e&&(a.plotX=this.yAxis.len-f,a.plotY=this.xAxis.len-c);var g=b.apply(this,Array.prototype.slice.call(arguments,1));this.isSeriesBoosting&&e&&(a.plotX=c,a.plotY=f);return g});m(l,"destroy",function(){var b=this,a=b.chart;a.markerGroup===b.markerGroup&&(b.markerGroup=null);a.hoverPoints&&(a.hoverPoints=a.hoverPoints.filter(function(a){return a.series===b}));a.hoverPoint&&a.hoverPoint.series===b&&(a.hoverPoint=null)});b(l.prototype,"getExtremes",function(b){if(!this.isSeriesBoosting||
!this.hasExtremes||!this.hasExtremes())return b.apply(this,Array.prototype.slice.call(arguments,1))});["translate","generatePoints","drawTracker","drawPoints","render"].forEach(function(c){function a(a){var b=this.options.stacking&&("translate"===c||"generatePoints"===c);if(!this.isSeriesBoosting||b||!h(this.chart)||"heatmap"===this.type||"treemap"===this.type||!e[this.type]||0===this.options.boostThreshold)a.call(this);else if(this[c+"Canvas"])this[c+"Canvas"]()}b(l.prototype,c,a);"translate"===
c&&"column bar arearange columnrange heatmap treemap".split(" ").forEach(function(e){D[e]&&b(D[e].prototype,c,a)})});b(l.prototype,"processData",function(b){function a(a){return f.chart.isChartSeriesBoosting()||(a?a.length:0)>=(f.options.boostThreshold||Number.MAX_VALUE)}var f=this,g=this.options.data;h(this.chart)&&e[this.type]?(a(g)&&"heatmap"!==this.type&&"treemap"!==this.type&&!this.options.stacking&&this.hasExtremes&&this.hasExtremes(!0)||(b.apply(this,Array.prototype.slice.call(arguments,1)),
g=this.processedXData),(this.isSeriesBoosting=a(g))?(g=this.getFirstValidPoint(this.options.data),t(g)||c.isArray(g)||v(12,!1,this.chart),this.enterBoost()):this.exitBoost&&this.exitBoost()):b.apply(this,Array.prototype.slice.call(arguments,1))});m(l,"hide",function(){this.canvas&&this.renderTarget&&(this.ogl&&this.ogl.clear(),this.boostClear())});l.prototype.enterBoost=function(){this.alteredByBoost=[];["allowDG","directTouch","stickyTracking"].forEach(function(b){this.alteredByBoost.push({prop:b,
val:this[b],own:Object.hasOwnProperty.call(this,b)})},this);this.directTouch=this.allowDG=!1;this.stickyTracking=!0;this.labelBySeries&&(this.labelBySeries=this.labelBySeries.destroy())};l.prototype.exitBoost=function(){(this.alteredByBoost||[]).forEach(function(b){b.own?this[b.prop]=b.val:delete this[b.prop]},this);this.boostClear&&this.boostClear()};l.prototype.hasExtremes=function(b){var a=this.options,c=this.xAxis&&this.xAxis.options,e=this.yAxis&&this.yAxis.options,f=this.colorAxis&&this.colorAxis.options;
return a.data.length>(a.boostThreshold||Number.MAX_VALUE)&&t(e.min)&&t(e.max)&&(!b||t(c.min)&&t(c.max))&&(!f||t(f.min)&&t(f.max))};l.prototype.destroyGraphics=function(){var b=this,a=this.points,c,e;if(a)for(e=0;e<a.length;e+=1)(c=a[e])&&c.destroyElements&&c.destroyElements();["graph","area","tracker"].forEach(function(a){b[a]&&(b[a]=b[a].destroy())})};r.forEach(function(b){A[b]&&(A[b].boostThreshold=5E3,A[b].boostData=[],D[b].prototype.fillOpacity=!0)})});u(c,"modules/boost/named-colors.js",[c["parts/Color.js"]],
function(c){var m={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",darkgreen:"#006400",
darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dodgerblue:"#1e90ff",feldspar:"#d19275",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",
goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4",indianred:"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslateblue:"#8470ff",
lightslategray:"#778899",lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",
oldlace:"#fdf5e6",olive:"#808000",olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",
skyblue:"#87ceeb",slateblue:"#6a5acd",slategray:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",violetred:"#d02090",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"};return c.names=m});u(c,"modules/boost/boost.js",[c["parts/Globals.js"],c["modules/boost/boost-utils.js"],c["modules/boost/boost-init.js"],c["parts/Utilities.js"]],function(c,
u,p,G){G=G.error;u=u.hasWebGLSupport;u()?p():"undefined"!==typeof c.initCanvasBoost?c.initCanvasBoost():G(26)});u(c,"masters/modules/boost.src.js",[],function(){})});
