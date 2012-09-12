/* Author: Adam Cox

*/

$(document).ready(function(e)
{
	var grid_canvas = document.getElementById('colour_squares_canvas');
	var grid = grid_canvas.getContext("2d");
	    
	grid.fillStyle = "rgb(150,150,150)";
	grid.fillRect(0,0,100,100); 
});