/* Author: Adam Cox

 */

$(document).ready(function(e)
{
	init();
});

var RGB = function(r, g, b)
{
	this.r = r || 0;
	this.g = g || 0;
	this.b = b || 0;
};

RGB.prototype.toHex = function()
{
	return "#" + this.componentToHex(this.r) + this.componentToHex(this.g) + this.componentToHex(this.b);
};

RGB.prototype.componentToHex = function(c)
{
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
};

var Hex = function(hex)
{
	this.hex = hex;
};

Hex.prototype.toRGB = function()
{
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.hex);
	return result ? parseInt(result[1], 16) + ',' + parseInt(result[2], 16) + ',' + parseInt(result[3], 16) : '';
};

// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Modified and extended by Adam Cox
// www.adamjcox.co.uk

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, w, h, fill)
{
	// This is a very simple and unsafe constructor. All we're doing is checking if
	// the values exist.
	this.x = x || 0;
	this.y = y || 0;
	this.w = w || 1;
	this.h = h || 1;
	this.fill = fill || '#AAAAAA';
};

// Draws this shape to a given context
Shape.prototype.draw = function(ctx)
{
	ctx.fillStyle = this.fill;
	ctx.fillRect(this.x, this.y, this.w, this.h);
};

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my)
{
	// All we have to do is make sure the Mouse X,Y fall in the area between
	// the shape's X and (X + Height) and its Y and (Y + Height)
	return (this.x <= mx) && (this.x + this.w >= mx) && (this.y <= my) && (this.y + this.h >= my);
};

function CanvasState(canvas)
{
	// **** First some setup! ****

	this.canvas = canvas;
	this.width = canvas.width;
	this.height = canvas.height;
	this.ctx = canvas.getContext('2d');
	// This complicates things a little but but fixes mouse co-ordinate problems
	// when there's a border or padding. See getMouse for more detail
	var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
	if (document.defaultView && document.defaultView.getComputedStyle)
	{
		this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
		this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
		this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
		this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
	}

	// Some pages have fixed-position bars (like the stumbleupon bar) at the top or
	// left of the page
	// They will mess up mouse coordinates and this fixes that
	var html = document.body.parentNode;
	this.htmlTop = html.offsetTop;
	this.htmlLeft = html.offsetLeft;

	// **** Keep track of state! ****
	this.valid = false;
	// when set to false, the canvas will redraw everything
	this.shapes = [];
	// the collection of things to be drawn

	// **** Then events! ****

	// This is an example of a closure!
	// Right here "this" means the CanvasState. But we are making events on the
	// Canvas itself,
	// and when the events are fired on the canvas the variable "this" is going to
	// mean the canvas!
	// Since we still want to use this particular CanvasState in the events we have
	// to save a reference to it.
	// This is our reference!
	var myState = this;

	// **** Options! ****
	this.interval = 30;
	setInterval(function()
	{
		myState.draw();
	}, myState.interval);
};

CanvasState.prototype.addShape = function(shape)
{
	this.shapes.push(shape);
	this.valid = false;
	
	return shape;
};

CanvasState.prototype.clear = function()
{
	this.ctx.clearRect(0, 0, this.width, this.height);
};

// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function()
{
	// if our state is invalid, redraw and validate!
	if (!this.valid)
	{
		var ctx = this.ctx;
		var shapes = this.shapes;
		this.clear();

		// ** Add stuff you want drawn in the background all the time here **

		// draw all shapes
		var l = shapes.length;
		
		for (var i = 0; i < l; i++)
		{
			var shape = shapes[i];
			// We can skip the drawing of elements that have moved off the screen:
			if (shape.x > this.width || shape.y > this.height || shape.x + shape.w < 0 || shape.y + shape.h < 0)
				continue;
				
			shapes[i].draw(ctx);
		}

		// draw selection
		// right now this is just a stroke along the edge of the selected Shape
		if (this.selection != null)
		{
			ctx.strokeStyle = this.selectionColor;
			ctx.lineWidth = this.selectionWidth;
			var mySel = this.selection;
			ctx.strokeRect(mySel.x, mySel.y, mySel.w, mySel.h);
		}

		// ** Add stuff you want drawn on top all the time here **

		this.valid = true;
	}
};

// Creates an object with x and y defined, set to the mouse position relative to
// the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about
// padding and borders
CanvasState.prototype.getMouse = function(e)
{
	var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;

	// Compute the total offset
	if (element.offsetParent !== undefined)
	{
		do
		{
			offsetX += element.offsetLeft;
			offsetY += element.offsetTop;
		}
		while ((element = element.offsetParent));
	}

	// Add padding and border style widths to offset
	// Also add the <html> offsets in case there's a position:fixed bar
	offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
	offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

	mx = e.pageX - offsetX;
	my = e.pageY - offsetY;

	// We return a simple javascript object (a hash) with x and y defined
	//@formatter:off
	return	{
		x: mx,
		y: my
	};
	//@formatter:on
};

CanvasState.prototype.fillWindow = function(hook)
{
	var s = this;
	var canvas = this.canvas;
	canvas.width = $(window).width() + 1;
	canvas.height = $(window).height() + 1;

	window.addEventListener('resize', function(e)
	{
		canvas.width = $(window).width() + 1;
		canvas.height = $(window).height() + 1;

		s.valid = false;

		if (isFunction(hook))
			hook();
	});
};

function isFunction(functionToCheck)
{
	//@formatter:off
	var getType = {};
	//@formatter:on
	return functionToCheck && getType.toString.call(functionToCheck) == '[object Function]';
};

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference
// inside the body tag
//init();

var options =
{
	colours: ['#FF0000', '#FF6600', '#FFFF00', '#33CC00', '#000099'],
	metrics:
	{
		w: 70,
		h: 20
	}
};

var centerObject = function(areaW, areaH, objW, objH)
{
	//@formatter:off
	return {
		x: (areaW - objW) / 2,
		y: (areaH - objH) / 2
	}
	//@formatter:on
};

var init = function()
{
	var hex, shp;
	var m = options.metrics;
	var c = options.colours
	var s = new CanvasState(document.getElementById('colour_squares_canvas'));
	var p = centerObject(s.canvas.width, s.canvas.height, m.w * c.length, m.h);

	s.fillWindow();

	for (var i in c)
	{
		shp = s.addShape(new Shape(p.x, p.y, m.w, m.h, 'rgba(' + new Hex(c[i]).toRGB() + ',1)'));
		p.x += m.w;
	}
	
	var a = new Animator(shp);
	a.start({h: 200}, 100, 1000);
};

var Animator = function(target)
{
	this.target = target;
};

Animator.prototype.start = function(props, iterations, duration)
{
	this.stop();
	
	this.iterations = iterations;	
	this.duration = duration;	
	this.props = props;	
	this.interval = duration / iterations;
	
	this.originalProps = new Object();
	
	for(var i in props)
		this.originalProps[i] = this.target[i];
		
	this.loop = setInterval(this.iterator, this.interval, this);
};

Animator.prototype.iterator = function(animator)
{
	var p = animator.props;
	
	for(var i in p)
	{
		var val = p[i] || 0;
		var newVal = animator.target[i];		
		var diff = val - newVal;
		
		animator.target[i] += diff / animator.iterations;
		
		animator.iterations--;
	}
	
	console.log(animator.target);
	
	this.valid = false;
	
	if(animator.iterations == 0)
		animator.stop();
};

Animator.prototype.stop = function()
{
	this.originalProps = null;
	clearInterval(this.loop);
};

/*
 var listen = function(elem, type, eventHandle) {
 if (elem == null || elem == undefined) return;
 if ( elem.addEventListener ) {
 elem.addEventListener( type, eventHandle, false );
 } else if ( elem.attachEvent ) {
 elem.attachEvent( "on" + type, eventHandle );
 } else {
 elem["on"+type]=eventHandle;
 }
 };*/