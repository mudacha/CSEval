/**
 * Created by Haydn on 4/23/2016.
 */

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
// All of the functions and objects inside of this would be placed inside the on success inside the ajax call
function generateDummyData() {

    var circleObj = {
        type: "scatter",
        markerType: "circle",
        toolTipContent: "<span style='\"'color: {color};'\"'><strong>{name}</strong></span><br/><strong> Score</strong> {x} <br/><strong> Year</strong> {y}<br/><strong>Semester</strong> {SemesterVal}<br/><strong>Instructor</strong> {Professor} <br/><strong>Course</strong> {course}</span>",
        name: "Sections you teach",
        showInLegend: true,
        dataPoints: []
    };

    var squareObj = {
        type: "scatter",
        markerType: "square",
        toolTipContent: "<span style='\"'color: {color};'\"'><strong>{name}</strong></span><br/><strong> Score</strong> {x} <br/><strong> Year</strong> {y}<br/><strong>Semester</strong> {SemesterVal}<br/><strong>Instructor</strong> {Professor} <br/><strong>Course</strong> {course}</span>",
        name: "Other sections you can view",
        showInLegend: true,
        dataPoints: []
    };

    var triangleObj = {
        type: "scatter",
        markerType: "triangle",
        toolTipContent: "<span style='\"'color: {color};'\"'><strong>{name}</strong></span><br/><strong> Score</strong> {x} <br/><strong> Year</strong> {y}<br/><strong>Semester</strong> {SemesterVal}<br/></span>",
        name: "Sections you cannot view",
        showInLegend: true,
        dataPoints: []
    };

    for (var i = 0; i < 100; i++) {
        var tempScore = parseFloat((Math.random() * 4).toFixed(2));


        //     var tempColor = (Math.random() * 50).toFixed(0);
        var tempColor = getRandomInt(0, 2);

        function randSemester() {
            var x = Math.floor((Math.random() * 3)) + 1;
            if (x == 1) {
                return "Spring";
            }
            else if (x == 2) {
                return "Summer";
            }
            else {
                return "Fall";
            }
        }

        // Dummy fucntion to assign random proffessors
        function randProfessor() {
            var x = Math.floor((Math.random() * 3)) + 1;
            if (x == 1) {
                return "Brad Peterson";
            }
            else if (x == 2) {
                return "Rob Hilton";
            }
            else {
                return "Brian Rague";
            }
        }

        var year = Math.floor((Math.random() * 5)) + 2013;

        if (tempColor == 0) {
            triangleObj.dataPoints.push({
                x: tempScore,
                y: year,
                SemesterVal: randSemester(),
                Professor: randProfessor(),
                course: "CS 1400"
            })
        }
        else if (tempColor == 1) {
            circleObj.dataPoints.push({
                x: tempScore,
                y: year,
                SemesterVal: randSemester(),
                Professor: randProfessor(),
                course: "CS 1400"
            })
        }
        else if (tempColor >= 2) {
            squareObj.dataPoints.push({
                x: tempScore,
                y: year,
                SemesterVal: randSemester(),
                Professor: randProfessor(),
                course: "CS 2420"

            })
        }

    }

    return [triangleObj, circleObj, squareObj];
}

window.onload = function () {


        var chart = new CanvasJS.Chart("chartContainer",
            {
                zoomEnabled: true,

                title: {
                    text: "Computer Science CS 1400 to CS 2400",
                    fontSize: 20
                },
                animationEnabled: true,
                axisX: {
                    title: "Rating",
                    titleFontSize: 20,
                    minimum: 0,
                    maximum: 4

                },
                axisY: {
                    title: "Year",
                    titleFontSize: 20,
                    minimum: 2010,
                    maximum: 2020
                },
                legend: {
                    verticalAlign: 'bottom',
                    horizontalAlign: "center",

                },

                data: generateDummyData()
                ,
                legend: {
                    cursor: "pointer",
                    itemclick: function (e) {
                        if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                            e.dataSeries.visible = false;
                        }
                        else {
                            e.dataSeries.visible = true;
                        }

                        chart.render();
                    }
                }
            });

        chart.render();
    }

