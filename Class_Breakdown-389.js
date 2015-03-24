
	
	
function getPixelLength(score)
{
   return score *100;
}

function normPixelLength()
{
	var  variance = 0;

	var max = 0;
	var maxIndex = 0;
	
	for (var i = 0; i < window.currentLengths.length; i++) 
	{
		variance += Math.round(window.currentLengths[i]);
		if (window.currentLengths[i] > max) 
		{
			maxIndex = i;
			max = window.currentLengths[i];
		}
		window.currentLengths[i] = Math.round(window.currentLengths[i]);
	}
	
	variance -= totalBarLength;
	window.currentLengths[maxIndex] = window.currentLengths[maxIndex] - variance;
}

function getPixelLengthBasic()
{
	var result = [];
	result.push(getAnswerLength(window.currentSD));
	result.push(getAnswerLength(window.currentD));
	result.push(getAnswerLength(window.currentN));
	result.push(getAnswerLength(window.currentA));
	result.push(getAnswerLength(window.currentSA));
	if (window.currentNA > 0)
	{
		result.push(getAnswerLength(window.currentNA));
	}
	return result;		
}
	
function getAnswerLength(answerCount)
{
	if(answerCount == 0 || window.currentTotal == 0)
	{
		return 0;
	}
	var returnValue = ((answerCount/window.currentTotal) * window.totalBarLength);
	returnValue *= 10;
	returnValue = Math.floor(returnValue);
	returnValue /= 10;
	return returnValue;
}
	
//ESSAY QUERY FUNCTION*************************************************************************************************************************************************
function essayQuery(crn, semester, year)
{
	jQuery.getJSON('https://chitester1dev.weber.edu:6838/misc/weber/CSEvals/essayAnswers.cfm?crn='+crn+'&semester='+semester+'&year='+year+'&testId='+TestID, function(data) 
	{
		var numberOfStudents = 0;
		var questionsAndResponses = [];
		var questionIndex = 0;
		
		// Get number of students and create the array
		//var obj = $.parseJSON(data);
		$.each(data.DATA, function(i,array) 
		{
			var tempArray = [];		
			var questionFound = false;
			var dataArray = toKeyValPair(data.COLUMNS, String(array).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY
		
			for(var questionData = 0; questionData < questionsAndResponses.length; questionData++)
			{
				if(dataArray['QUESTION'] == questionsAndResponses[questionData][0])
				{
					questionFound = true;
					break;
				}
			}
			
			if(questionFound == false)
			{
				tempArray[0] = dataArray['QUESTION'];
				
				questionsAndResponses[questionIndex] = tempArray;
				questionIndex++;
			}
		
			if(numberOfStudents < parseInt(dataArray['STUDENT']))
			{
				numberOfStudents = parseInt(dataArray['STUDENT']);
			}
		});
				
		for(var studentNum = 0; studentNum < numberOfStudents; studentNum++)
		{
			for(var q = 0; q < questionsAndResponses.length; q++)
			{
				var studentResponseFound = false;					
			
				$.each(data.DATA, function(i,array) 
				{
					//ARRAY IN THIS CASE DOES NOT HAVE A KEY VALUE PAIR TO MAP
					if(questionsAndResponses[q][0] == array[5] && studentNum == array[7])
					{											
						questionsAndResponses[q].push(array[6]);
						studentResponseFound = true;
						return false;									
					}
				
				});
				
				if(!studentResponseFound)
				{
					questionsAndResponses[q].push("No Response");
				}
			}
		}
		
		var eQuestions = "";
		for(var printQuestion = 0; printQuestion < questionsAndResponses.length; printQuestion++)
		{
		
			var tempArray = questionsAndResponses[printQuestion];
			eQuestions += "<div class='question_box'><table class='essay_table_settings'><tr><td style='vertical-align:text-top; text-align:right'> <img class = 'question_image_box' src = 'images/colorItemBackground.png'> "+ (printQuestion + 1) + ".  </td><td></td><td align='left'>" + tempArray[0] + "</td></tr>";
			
			for(var responses = 1; responses < tempArray.length; responses++)
			{
			
				var noResponse = "";
				
				if(tempArray[responses] == "No Response"){
					
					noResponse = "font-style:italic";
					
				}
				eQuestions += "<tr><td style='font-weight:normal; vertical-align:text-bottom; text-align:right'>&nbsp;&nbsp;" + responses + "</td><td align='right'></td><td align='left' class='essay_responses' style='" + noResponse + "'><pre>" + tempArray[responses] + "</pre></td></tr>";
			}
			eQuestions += "</table></div>";
		}
		$("#EssayWrapper").append(eQuestions);
	});
}
//END ESSAY QUERY FUNCTION*********************************************************************************************************************************************

//MAIN QUERY FUNCTION**************************************************************************************************************************************************
function mainQuery(crn, semester, year)
{
	$.ajax(
	{
		url: 'https://chitester1dev.weber.edu:6838/misc/weber/CSEvals/AnswerCount.cfm?crn='+crn+'&semester='+semester+'&year='+year+'&testId='+TestID,
		type: "GET",
		dataType:"json",
		success: function(data)
		{
			$.each(data.DATA, function(i,array)
			{
				var dataArray = toKeyValPair(data.COLUMNS, String(array).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY
				//$.each(dataArray, function(i,array)
				//{
				//	document.write(i + ": " + array + "<br />");
				//});
				totalRespondents = dataArray['STUDENT COUNT'];
				window.currentQuestion = dataArray['QUESTION'];
				window.currentQuestionID = dataArray['QUESTIONID'];
				window.currentQuestionSequence = dataArray['SEQUENCE'];
				$.each(data.DATA, function(i,innerArray) 
				{						
					var innerDataArray = toKeyValPair(data.COLUMNS, String(innerArray).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY
					
					if(window.currentQuestion == innerDataArray['QUESTION'] && window.finishedQuestions.indexOf(window.currentQuestion + " - " + innerDataArray['ANSWERS'].toLocaleLowerCase()) == -1)
					{
						switch(innerDataArray['ANSWERS'].toLocaleLowerCase())
						{
							case 'strongly disagree' :
							case 'very poor' :
								window.currentSD+= +innerDataArray['ANSWER COUNT'];
								window.currentTotal+= +innerDataArray['ANSWER COUNT'];
								break;
							case 'disagree' :
							case 'poor' :
								window.currentD+= +innerDataArray['ANSWER COUNT'];
								window.currentTotal+= +innerDataArray['ANSWER COUNT'];						  
								break;
							case 'neutral' :
							case 'average' :
								window.currentN+= +innerDataArray['ANSWER COUNT'];
								window.currentTotal+= +innerDataArray['ANSWER COUNT'];
								break;
							case 'agree' :
							case 'good' :
								window.currentA+= +innerDataArray['ANSWER COUNT'];
								window.currentTotal+= +innerDataArray['ANSWER COUNT'];
								break;					
							case 'strongly agree' :
							case 'excellent' :
								window.currentSA+= +innerDataArray['ANSWER COUNT'];
								window.currentTotal+= +innerDataArray['ANSWER COUNT'];
								break;
							case 'n/a' :
								window.currentNA+= +innerDataArray['ANSWER COUNT'];
								window.currentTottal+= +innerDataArray['ANSWER COUNT'];
							break;
						}
						window.finishedQuestions.push(window.currentQuestion + " - " + innerDataArray['ANSWERS'].toLocaleLowerCase());
					}
				});
			
				if(window.printedQuestions.indexOf(window.currentQuestion) == -1)
				{
					questionCollapserId += 1;
					totalQuestions++;
					window.currentLengths = getPixelLengthBasic();
					window.printedQuestions.push(window.currentQuestion);
					$("#array").append('<p style="clear:both;">' + window.currentQuestion + " - " + window.currentSD + " - " + window.currentD + " - "  + window.currentN + " - " + window.currentA +" - " + window.currentSA +" - " + window.currentTotal + "</p>" );
					
					var buildString = '<div class="question_box question_box_collapsed '+questionCollapserId+'"><button id="' + questionCollapserId + '" class="button">↕</button><input type="hidden" class="hiddenQuestionID" value="'+window.currentQuestionID+'"/><div class="toggle">';
					buildString += '<img class = "question_image_box" src = "images/colorItemBackground.png"><div class="question"><h4>'+window.currentQuestionSequence + ". " + window.currentQuestion+'</h4></div><div class="question_graph"> ';

					var  variance = 0;

					var max = 0;
					var maxIndex = 0;
					
					for (var i = 0; i < window.currentLengths.length; i++) 
					{
						variance += Math.round(window.currentLengths[i]);
						if (window.currentLengths[i] > max) 
						{
							maxIndex = i;
							max = window.currentLengths[i];
						}
						window.currentLengths[i] = Math.round(window.currentLengths[i]);
					}
					
					variance -= 400;
					//document.write(variance);
					window.currentLengths[maxIndex] = window.currentLengths[maxIndex] - variance;
					
					buildString +='<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="'+window.currentLengths[0]+'px" height="'+barHeight+'px" title="Strongly Disagree: '+window.currentSD+'/'+window.currentTotal+'"> ';
					buildString +='<img class="displaycolor" src = "images/colorDisagree.png" width="'+window.currentLengths[1]+'px" height="'+barHeight+'px" title="Disagree: '+window.currentD+'/'+window.currentTotal+'"> ';
					buildString +='<img class="displaycolor" src = "images/colorNeutral.png" width="'+window.currentLengths[2]+'px" height="'+barHeight+'px" title="Neutral: '+window.currentN+'/'+window.currentTotal+'"> ';
					buildString +='<img class="displaycolor" src = "images/colorAgree.png" width="'+window.currentLengths[3]+'px" height="'+barHeight+'px" title="Agree: '+window.currentA+'/'+window.currentTotal+'"> ';
					buildString +='<img class="displaycolor" src = "images/colorStronglyAgree.png" width="'+window.currentLengths[4]+'px" height="'+barHeight+'px" title="Strongly Agree: '+window.currentSA+'/'+window.currentTotal+'"> ';
					if (window.currentNA > 0)
					{
						buildString +='<img class="displaycolor" src = "images/colorNA.png" width="'+window.currentLengths[6]+'px" height="'+barHeight+'px" title="N\/A: '+window.currentNA+'/'+window.currentTotal+'"> ';
					}
					
//					buildString += '<div class="graph_box graphStronglyDisagree" title="Strongly Disagree: '+window.currentSD+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[0]+'px;">';
//					buildString += '<div class="graph_box graphStronglyDisagree" title="Strongly Disagree: '+window.currentSD+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[0]+'px;">';
					//buildString += '</div><div class="graph_box graphDisagree" title="Disagree: '+window.currentD+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[1]+'px;">';
					//buildString += '</div><div class="graph_box graphNeutral" title="Neutral: '+window.currentN+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[2]+'px;">';
					//buildString += '</div><div class="graph_box graphAgree" title="Agree: '+window.currentA+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[3]+'px;">';
					//buildString += '</div><div class="graph_box graphStronglyAgree" title="Strongly Agree: '+window.currentSA+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[4]+'px;">';
					buildString += '</div></div><table class="question_scores"><tr><td class="question_answers_collapsed">SD: '+window.currentSD+'</td>';
					buildString += '<td class="question_answers_collapsed">D: '+window.currentD+'</td>';
					buildString += '<td class="question_answers_collapsed">N: '+window.currentN+'</td>';
					buildString += '<td class="question_answers_collapsed">A: '+window.currentA+'</td>';
					buildString += '<td class="question_answers_collapsed">SA: '+window.currentSA+'</td>';
					if (window.currentNA > 0)
					{
						buildString += '<td class="question_answers_collapsed">NA: '+window.currentNA+'</td>';
					}
					buildString += '</tr></table><br/></div></div>';	
					buildString += '<!--' + window.currentQuestion + '-->'
					buildString += '<div class="question_box question_box_expanded '+questionCollapserId+'"></div>';
					var q = {};
					q[0] = window.currentQuestion;
					q[1] = window.currentSD;
					q[2] = window.currentD;
					q[3] = window.currentN;
					q[4] = window.currentA;
					q[5] = window.currentSA;
					q[6] = window.currentTotal;
					q[7] = window.currentNA; //ADDED FOR NA
					questionJSON[questionCollapserId] = q;
					$("#questions_wrapper").append(buildString);
				}
			
				window.currentQuestion = " ";
				window.currentSD = 0;
				window.currentD = 0;
				window.currentN = 0;
				window.currentA = 0;
				window.currentSA = 0;
				window.currentTotal = 0;
			});
		}
	});
}
//END MAIN QUERY FUNCTION**********************************************************************************************************************************************

function titleQuery(crn,semester,year)
{
	$.ajax(
	{
		url: 'https://chitester1dev.weber.edu:6838/misc/weber/CSEvals/CrnDetails.cfm?crn='+crn+'&semester='+semester+'&year='+year+'&testId='+TestID,
		type: "GET",
		dataType: "json",
		success: function (data) 
		{
			if(data.DATA == "") //IN THE EVENT TITLE DATA CANNOT BE RETRIEVED
			{
				$("#title_wrapper").append('<h2>Course Evaluation</h2>' + ' Semester ' + Semester + ' - CRN ' + CRN + ' - Year ' + Year);
				window.ClassName = 'CRN ' + CRN;
			}
			else				//RETREIVE AND UTILIZE TITLE DATA
			{
				$.each(data.DATA, function(i,array) 
				{
					var dataArray = toKeyValPair(data.COLUMNS, String(array).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY

					window.ClassName = dataArray['CLASSSTRING'];
					if(dataArray['SEMESTERSTRING'] == "Summer" || dataArray['SEMESTERSTRING'] == "Fall") 
					{
						dataArray['YEAR'] -= 1; //Set the year back one
					}
					$("#title_wrapper").append('<h2>Course Evaluation</h2>'+dataArray['FIRSTNAME']+' '+dataArray['LASTNAME']+' - '+dataArray['CLASSSTRING']+' - CRN '+dataArray['BANNERCRN']+' - '+dataArray['SEMESTERSTRING']+' '+dataArray['YEAR']+'');
				});
			}
		}
	});
}

function topQuery(crn,semester,year)
{
	$("#StatisticsWrapper").hide();
	
	jQuery.getJSON('https://chitester1dev.weber.edu:6838/misc/weber/CSEvals/CrnStatistics.cfm?crn='+crn+'&semester='+semester+'&year='+year+'&testId='+TestID, function(data) 
	{
		var keyValPair = toKeyValPair(data.COLUMNS, String(data.DATA).split(','));

		crnStatistics = keyValPair['INSTRUCTORSEMESTERAVERAGE'];
		currentLengths = new Array(getPixelLength(keyValPair['CLASSSCORE']).toFixed(2), (400-getPixelLength(keyValPair['CLASSSCORE']).toFixed(2)));
		normPixelLength();
		var tempString = '';
		tempString = tempString + '<table id="topTable">';
		tempString = tempString + '		<tbody><tr>';
		tempString = tempString + '			<td></td>';
		tempString = tempString + '			<td></td>';
		tempString = tempString + '			<td></td>';
		tempString = tempString + '			<td style="max-width:100px;text-align:center;font-size:12px;">Standard Deviation</td>';
		tempString = tempString + '		</tr>';
		tempString = tempString + '		<tr>';
		tempString = tempString + '			<td class="bigger bolder" style="width: 300px;"><button class="tpbutton">↕</button><input type="hidden"/> Your Overall Score</td>';
		tempString = tempString + '			<td class="bigger bolder" style="width: 60px">'+Number(keyValPair['CLASSSCORE']).toFixed(2)+'</td>';
		//TOPLINE ON GRAPH
		//tempString = tempString + '			<td><div class="container ticks"><div class="overall_ bigbar yellow ticks" style="width:'+getPixelLength(keyValPair['CLASSSCORE']).toFixed(2)+'px"></div></div></td>';
		tempString = tempString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="'+currentLengths[0]+'px" height=40px"><img align="left" src = "images/colorTopBarBackground.png" width="'+currentLengths[1]+'px" height=40px"><img style="position:absolute; top:0; left:0" src = "images/ticks.png"></div></td>';

		tempString = tempString + '			<td style="width: 100px; text-align:center">'+Number(keyValPair['CLASSSTDEVIATION']).toFixed(2)+'</td>';
		tempString = tempString + '		</tr>';
		tempString = tempString + '	</tbody>';
		tempString = tempString + ' </table>';
		tempString = tempString + ' <div id="top_detail"></div>';
		$("#StatisticsWrapper").prepend(tempString);
		$("#StatisticsWrapper").slideDown(200);
		$(".loadinggif").remove();

	});
}

function toKeyValPair(names, values)
{
	var result = {};
	for(var i = 0; i < names.length; i++)
	{
		result[names[i]] = values[i];
	}
	return result;
}

//TOP DETAILS FUNCTION**************************************************************************************************************************************************
function detailsTop(crn,semester,year,clickedButton)
{
	var UIspeed = 300;

	var originalDiv = $("#top_detail");
	if($(originalDiv).hasClass("Already_Expanded"))
	{
		if( $(originalDiv).is(':visible') )
		{
			originalDiv.slideUp(UIspeed);
			return;
		}
		originalDiv.slideDown(UIspeed);
		return;
	}

	jQuery.get('https://chitester1dev.weber.edu:6838/misc/weber/CSEvals/CrnStatistics.cfm?crn='+crn+'&semester='+semester+'&year='+year+'&testId='+TestID, function(data) 
	{
		var statsTableString = 					 ' <table style="margin-top:0px">';
		    statsTableString = statsTableString +' <tbody>';

		$("#top_detail").before('<p class="loadinggif">Calculating...</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');

		$.each(data.DATA, function(i,array) 
		{
			var crnStatistics2 = toKeyValPair(data.COLUMNS, String(data.DATA).split(','));

			jQuery.get('https://chitester1dev.weber.edu:6838/misc/weber/CSEvals/ScoreByCategory.cfm?crn='+crn+'&semester='+semester+'&year='+year+'&testId='+TestID, function(data2) 
			{
				statsTableString = statsTableString + ''
				$.each(data2.DATA, function(i,array2) 
				{
					var questionNumList = array2[4].split(',');
					for(var i = 0; i < questionNumList.length; i++)
					{
						questionNumList[i] = parseInt(questionNumList[i]);
					}

					questionNumList.sort(function(a,b){return a-b});

					var orderingPrintString = "";
					
					for(var i = 0; i < questionNumList.length; i++)
					{
						orderingPrintString += questionNumList[i];
						if(i != questionNumList.length - 1)
						{
							orderingPrintString += ", ";
						}
					}
					
					statsTableString = statsTableString + '<tr style="display:none;">';
					statsTableString = statsTableString + '	<td style="width: 300px;">'+array2[2]+' (Qs '+orderingPrintString+')</td>';
					statsTableString = statsTableString + '	<td style="width: 60px">'+Number(array2[0]).toFixed(2)+'</td>';
					//statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar yellow littleTicks" style="width:'+getPixelLength(array2[0]).toFixed(2)+'px"></div></div></td>';
					statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="'+getPixelLength(array2[0]).toFixed(2)+'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="'+(400-getPixelLength(array2[0]).toFixed(2))+'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';
					
					statsTableString = statsTableString + '	<td style="width: 100px; text-align:center">'+Number(array2[1]).toFixed(2)+'</td>';
					statsTableString = statsTableString + '</tr>';
				});
			}).done(function() 
			{ 
				statsTableString = statsTableString + '<tr class="gap" style="display:none;">';
				statsTableString = statsTableString + '	<td style="width: 300px;">Your Overall Semester Average</td>';
				statsTableString = statsTableString + '	<td style="width: 60px">'+Number(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2)+'</td>';
				//statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2)+'px"></div></div></td>';
				statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="'+getPixelLength(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2)+'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="'+(400-getPixelLength(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2))+'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';
				
				statsTableString = statsTableString + '	<td style="width: 100px;text-align:center">'+Number(crnStatistics2['INSTRUCTORSEMESTERSTDEVIATION']).toFixed(2)+'</td>';
				statsTableString = statsTableString + '</tr>';
				statsTableString = statsTableString + '<tr style="display:none;">';
				statsTableString = statsTableString + '	<td style="width: 300px;">Dept. Semester Average</td>';
				statsTableString = statsTableString + '	<td style="width: 60px">'+Number(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2)+'</td>';
				//statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2)+'px"></div></div></td>';
				statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="'+getPixelLength(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2)+'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="'+(400-getPixelLength(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2))+'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';
				
				statsTableString = statsTableString + '	<td style="width: 100px;text-align:center">'+Number(crnStatistics2['DEPARTMENTSEMESTERSTDEVIATION']).toFixed(2)+'</td>';
				statsTableString = statsTableString + '</tr>';
				statsTableString = statsTableString + '<tr style="display:none;">';
				statsTableString = statsTableString + '	<td style="width: 300px;">Dept. '+window.ClassName+' 5 Year Average</td>';
				statsTableString = statsTableString + '	<td style="width: 60px">'+Number(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2)+'</td>';
				//statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2)+'px"></div></div></td>';
				statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="'+getPixelLength(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2)+'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="'+(400-getPixelLength(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2))+'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';
				
				statsTableString = statsTableString + '	<td style="width: 100px;text-align:center">'+Number(crnStatistics2['DEPARTMENTCLASSFIVEYEARSTDEVIATION']).toFixed(2)+'</td>';
				statsTableString = statsTableString + '</tr>';
				statsTableString = statsTableString + '<tr style="display:none;">';
				statsTableString = statsTableString + '	<td style="width: 300px;">Your '+window.ClassName+' 5 Year Average</td>';
				statsTableString = statsTableString + '	<td style="width: 60px">'+Number(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2)+'</td>';
				//statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2)+'px"></div></div></td>';
				statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="'+getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2)+'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="'+(400-getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2))+'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';
				
				statsTableString = statsTableString + '	<td style="width: 100px;text-align:center">'+Number(crnStatistics2['INSTRUCTORCLASSFIVEYEARSTDEVIATION']).toFixed(2)+'</td>';
				statsTableString = statsTableString + '</tr>';
				statsTableString = statsTableString + '<tr style="display:none;">';
				statsTableString = statsTableString + '	<td class="bolder" style="text-align:center;" colspan="4">A score of '+Number(crnStatistics2['CLASSSCORE']).toFixed(2)+' places you in the '+Number(crnStatistics2['DECTILE'])+'th decile of your department this semester.</td>';
				statsTableString = statsTableString + '</tr>';
				statsTableString = statsTableString + '<td class="bolder" style="text-align:center;" colspan="4"> Total number of respondents: ' + totalRespondents + '</td>';
				statsTableString = statsTableString + '</tr>';
				statsTableString = statsTableString + '';
				
				originalDiv.append(statsTableString);
				originalDiv.find(":hidden").slideDown(UIspeed);
				$(".loadinggif").remove();
			});
		});
	});
	
	statsTableString = '	</tbody>';
	statsTableString = statsTableString +'	</table>';
	originalDiv.append(statsTableString);

	originalDiv.addClass("Already_Expanded");
	statsTableString = '';
}
//END TOP DETAILS FUNCTION**********************************************************************************************************************************************

function detailsQuery(crn, semester, year, questionId, clickedButton)
{
	var UIspeed = 300;
	var questionNumber = $(clickedButton).attr("id");
	var originalDiv = $(clickedButton).parent();	
	
	var expanderDiv = $(clickedButton).parent().siblings(".question_box_expanded").filter('.' + questionNumber);

	if($(originalDiv).hasClass("Already_Expanded"))
	{
		originalDiv.hide();
		expanderDiv.slideDown(UIspeed);
		return;
	}
	
	if($(originalDiv).hasClass('question_box_expanded'))
	{
		originalDiv.hide()
		var collapseDiv = $(originalDiv).siblings(".question_box_collapsed").filter('.' + questionNumber);
		collapseDiv.slideDown(UIspeed);
			
		return;
	}

originalDiv.addClass("Already_Expanded");
originalDiv.hide();
expanderDiv.before('<span class="loadinggif">Calculating...</span><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');
//expanderDiv.show('<img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');


	$.ajax(
	{
		url:("https://chitester1dev.weber.edu:6838/misc/weber/CSEvals/QuestionDetails.cfm?crn="+crn+"&semester="+semester+"&year="+year+"&questionID="+questionId),
		type:"GET",
		dataType:"json",
		success: function (data) 
		{
			//resultString += '<p class="loadinggif">Calculating...</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif';
			//expanderDiv.append(resultString);
			//var connectionString = '';

			var array = toKeyValPair(data.COLUMNS, String(data.DATA).split(','));
			var totalResponses = questionJSON[questionNumber][1] + questionJSON[questionNumber][2] + questionJSON[questionNumber][3] + questionJSON[questionNumber][4] + questionJSON[questionNumber][5] + questionJSON[questionNumber][7];
			var tableWidth;
			var cellWidth;
			
			if (questionJSON[questionNumber][7])
			{
				tableWidth = 215;
				cellWidth = 38;
			}
			else
			{
				tableWidth = 225;
				cellWidth = 47;
			}
			
			resultString +='			<button id="' + questionNumber + '" class="button '+questionNumber+'">↕</button>';
			if (questionJSON[questionNumber][7] > 0)
			{
				resultString +='<table class="table_settings" border="0" style="position:relative; left:22px; margin-top:0px; margin-bottom:-5px; width:900px;">			';
			}
			else
			{
				resultString +='<table class="table_settings" border="0" style="position:relative; left:54px; margin-top:0px; margin-bottom:-5px; width:900px;">			'; //N/A DATA
			}
			resultString +='					<tbody><tr>	';
			resultString +='						<td colspan="7">';
			if (questionJSON[questionNumber][7] > 0)
			{
				resultString +='							<div class="question hiddenQuestionNA">';
			}
			else
			{
				resultString +='							<div class="question hiddenQuestion">';
			}
			resultString +='									'+questionNumber + '. '+ questionJSON[questionNumber][0];+'';
			resultString +='							</div>';
			resultString +='						</td>';
			resultString +='					</tr>';
			resultString +='					<tr>';
			resultString +='						<td align="left" style="width:' + tableWidth + 'px"> </td>'; // N/A DATA
			resultString +='						<td align="left" >SD</td>	';
			resultString +='						<td align="left" >D</td>';
			resultString +='						<td align="left" >N</td>';
			resultString +='						<td align="left" >A</td>';
			resultString +='						<td align="left" >SA</td>	';
			if (questionJSON[questionNumber][7] > 0)
			{
				resultString +='						<td align="left" >N\/A</td>	';//N\A DATA
			}
			resultString +='						<td align="left"></td>';
			resultString +='					</tr>';
			resultString +='					<tr>';
			resultString +='						<td align="left" style="width:' + tableWidth + 'px"> </td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+questionJSON[questionNumber][1]+'</td>	';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+questionJSON[questionNumber][2]+'</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+questionJSON[questionNumber][3]+'</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+questionJSON[questionNumber][4]+'</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+questionJSON[questionNumber][5]+'</td>	';
			if (questionJSON[questionNumber][7] > 0)
			{
				resultString +='						<td align="left" style="width:' + cellWidth + '">'+questionJSON[questionNumber][7]+'</td>	';	//N/A DATA
			}
			resultString +='						<td align="left" rowspan="2"> ';
			resultString +='						<div class="graph_expanded">';
			currentLengths = new Array(((questionJSON[questionNumber][1])/(totalResponses))*totalBarLength,
										((questionJSON[questionNumber][2])/(totalResponses))*totalBarLength,
										((questionJSON[questionNumber][3])/(totalResponses))*totalBarLength,
										((questionJSON[questionNumber][4])/(totalResponses))*totalBarLength,
										((questionJSON[questionNumber][5])/(totalResponses))*totalBarLength,
										((questionJSON[questionNumber][7])/(totalResponses))*totalBarLength);
			normPixelLength();
				// statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2)+'px"></div></div></td>';
			// resultString +='								<div class="colorStronglyDisagree" style="width:'+((questionJSON[questionNumber][1])/(questionJSON[questionNumber][6]))*totalBarLength+'px"></div>	';
			resultString +='								<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="'+currentLengths[0]+'px" height="'+barHeight+'px" title="Strongly Disagree: '+questionJSON[questionNumber][1]+'/'+totalResponses+'"> ';
			resultString +='								<img class="displaycolor" src = "images/colorDisagree.png" width="'+currentLengths[1]+'px" height="'+barHeight+'px" title="Disagree: '+questionJSON[questionNumber][2]+'/'+totalResponses+'"> ';
			resultString +='								<img class="displaycolor"  src = "images/colorNeutral.png" width="'+currentLengths[2]+'px" height="'+barHeight+'px" title="Neutral: '+questionJSON[questionNumber][3]+'/'+totalResponses+'"> ';
			resultString +='								<img class="displaycolor" src = "images/colorAgree.png" width="'+currentLengths[3]+'px" height="'+barHeight+'px" title="Agree: '+questionJSON[questionNumber][4]+'/'+totalResponses+'"> ';
			resultString +='								<img class="displaycolor"  src = "images/colorStronglyAgree.png" width="'+currentLengths[4]+'px" height="'+barHeight+'px" title="Strongly Agree: '+questionJSON[questionNumber][5]+'/'+totalResponses+'"> ';
			if (questionJSON[questionNumber][7] > 0)
			{
				resultString +='								<img class="displaycolor"  src = "images/colorNA.png" width="'+currentLengths[5]+'px" height="'+barHeight+'px" title="N\/A: '+questionJSON[questionNumber][7]+'/'+totalResponses+'"> ';//N/A DATA
			}
			
			resultString +='						</div>';
			resultString +='						</td>';
			resultString +='					</tr>';
			resultString +='					<tr><img class = "question_image_box" src = "images/colorItemBackground.png">';
			resultString +='						<td align="left" style="width:' + tableWidth + 'px">Your Score</td>'; //FIXED NO TITLE FOR THIS CATEGORY
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((questionJSON[questionNumber][1]/questionJSON[questionNumber][6])*100).toFixed(0)+'%</td>	';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((questionJSON[questionNumber][2]/questionJSON[questionNumber][6])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((questionJSON[questionNumber][3]/questionJSON[questionNumber][6])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((questionJSON[questionNumber][4]/questionJSON[questionNumber][6])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((questionJSON[questionNumber][5]/questionJSON[questionNumber][6])*100).toFixed(0)+'%</td>	';
			if (questionJSON[questionNumber][7])
			{
				resultString +='						<td align="left" style="width:' + cellWidth + '">'+((questionJSON[questionNumber][7]/questionJSON[questionNumber][6])*100).toFixed(0)+'%</td>	';// N/A DATA
			}
			resultString +='					</tr>	';
			resultString +='					<tr>';
			resultString +='						<td align="left" style="width:100px">Dpt Average This Semester</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTSEMESTERAVERAGESD']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTSEMESTERAVERAGED']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTSEMESTERAVERAGEN']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTSEMESTERAVERAGEA']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTSEMESTERAVERAGESA']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			if (questionJSON[questionNumber][7])
			{
				resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTSEMESTERAVERAGENA']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';// N/A DATA
			}
			
			currentLengths = new Array(((array['DPTSEMESTERAVERAGESD']/array['DPTSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['DPTSEMESTERAVERAGED']/array['DPTSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['DPTSEMESTERAVERAGEN']/array['DPTSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['DPTSEMESTERAVERAGEA']/array['DPTSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['DPTSEMESTERAVERAGESA']/array['DPTSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['DPTSEMESTERAVERAGENA']/array['DPTSEMESTERAVERAGETOTAL'])*totalBarLength));
			normPixelLength();
			resultString +='						<td align="left"> ';
			resultString +='						';
			resultString +='							<div class="graph_expanded">';
			resultString +='									<img class="displaycolor" width="'+currentLengths[0]+'px" height="'+barHeight+'px" src="images/colorStronglyDisagree.png"	title="Strongly Disagree: '+((array['DPTSEMESTERAVERAGESD']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			resultString +='									<img class="displaycolor" width="'+currentLengths[1]+'px" height="'+barHeight+'px" src="images/colorDisagree.png" title="Disagree: '+((array['DPTSEMESTERAVERAGED']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';			
			resultString +='									<img class="displaycolor" width="'+currentLengths[2]+'px" height="'+barHeight+'px" src="images/colorNeutral.png" title="Neutral: '+((array['DPTSEMESTERAVERAGEN']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			resultString +='									<img class="displaycolor" width="'+currentLengths[3]+'px" height="'+barHeight+'px" src="images/colorAgree.png" title="Agree: '+((array['DPTSEMESTERAVERAGEA']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			resultString +='									<img class="displaycolor" width="'+currentLengths[4]+'px" height="'+barHeight+'px" src="images/colorStronglyAgree.png" title="Strongly Agree: '+((array['DPTSEMESTERAVERAGESA']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			if (questionJSON[questionNumber][7])
			{
				resultString +='									<img class="displaycolor" width="'+currentLengths[5]+'px" height="'+barHeight+'px" src="images/colorNA.png" title="N\/A: '+((array['DPTSEMESTERAVERAGENA']/array['DPTSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			}
			resultString +='							</div>';
			resultString +='						</td>';
			resultString +='					</tr>';
			resultString +='					';
			resultString +='					<tr>';
			resultString +='						<td align="left" style="width:100px">Your Overall Semester Average</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALSEMESTERAVERAGESD']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALSEMESTERAVERAGED']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALSEMESTERAVERAGEN']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALSEMESTERAVERAGEA']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALSEMESTERAVERAGESA']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			if (questionJSON[questionNumber][7])
			{
				resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALSEMESTERAVERAGENA']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';//N/A DATA
			}
			
			currentLengths = new Array(((array['PERSONALSEMESTERAVERAGESD']/array['PERSONALSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['PERSONALSEMESTERAVERAGED']/array['PERSONALSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['PERSONALSEMESTERAVERAGEN']/array['PERSONALSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['PERSONALSEMESTERAVERAGEA']/array['PERSONALSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['PERSONALSEMESTERAVERAGESA']/array['PERSONALSEMESTERAVERAGETOTAL'])*totalBarLength),
										((array['PERSONALSEMESTERAVERAGENA']/array['PERSONALSEMESTERAVERAGETOTAL'])*totalBarLength));
			normPixelLength();
			resultString +='						<td align="left"> ';
			resultString +='						';
			resultString +='							<div class="graph_expanded">';
			resultString +='								<img class="displaycolor" width="'+currentLengths[0]+'px" height="'+barHeight+'px" src="images/colorStronglyDisagree.png" title="Strongly Disagree: '+((array['PERSONALSEMESTERAVERAGESD']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>	';	
			resultString +='									<img class="displaycolor" width="'+currentLengths[1]+'px" height="'+barHeight+'px" src="images/colorDisagree.png" title="Disagree: '+((array['PERSONALSEMESTERAVERAGED']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';		
			resultString +='									<img class="displaycolor" width="'+currentLengths[2]+'px" height="'+barHeight+'px" src="images/colorNeutral.png" title="Neutral: '+((array['PERSONALSEMESTERAVERAGEN']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			resultString +='									<img class="displaycolor" width="'+currentLengths[3]+'px" height="'+barHeight+'px" src="images/colorAgree.png" title="Agree: '+((array['PERSONALSEMESTERAVERAGEA']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			resultString +='									<img class="displaycolor" width="'+currentLengths[4]+'px" height="'+barHeight+'px" src="images/colorStronglyAgree.png" title="Strongly Agree: '+((array['PERSONALSEMESTERAVERAGESA']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			if (questionJSON[questionNumber][7])
			{
				resultString +='									<img class="displaycolor" width="'+currentLengths[5]+'px" height="'+barHeight+'px" src="images/colorNA.png" title="N/\A: '+((array['PERSONALSEMESTERAVERAGENA']/array['PERSONALSEMESTERAVERAGETOTAL'])*100).toFixed(2)+'%'+'"/>';
			}
			resultString +='							</div>';
			resultString +='						</td>';
			resultString +='					</tr>	';
			resultString +='					<tr>';
			resultString +='						<td align="left" style="width:100px">Dpt '+window.ClassName+' 5 Year Average</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTFIVEYEARCOURSEAVERAGESD']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTFIVEYEARCOURSEAVERAGED']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTFIVEYEARCOURSEAVERAGEN']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTFIVEYEARCOURSEAVERAGEA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTFIVEYEARCOURSEAVERAGESA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			if (questionJSON[questionNumber][7])
			{
				resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['DPTFIVEYEARCOURSEAVERAGENA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';//N/A DATA
			}
			resultString +='						<td align="left"> ';
			resultString +='						';
			resultString +='							<div class="graph_expanded">';
			
			currentLengths = new Array((((array['DPTFIVEYEARCOURSEAVERAGESD']/array['DPTFIVEYEARCOURSEAVERAGETOTAL']))*totalBarLength),
										(((array['DPTFIVEYEARCOURSEAVERAGED']/array['DPTFIVEYEARCOURSEAVERAGETOTAL']))*totalBarLength),
										(((array['DPTFIVEYEARCOURSEAVERAGEN']/array['DPTFIVEYEARCOURSEAVERAGETOTAL']))*totalBarLength),
										(((array['DPTFIVEYEARCOURSEAVERAGEA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL']))*totalBarLength),
										(((array['DPTFIVEYEARCOURSEAVERAGESA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL']))*totalBarLength),
										(((array['DPTFIVEYEARCOURSEAVERAGENA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL']))*totalBarLength));
			normPixelLength();
			//resultString +='									<div class="graph_box graphStronglyDisagree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGESD']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>	';
			//resultString +='									<div class="graph_box graphDisagree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGED']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
			//resultString +='									<div class="graph_box graphNeutral" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGEN']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
			//resultString +='									<div class="graph_box graphAgree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGEA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
			//resultString +='									<div class="graph_box graphStronglyAgree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGESA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>				';
			resultString +='								<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="'+currentLengths[0]+'px" height="'+barHeight+'px" title="Disagree: '+((array['DPTFIVEYEARCOURSEAVERAGESD']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor" src = "images/colorDisagree.png" width="'+currentLengths[1]+'px" height="'+barHeight+'px" title="Disagree: '+((array['DPTFIVEYEARCOURSEAVERAGED']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor"  src = "images/colorNeutral.png" width="'+currentLengths[2]+'px" height="'+barHeight+'px" title="Neutral: '+((array['DPTFIVEYEARCOURSEAVERAGED']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor" src = "images/colorAgree.png" width="'+currentLengths[3]+'px" height="'+barHeight+'px" title="Agree: '+((array['DPTFIVEYEARCOURSEAVERAGEA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor"  src = "images/colorStronglyAgree.png" width="'+currentLengths[4]+'px" height="'+barHeight+'px" title="Strongly Agree: '+((array['DPTFIVEYEARCOURSEAVERAGESA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			if (questionJSON[questionNumber][7])
			{
				resultString +='								<img class="displaycolor"  src = "images/colorNA.png" width="'+currentLengths[5]+'px" height="'+barHeight+'px" title="N\/A: '+((array['DPTFIVEYEARCOURSEAVERAGENA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			}
			resultString +='							</div>';
			resultString +='						';
			resultString +='						</td>';
			resultString +='					</tr>';
			resultString +='					<tr>';
			resultString +='						<td align="left" style="width:100px">Your '+window.ClassName+' 5 Year Average</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALFIVEYEARAVERAGESD']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALFIVEYEARAVERAGED']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALFIVEYEARAVERAGEN']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALFIVEYEARAVERAGEA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(0)+'%</td>';
			resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALFIVEYEARAVERAGESA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';
			if (questionJSON[questionNumber][7])
			{
				resultString +='						<td align="left" style="width:' + cellWidth + '">'+((array['PERSONALFIVEYEARAVERAGENA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(0)+'%</td>	';//N/A DATA
			}
			resultString +='						<td align="left"> ';
			resultString +='							<div class="graph_expanded">';
			//resultString +='									<div class="graph_box graphStronglyDisagree" style="width:'+((array['PERSONALFIVEYEARAVERAGESD']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>	';
			//resultString +='									<div class="graph_box graphDisagree" style="width:'+((array['PERSONALFIVEYEARAVERAGED']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
			//resultString +='									<div class="graph_box graphNeutral" style="width:'+((array['PERSONALFIVEYEARAVERAGEN']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
			//resultString +='									<div class="graph_box graphAgree" style="width:'+((array['PERSONALFIVEYEARAVERAGEA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
			//resultString +='									<div class="graph_box graphStronglyAgree" style="width:'+((array['PERSONALFIVEYEARAVERAGESA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>				';
			
			currentLengths = new Array((((array['PERSONALFIVEYEARAVERAGESD']/array['PERSONALFIVEYEARAVERAGETOTAL']))*totalBarLength),
										(((array['PERSONALFIVEYEARAVERAGED']/array['PERSONALFIVEYEARAVERAGETOTAL']))*totalBarLength),
										(((array['PERSONALFIVEYEARAVERAGEN']/array['PERSONALFIVEYEARAVERAGETOTAL']))*totalBarLength),
										(((array['PERSONALFIVEYEARAVERAGEA']/array['PERSONALFIVEYEARAVERAGETOTAL']))*totalBarLength),
										(((array['PERSONALFIVEYEARAVERAGESA']/array['PERSONALFIVEYEARAVERAGETOTAL']))*totalBarLength),
										(((array['PERSONALFIVEYEARAVERAGENA']/array['PERSONALFIVEYEARAVERAGETOTAL']))*totalBarLength));
			normPixelLength();
			resultString +='								<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="'+currentLengths[0]+'px" height="'+barHeight+'px" title="Disagree: '+((array['PERSONALFIVEYEARAVERAGESD']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor" src = "images/colorDisagree.png" width="'+currentLengths[1]+'px" height="'+barHeight+'px" title="Disagree: '+((array['PERSONALFIVEYEARAVERAGED']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor"  src = "images/colorNeutral.png" width="'+currentLengths[2]+'px" height="'+barHeight+'px" title="Neutral: '+((array['PERSONALFIVEYEARAVERAGEN']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor" src = "images/colorAgree.png" width="'+currentLengths[3]+'px" height="'+barHeight+'px" title="Agree: '+((array['PERSONALFIVEYEARAVERAGEA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			resultString +='								<img class="displaycolor"  src = "images/colorStronglyAgree.png" width="'+currentLengths[4]+'px" height="'+barHeight+'px" title="Strongly Agree: '+((array['PERSONALFIVEYEARAVERAGESA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			if (questionJSON[questionNumber][7])
			{
				resultString +='								<img class="displaycolor"  src = "images/colorNA.png" width="'+currentLengths[5]+'px" height="'+barHeight+'px" title="N\/A: '+((array['PERSONALFIVEYEARAVERAGENA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*100).toFixed(2)+'%'+'"> ';
			}
			resultString +='							</div>';
			resultString +='						</td>';
			resultString +='					</tr>	';
			resultString +='				</tbody></table>';
			resultString +='				</div>';

			//expanderDiv.hide();
			expanderDiv.append(resultString);
			
			
			$(".loadinggif").remove();
			expanderDiv.slideDown(UIspeed);
			//originalDiv.addClass("Already_Expanded");
			resultString = '';
			
		},
		error: function (xhr, ajaxOptions, thrownError, asdf) 
		{
			alert("failed to process Ajax");
		}
	});
}

/*function printQuery(name, start, data)
{
	var rs = "";
	var total = data.DATA[0][start+5];
	var sd = (data.DATA[0][start+4] / total) * 100;
	var d = (data.DATA[0][start+3] / total) * 100;
	var n = (data.DATA[0][start+2] / total) * 100;
	var a = (data.DATA[0][start+1] / total) * 100;
	var sa = (data.DATA[0][start] / total) * 100;
	var factor = 4;
	rs += "<tr class='result'>";
	rs += "<td>" + name + "</td>";
	rs += "<td> SD: " + Math.round(sd) + "% </td>";
	rs += "<td> D: " + Math.round(d) + "% </td>";
	rs += "<td> N: " + Math.round(n) + "% </td>";
	rs += "<td> A: " + Math.round(a) + "% </td>";
	rs += "<td> SA: " +Math.round(sa) + "% </td>";
	rs += '<td><div class="graph_box graphStronglyDisagree" style=" width:'+sd*factor+'px;"></div>';
	rs += '<div class="graph_box graphDisagree" style=" width:'+d*factor+'px;"></div>';
	rs += '<div class="graph_box graphNuteral" style=" width:'+n*factor+'px;"></div>';
	rs += '<div class="graph_box graphAgree" style=" width:'+a*factor+'px;"></div>';
	rs += '<div class="graph_box graphStronglyAgree" style=" width:'+sa*factor+'px;"></div>';
	rs += "</td></tr>";
	return rs;
}*/

$(function() 
{
	$(document).delegate(".button", "click", function(){ detailsQuery(CRN,Semester,Year,$(this).siblings(".hiddenQuestionID").val(), this);});
	$(document).delegate(".tpbutton", "click", function(){ detailsTop(CRN,Semester,Year,this);});
	
});

function getURLParameter(name) 
{
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

//Class_Breakdown_JRW_Preston.html?CRN=32981&Semester=3&Year=2013&TestID=64529
var resultString = "";
//var QuestionID = 3979590;
var CRN = 0;
var Semester = 0;
var Year = 0;
var TestID = 0;
var totalBarLength = 400;
var currentQuestion = " ";
var currentSD = 0;
var currentD = 0;
var currentN = 0;
var currentA = 0;
var currentSA = 0;
var currentNA = 0;
var currentTotal = 0;
var currentLengths = [];
var finishedQuestions = [];
var printedQuestions = [];
var crnStatistics = [];
var questionCollapserId = 0;
var totalQuestions = 0;
var questionJSON = {};
var barHeight = 30;
var totalRespondents = 0;
	
CRN = parseInt(getURLParameter('CRN'));
Semester = parseInt(getURLParameter('Semester'));
Year = parseInt(getURLParameter('Year'));
TestID = parseInt(getURLParameter('TestID'));

window.onload=(function() 
{
	$("#StatisticsWrapper").before('<p class="loadinggif">Calculating...</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');

	titleQuery(CRN, Semester, Year);
	mainQuery(CRN,Semester,Year);
	essayQuery(CRN, Semester, Year);		
	topQuery(CRN,Semester,Year);
		
});
