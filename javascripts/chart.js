var extData = null;
google.load("visualization", "1.1", { packages: ["corechart"] });
//Setup and Calculate the info based on the input data.
function loadChart(chartData) {
    //because the setOnLoadCallback does not accept an external parameter for the data passed in, we have to put that data
    //into a global variable which we can reference in that callback.
   if (chartData.length > 10) {
        extData = CompileChartData(chartData);
        google.setOnLoadCallback(drawChart());
    } else {
        extData = chartData;
        google.setOnLoadCallback(drawScatter());
    }


}

function drawScatter() {
    var data = new google.visualization.DataTable();

    data.addColumn('string', '');
    var evallength = 10;
    for (var i = 0; i < evallength; i++) {
        data.addColumn('number', '');
    }

    var labelArray = getLabels(extData);


    labelArray.forEach(function (label) {
        var semester = [];
        extData.forEach(function (eval) {
            if (label == eval.year + " - " + eval.semesterName) {
                console.log(eval.score);
                if (typeof eval.score == 'string')
                {
                    eval.score = parseFloat(eval.score);
                }
                semester.push(eval.score);
            }
        });
        semester.sort();
        for (i = semester.length; i < evallength; i++) {
            semester.push(null);
        }
        semester.unshift(label);
        data.addRow(semester);
        console.log(semester);
    });

    //data.addRow(['Fall 2013', 1, null,null]);
    //data.addRow(['Fall 2013', 3, 4,5]);

    var options = {
        width: 900,
        height: 250,
        legend: 'none',
        orientation: 'vertical',
        vAxis: { gridlines: { count: 3 } }
    };

    var chart = new google.visualization.ScatterChart(document.getElementById('chart_div'));
    chart.draw(data, options);

    /*document.getElementById('format-select').onchange = function() {
      options['vAxis']['format'] = this.value;
      chart.draw(data, options);
    };*/
};

//Render the chart with the data for more than 10 items.
function drawChart() {
    var data = google.visualization.arrayToDataTable(extData, true);
    var options = {
        legend: 'none',
        orientation: 'vertical'
    };
    var chart = new google.visualization.CandlestickChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

//Compile Chart Data when there is more than 10 items
function CompileChartData(objArray) {

    var labelArray = getLabels(objArray);

    //var dataArray = new Array(labelArray.length);
    // take a single label and get the list of data associated with it.
    // when you do then you will return an array with min/max and quartiles.

    function returnQuartiles(needle, array) {
        var label;
        var scoreList = [];
        array.forEach(function (eval) {
            label = eval.year + " - " + eval.semesterName;
            if (label == needle) {
                if (typeof eval.score == 'string') {
                    eval.score = parseFloat(eval.score);
                }
                scoreList.push(eval.score);
            }
        });
        scoreList.sort();
        var q1Arr = (scoreList.length % 2 == 0) ? scoreList.slice(0, (scoreList.length / 2)) : scoreList.slice(0, Math.floor(scoreList.length / 2));
        var q2Arr = scoreList;
        var q3Arr = (scoreList.length % 2 == 0) ? scoreList.slice((scoreList.length / 2), scoreList.length) : scoreList.slice(Math.ceil(scoreList.length / 2), scoreList.length);
        var min = scoreList[0];
        var Q1 = medianX(q1Arr);
        var Q3 = medianX(q3Arr);
        var max = scoreList[scoreList.length - 1];

        function medianX(medianArr) {
            count = medianArr.length;
            median = (count % 2 == 0) ? (medianArr[(medianArr.length / 2) - 1] + medianArr[(medianArr.length / 2)]) / 2 : medianArr[Math.floor(medianArr.length / 2)];
            return median;
        }
        var chartData = [needle, min, Q1, Q3, max];
        return chartData;
    }
    // For each label, take and compile min max and quartiles;
    var chartData = [];
    labelArray.forEach(function (label) {
        var semesterData = returnQuartiles(label, objArray);
        chartData.push(semesterData);
    });
    return chartData;
}
//
function generateTable(objArray) {
    var TocHtml = "";
    var labelArray = getLabels(objArray);
    var colWidth = 80;
    labelArray.forEach(function (label) {
        TocHtml = TocHtml + "<table class='tocTable'><tbody>";
        TocHtml = TocHtml + "<tr><td colspan='4'>" + label + "</td></tr>";
        TocHtml = TocHtml + "<tr class='thead'><td width='" + colWidth + "'>CRN</td><td width='" + colWidth + "'>Score</td><td width='" + colWidth + "'>Standard Deviation</td><td width='" + colWidth + "'>Num Responses</td></tr>";
        objArray.forEach(function (eval) {
            console.log(eval);
            if (label == eval.year + " - " + eval.semesterName) {
                TocHtml = TocHtml + '<tr><td><a href="#class'+ eval.crn + '">'   + eval.crn + "</a></td><td>" + eval.score + "</td><td>" + eval.stddev + "</td><td>" + eval.totalRespondents + "</td></tr>";
            }
        });
        TocHtml = TocHtml + "</tbody></table>"
    });
    console.log(TocHtml);
    $("#table").append(TocHtml);
}

function getLabels(objArray) {
    var labelArray = [];
    //determine the number of Labels
    objArray.forEach(function (eval) {
        var label;
        // add in the semester number so that we can sort and add * so we can split out that num later
        label = eval.year + " - *" + eval.semesterNum + "*" + eval.semesterName;
        if (!(labelArray.indexOf(label) > -1)) {
            labelArray.push(label);
        }
        //end foreach loop
    });
    //Sort labels into order.
    labelArray.sort();
    // Rename Labels to semester name instead of number
    for (var i = 0; i < labelArray.length; i++) {
        var temp = labelArray[i].split("*");
        labelArray[i] = temp[0] + temp[2];
    }
    return labelArray;
}

// i use LoadChart to create the chart -- all of this would be implemented in another file.
// i am using a temp variable, actually this would be passed in from the generating of the report.
/*
var tempData = makeArray();
loadChart(tempData);
$(document).ready(function () {
    generateTable(tempData);
});

function makeArray() {
    var objArray = [];
    var semesterNames = ["", "Spring:", "Summer:", "Fall:"];

    for (var i = 0; i < 9 ; i++) {
        var randomNum = Math.floor((Math.random() * 3) + 1);
        var CRNNum = Math.floor((Math.random() * 90000) + 10000);
        var fancyObj = {
            crn: CRNNum,
            score: Math.random() * 4,
            stddev: (Math.random() * 1.5) + .5,
            totalRespondents: Math.floor((Math.random() * 20) + 1),
            semesterNum: randomNum,
            semesterName: semesterNames[randomNum],
            className: "CS" + CRNNum,
            year: Math.floor((Math.random() * 3) + 2013)
        }
        objArray.push(fancyObj);
    }
    return objArray;
}
*/
