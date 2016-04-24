
var graphObjectArray = [];


function startGraph()
{
	
	//generate random markers to use as mock data.
	for (var i = 0; i < 100; i++)
	{
		var tempScore = (Math.random() * 4).toFixed(2);
		var tempMarker;

		var tempColor = (Math.random() * 50).toFixed(0);

		var semester = function randSemester(){
			var x = Math.floor((Math.random() * 3)) + 1;
			if(x == 1){
				return "Spring";
			}
			else if(x == 2 ){
				return "Summer";
			}
			else{
				return "Fall";
			}
		}
		var year = Math.floor((Math.random() * 5)) + 2013;

		if (tempColor == 0)
		{
			tempMarker = "red";
		}
		else if (tempColor == 1)
		{
			tempMarker = "green";
		}
		else if (tempColor >= 2)
		{
			tempMarker = "blue";
		}


		//assign info to an object with mock data
		var tempObject = {marker:tempMarker, course:"CS 1400", instructor:"Brad Peterson", score:tempScore, year:year, semester: semester};
		graphObjectArray.push(tempObject);
	}

	graphObjectArray.sort(function (a, b) {
		return a.score - b.score
	})
	tableData = graphObjectArray;

	objectToArr(tableData);
	//generateScoreTable(tableData);
}




function objectToArr(tableValues) {
	var dataSet = [];
	for (var i = 0; i < 100; i++) {
		dataSet[i] = [tableValues[i].marker, tableValues[i].course,tableValues[i].instructor,tableValues[i].semester,tableValues[i].year,tableValues[i].score];
	}
	buildTable(dataSet);
}

//Builds table using JQuery DataTables
function buildTable(dataSet){
	$('#tabularScores').DataTable( {
		"lengthChange": false,
		"searching": false,
		"paging": false,
		"order": [[ 5, "desc" ]],
		data: dataSet,
		"columnDefs": [ {
			"targets": 0,
			"createdCell": function (td, cellData) {
				if ( cellData == "blue" ) {
					$(td).css('color', 'blue');
					$(td).css('background-color', 'blue');
				}
				if ( cellData == "green" ) {
					$(td).css('color', 'green');
					$(td).css('background-color', 'green');
				}
				if ( cellData == "red" ) {
					$(td).css('color', 'red');
					$(td).css('background-color', 'red');
				}
			}
		}],
		columns: [
			{ title: "Key" },
			{ title: "Class" },
			{ title: "Instructor" },
			{ title: "Semester" },
			{ title: "Year"},
			{ title: "Score" }
		]
	} );
}

