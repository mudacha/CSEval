var dummyDataEntryAmount = 100;

function startGraph()
{
	var graphObjectArray = [];
	//generate random markers to use as mock data.
	for (var i = 0; i < dummyDataEntryAmount; i++)
	{
		var tempScore = (Math.random() * 4).toFixed(2);
		var tempMarker;
		var tempColor = getRandomInt(0, 2);
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
			tempMarker = "purple";
		}
		else
		{
			tempMarker = "blue";
		}
		//assign info to an object with mock data
		var tempObject = {marker:tempMarker, course:"CS 1400", instructor:"Brad Peterson", score:tempScore, year:year, semester: semester};
		graphObjectArray.push(tempObject);
	}
	objectToArr(graphObjectArray);
}
//Creates regular array from object array
function objectToArr(tableValues) {
	var dataSet = [];
	for (var i = 0; i < dummyDataEntryAmount; i++) {
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
		"orderClasses": false,
		data: dataSet,
		"createdRow": function( row, data, dataIndex ) {
			if ( data[0] == "blue" ) {
				$(row).css('background-color', '#b3d1ff');
				$('td:eq(0)', row).html( 'Cannot view' );
				$('td:eq(0)', row).css('color','#b3d1ff');
				$('td:eq(1)', row).html( '<b>N/A</b>' );
				$('td:eq(2)', row).html( '<b>N/A</b>' );
			}
			if ( data[0] == "purple" ) {
				$('td:eq(0)', row).html( 'Can view' );
				$('td:eq(0)', row).css('color','#d9b3ff');
				$(row).css('background-color', '#d9b3ff');
			}
			if ( data[0] == "red" ) {
				$('td:eq(0)', row).html( 'Teach' );
				$(row).css('background-color', '#ffb3b3');
				$('td:eq(0)', row).css('color','#ffb3b3');
			}
		},
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

