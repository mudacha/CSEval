var leftBound =  0.00;
var rightBound = 4.00;

var leftScale = 0.00;
var rightScale = 4.00;
var graphObjectArray = new Array();

function toKeyValPair(names, values)
{
	var result = {};
	for(var i = 0; i < names.length; i++)
	{
		result[names[i]] = values[i];
	}
	return result;
}

function startGraph()
{
	$.ajax(
	{
	    //url: '/misc/weber/CSEvals/ranking.cfm',
	    url: 'Ranking.cshtml?instructorID=887999808&semester=2&year=2014',
		type: "GET",
		dataType: "json",
		async: false,
		success:function(data)
		{
			var dataArray;
			var tableObject;
			$.each(data.DATA, function(i, array)
			{
				dataArray = toKeyValPair(data.COLUMNS, array);	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY
				tableObject = {marker:dataArray["MARKER"], course:dataArray["COURSE"], instructor:dataArray["INAME"], score:dataArray["INSTRUCTORAVERAGE"]};
				graphObjectArray.push(tableObject);
			});
		}
	});
	//var graphObjectArray = new Array();//[graphObject, graphObject2, graphObject3, graphObject4, graphObject5, graphObject6, graphObject7, graphObject8, graphObject9];
	
	//generate random markers to use as mock data. 
	// for (var i = 0; i < 200; i++)
	// {
		// var tempScore = (Math.random() * 4);
		// var tempMarker;
		
		// var tempColor = (Math.random() * 50).toFixed(0);
		
		// if (tempColor == 0)
		// {
			// tempMarker = "red";
		// }
		// else if (tempColor == 1)
		// {
			// tempMarker = "green";
		// }
		// else if (tempColor >= 2)
		// {
			// tempMarker = "blue";
		// }
		
		// //assign info to an object with mock data
		// var tempObject = {marker:tempMarker, course:"CS 1400", instructor:"Peterson, Brad", score:tempScore.toFixed(4)};
		// graphObjectArray.push(tempObject);
	// }
	
	
	graphObjectArray.sort(function(a, b)
	{
		return a.score - b.score
	})
	
	barGraph();

}


function barGraph()
{
	
	//MAIN TABLE AND FIRST SELECTION OF DATA
	document.write("<h2 style='margin:auto;text-align:center;'>Computer Science CS 1400 to CS 2400</h2>")
	document.write("<table class='tablegraph' id = 'tableid' align='center'>" );
	document.write("<tr></tr>");
	//function that puts in the results part of the table. This is reused for the zoom feature so it's being used as a function
	createResults();	
	document.write("<tr></tr></table>");
	document.write("</div></td></tr>");
	document.write("<table align='center'><tr>");
	document.write("<td colspan = '9'>");
	document.write("<input type='image' src='images/Arrows-Back-icon.png' width ='20px' height='20px' onmousedown=leftClick() onmouseup=endLeftClick() id = 'leftclick'/></td>");
	document.write("<td><input type='image' src='images/Very-Basic-Plus-icon.png' width ='20px' height='20px'  onmousedown=zoomIn() onmouseup=endZoomIn() id = 'zoomin'/></td>");
	document.write("<td><input type='image' src='images/Very-Basic-Minus-icon.png' width ='20px' height='20px' onmousedown=zoomOut() onmouseup=endZoomOut() id = 'zoomout'/></td>");
	document.write("<td><input type='image' src='images/Arrows-Back-greater-than.png' width ='20px' height='20px' onmousedown=rightClick() onmouseup=endRightClick() id = 'rightclick' /></td>");
	document.write("</tr></table>");
	
	//LEGEND FOR MAIN TABLE
	document.write("<table align='center'><tr><td colspan = '9' width = '900px'>Legend:</td>");
	document.write("<tr><td style='vertical-align:top'><img src = 'images/LegendSquare-Red.png'>Sections you teach.</td></tr>");
	document.write("<tr><td class='legendrow' style='vertical-align:top'><img src = 'images/LegendSquare-Green.png'>Other sections you can view.</td></tr>");
	document.write("<tr><td style='vertical-align:top'><img src = 'images/LegendSquare-Blue.png'>Sections you cannot view.</td></tr>");
	document.write("</tr></table>");
	
}
//Function that puts the graph results on the bar graph
function createResults()
{

	document.write("<tr id = 'mainrow' align = 'center'><td colspan = '9' width = '900px' >");
	document.write("<img src='images/blackbar.png' style='padding-left: 7px;' height = '55%' width='100%' id='graphimage'>");
	
	var startIndex = 0;	//START THE NUMBER LINE

	document.write("<div style = 'position:relative;'>");
		var top = -99;
		var zindex = 15;
	
	for (var i = leftBound; i <= rightBound; i = i + .5)
	{
		document.write("<img style='position: absolute; z-index: " + zindex + "; left:" + (((((i - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + (top + 40) + "px;' src = 'images/blacktick.png'>");
	}
	
	for(i = 0; i < graphObjectArray.length; i++)
	{

		if (i != 0)
		{
			if (graphObjectArray[i - 1]["score"] == graphObjectArray[i]["score"])
			{
				top -= 8;
				zindex -= 1;
			}
			else
			{
				top = -99;
				zindex = 15;
			}
		}
		
		if (graphObjectArray[i]["score"] >= leftBound && graphObjectArray[i]["score"] <= rightBound)
		{
			if (graphObjectArray[i]["marker"] == "red")
			{
				document.write("<img style='position: absolute; z-index: " + zindex + "; left:" + (((((graphObjectArray[i]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + top + "px;'  title='" + graphObjectArray[i]["instructor"] + " - " + graphObjectArray[i]["course"] + ": " + graphObjectArray[i]["score"] + "' src = 'images/RedPinSmall.png'>");
			}
			else if (graphObjectArray[i]["marker"] == "green")
			{
				document.write("<img style='position: absolute; z-index: " + zindex + "; left:" + (((((graphObjectArray[i]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + top + "px;'  title='" + graphObjectArray[i]["instructor"] + " - " + graphObjectArray[i]["course"] + ": " + graphObjectArray[i]["score"] + "' src = 'images/GreenPinSmall.png'>");
			}
			else if (graphObjectArray[i]["marker"] == "blue")
			{
				document.write("<img style='position: absolute; z-index: " + zindex + "; left:" + (((((graphObjectArray[i]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + top + "px;'  title='" + graphObjectArray[i]["instructor"] + " - " + graphObjectArray[i]["course"] + ": " + graphObjectArray[i]["score"] + "' src = 'images/BluePinSmall.png'>");
			}
		}
	}
	
	var top2 = -103;
	
	//CALCULATE AND POSITION LEFTMOST DATAPOINT ("LOW")
	if (graphObjectArray[0]["score"] >= leftBound && graphObjectArray[0]["score"] <= rightBound)
	{
		document.write("<img style='position: absolute;	left:" + (((((graphObjectArray[0]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top:" + (top2 + 70) + "px;'  title='Low Score' src = 'images/PointPinSmall.png'>");
		document.write("<div id = 'lowLabel' style='position: absolute; left:" + ((((((graphObjectArray[0]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) - (2.5)) +  "%; top:" + (top2 + 140) + "px;'>Low</div>");
	}
		
	//CALCULATE AND POSITION RIGHTMOST DATAPOINT ("HIGH")
	if (graphObjectArray[graphObjectArray.length - 1]["score"] >= leftBound && graphObjectArray[graphObjectArray.length - 1]["score"] <= rightBound)
	{
		document.write("<img style='position: absolute;	left:"  + (((((graphObjectArray[graphObjectArray.length - 1]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound)))+ "%; top:" + (top2 + 70) + "px;'  title='High Score' src = 'images/PointPinSmall.png'>");
		document.write("<div id = 'highLabel' style='position: absolute; left:"  + (((((graphObjectArray[graphObjectArray.length - 1]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound)) + (1.0)) + "%; top:" + (top2 + 140) + "px;'>High</div>");
	}
		
	//CALCULATE AND POSITION MIDDLEMOST DATAPOINT ("MEDIAN")
	var median = 0.0;
	if (graphObjectArray.length %2 == 0)
	{
		median = (parseFloat(graphObjectArray[(graphObjectArray.length / 2)]["score"]) + parseFloat(graphObjectArray[((graphObjectArray.length / 2) - 1)]["score"])) / 2;
	}
	else
	{
		median = graphObjectArray[parseInt((graphObjectArray.length / 2) - .5)]["score"];
	}
	
	if (median >= leftBound && median <= rightBound)
	{
		document.write("<img id = 'medImage' style='position: absolute;	left:" + (((((median - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top:" + (top2 + 70) + "px;'  title='Median' src = 'images/PointPinSmall.png'>");
		if ((document.getElementById('medImage').offsetLeft - document.getElementById('lowLabel').offsetLeft < 40) || (document.getElementById('highLabel').offsetLeft - document.getElementById('medImage').offsetLeft < 40))
			document.write("<div style='position: absolute; left:" + (((((median * 225) / 900) * 100) * (4 / (rightBound - leftBound))) - 1.7) + "%; top:" + (top2 + 160) + "px; text-align:center'>Median</div>");
		else
			document.write("<div style='position: absolute; left:" + (((((median * 225) / 900) * 100) * (4 / (rightBound - leftBound))) - 1.7) + "%; top:" + (top2 + 140) + "px; text-align:center'>Median</div>");
	}
	
	//GENERATE NUMBER LINE
	for (var i = leftBound; i <= rightBound ; i = i + .5)
	{
		document.write("<div style = 'position: absolute; top:0px; left:" + (((((i - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%;'>" + (startIndex + i).toFixed(1) + "</div>");
	}

}




function leftClickAction()
{
	if (leftBound  >= leftScale - .01)
	{
		leftBound = leftBound - .01
		rightBound = rightBound - .01
		var row = document.getElementById("mainrow");
		row.innerHTML = regenerate();
	}
}

function leftClick()
{
	leftClickAction();
	action_timeout = setInterval("leftClickAction()",25);
}

function endLeftClick()
{
	if (typeof(action_timeout) != "undefined") clearTimeout(action_timeout);
}




function rightClickAction()
{
	if (rightBound <= rightScale + .01)
	{
		leftBound = leftBound + .01;
		rightBound = rightBound + .01;
		var row = document.getElementById("mainrow");
		row.innerHTML = regenerate();
	}
}

function rightClick()
{
	rightClickAction();
	action_timeout = setInterval("rightClickAction()",25);
}

function endRightClick()
{
	if (typeof(action_timeout) != "undefined") clearTimeout(action_timeout);
}






function zoomOutAction()
{
	if (rightBound - leftBound < rightScale - leftScale)
	{
		leftBound = leftBound - .01;
		rightBound = rightBound + .01;

		var row = document.getElementById("mainrow");
		row.innerHTML = regenerate();
	}
}

function zoomOut()
{
	zoomOutAction();
	action_timeout = setInterval("zoomOutAction()",25);
}

function endZoomOut()
{
	if (typeof(action_timeout) != "undefined") clearTimeout(action_timeout);
}



function zoomInAction()
{
	if (rightBound - leftBound > 0.05)
	{
		leftBound = leftBound + .01;
		rightBound = rightBound - .01;
		var row = document.getElementById("mainrow");
		row.innerHTML = regenerate();
	}
}

function zoomIn()
{
	zoomInAction();
	action_timeout = setInterval("zoomInAction()",25);
}

function endZoomIn()
{
	if (typeof(action_timeout) != "undefined") clearTimeout(action_timeout);
}


function regenerate()
{
	
	var newChart = "";
	
	newChart += ""
	
	newChart += "<tr align = 'center'><td colspan = '9' width = '900px' >";

	newChart += "<img src='images/blackbar.png' style='padding-left: 7px;' height = '55%' width='100%' id='graphimage2'>";
	
	//var tablePos = document.getElementById('graphimage2');
	
	var startIndex = 0;	//START THE NUMBER LINE

	newChart += "<div style = 'position:relative;'>";
		var top = -99;
		var zindex = 15;
	
	
	for (var i = leftScale; i <= rightScale ; i = i + .5)
	{
		if (i >= leftBound && i <= rightBound)
			newChart += "<img style='position: absolute; z-index: " + zindex + "; left:" + (((((i - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + (top + 40) + "px;' src = 'images/blacktick.png'>";
	}
	
	for(i = 0; i < graphObjectArray.length; i++)
	{

		if (i != 0)
		{
			if (graphObjectArray[i - 1]["score"] == graphObjectArray[i]["score"])
			{
				top -= 8;
				zindex -= 1;
			}
			else
			{
				top = -99;
				zindex = 15;
			}
		}
		
		if (graphObjectArray[i]["score"] >= leftBound && graphObjectArray[i]["score"] <= rightBound)
		{
			if (graphObjectArray[i]["marker"] == "red")
			{
				newChart+="<img style='position: absolute; z-index: " + zindex + "; left:" + (((((graphObjectArray[i]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + top + "px;'  title='" + graphObjectArray[i]["instructor"] + " - " + graphObjectArray[i]["course"] + ": " + graphObjectArray[i]["score"] + "' src = 'images/RedPinSmall.png'>";
			}
			else if (graphObjectArray[i]["marker"] == "green")
			{
				newChart+="<img style='position: absolute; z-index: " + zindex + "; left:" + (((((graphObjectArray[i]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + top + "px;'  title='" + graphObjectArray[i]["instructor"] + " - " + graphObjectArray[i]["course"] + ": " + graphObjectArray[i]["score"] + "' src = 'images/GreenPinSmall.png'>";
			}
			else if (graphObjectArray[i]["marker"] == "blue")
			{
				newChart+="<img style='position: absolute; z-index: " + zindex + "; left:" + (((((graphObjectArray[i]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top: " + top + "px;'  title='" + graphObjectArray[i]["instructor"] + " - " + graphObjectArray[i]["course"] + ": " + graphObjectArray[i]["score"] + "' src = 'images/BluePinSmall.png'>";
			}
		}
	}

	
	var top2 = -103;
	
	//CALCULATE AND POSITION LEFTMOST DATAPOINT ("LOW")
	if (graphObjectArray[0]["score"] >= leftBound && graphObjectArray[0]["score"] <= rightBound)
	{
		newChart+="<img style='position: absolute;	left:" + (((((graphObjectArray[0]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top:" + (top2 + 70) + "px;'  title='Low Score' src = 'images/PointPinSmall.png'>";
		newChart+="<div id = 'lowLabel' style='position: absolute; left:" + ((((((graphObjectArray[0]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) - (2.5)) +  "%; top:" + (top2 + 140) + "px;'>Low</div>";
	}
		
	//CALCULATE AND POSITION RIGHTMOST DATAPOINT ("HIGH")
	if (graphObjectArray[graphObjectArray.length - 1]["score"] >= leftBound && graphObjectArray[graphObjectArray.length - 1]["score"] <= rightBound)
	{
		newChart+="<img style='position: absolute;	left:"  + (((((graphObjectArray[graphObjectArray.length - 1]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound)))+ "%; top:" + (top2 + 70) + "px;'  title='High Score' src = 'images/PointPinSmall.png'>";
		newChart+="<div id = 'highLabel' style='position: absolute; left:"  + (((((graphObjectArray[graphObjectArray.length - 1]["score"] - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound)) + (1.0)) + "%; top:" + (top2 + 140) + "px;'>High</div>";
	}
		
	//CALCULATE AND POSITION MIDDLEMOST DATAPOINT ("MEDIAN")
	var median = 0.0;
	if (graphObjectArray.length %2 == 0)
	{
		median = (parseFloat(graphObjectArray[(graphObjectArray.length / 2)]["score"]) + parseFloat(graphObjectArray[((graphObjectArray.length / 2) - 1)]["score"])) / 2;
	}
	else
	{
		median = graphObjectArray[parseInt((graphObjectArray.length / 2) - .5)]["score"];
	}
	
	
	if (median >= leftBound && median <= rightBound)
	{
		newChart+="<img id = 'medImage' style='position: absolute;	left:" + (((((median - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%; top:" + (top2 + 70) + "px;'  title='Median' src = 'images/PointPinSmall.png'>";
		newChart+="<div style='position: absolute; left:" + ((((((median - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) - 1.7) + "%; top:" + (top2 + 140) + "px; text-align:center'>Median</div>";
	}
	

	
	for (var i = leftScale; i <= rightScale ; i = i + .5)
	{
		if (i >= leftBound && i <= rightBound)
			newChart+="<div style = 'position: absolute; top:0px; left:" + (((((i - leftBound) * 225) / 900) * 100) * (4 / (rightBound - leftBound))) + "%;'>" + nearestHalf(startIndex + i).toFixed(1) + "</div>";
	}
	
	
	return newChart;
	
}	


function nearestHalf(value)
{
	value = Math.round(value * 2) / 2
	return value
}

window.onload = function()
	{
	//document.getElementByID("zoomin").onmousedown = zoomIn();
	//document.getElementByID("zoomin").onmouseup = endAction();
	}
