<cftry>
<cfinclude template="setup.cfm">

<cfparam name="request.formurl.crn" default="0">
<cfparam name="request.formurl.semester" default="0">
<cfparam name="request.formurl.year" default="0">
<cfparam name="request.formurl.testID" default="0">

<cfif Val(request.formurl.crn) is 0 OR Val(request.formurl.semester) is 0 OR Val(request.formurl.year) is 0<!--- OR Val(request.formurl.testID) is 0--->>
	<cfoutput>{"error":"Required parameter not specified. Need crn, semester, year."}</cfoutput>
	<cfabort>
</cfif>

<!---<cfinvoke component="privilege" method="hasPrivilege" userID="#request.aSession.user.id#" bannerCRN="#request.formurl.crn#" semester="#request.formurl.semester#" year="#request.formurl.year#" testID="#request.formurl.testID#"  returnVariable="hasPrivilege">
<cfif not hasPrivilege>
	<cfoutput>{"error":"You do not have the necessary privileges to run this report."}</cfoutput>
	<cfabort>
</cfif>--->

<cfquery name="GetEssayAnswers" datasource="#request.db_dsn#">
	DECLARE @crn INT = <cfqueryparam cfsqltype="cf_sql_integer" value="#request.formurl.crn#">, @semester INT = <cfqueryparam cfsqltype="cf_sql_integer" value="#request.formurl.semester#">, @year INT = <cfqueryparam cfsqltype="cf_sql_integer" value="#request.formurl.year#"><!---, @TestID INT = <cfqueryparam cfsqltype="cf_sql_integer" value="#request.formurl.testID#">--->;
	
	--BEGIN STORED PROCEDURE
	
	DECLARE @testID int = 
	(
		SELECT DISTINCT TOP 1 T.ID
		FROM Tests T
			INNER JOIN SectionTests ST ON T.ID = ST.testID
			INNER JOIN Results R ON ST.deliveryID = R.deliveryID
			INNER JOIN CourseSections CS ON R.sectionID = CS.ID
				AND CS.bannerCRN = @CRN
				AND CS.year = @year
				AND CS.semester = @semester
				AND typeID = 5
	);
	
	SELECT
	cs.ID,
		CS.bannerCRN AS CRN,
		CS.subjectCode,
		CS.courseNumber,
		CS.semester,
		CS.block,
		Q.ID,
		Qr.ID,
		Q.text AS Question,
		coalesce(ER.essayResponse, 'No Response') AS Answer,
		DENSE_RANK() OVER(ORDER BY R.StudentID) Student
	FROM SectionsTaught ST
		INNER JOIN Results R ON R.sectionID = ST.sectionID
			--AND (R.deleted = 0 OR R.deleted IS NULL)
			--AND R.startTime BETWEEN DATEADD(year, -5, GETDATE()) AND GETDATE() --Last 5 years
			--AND ST.instructorID = 887969243
		INNER JOIN CourseSections CS ON CS.ID = R.sectionID
			AND CS.bannerCRN = @CRN
			AND CS.year = @year
			AND CS.semester = @semester
		INNER JOIN QuestionResponses QR ON QR.resultID = R.ID
		INNER JOIN Questions Q ON Q.ID = QR.questionID
		INNER JOIN QuestionTypes QT on Q.typeID = Qt.ID and name = 'Essay' 
		INNER JOIN Tests T ON T.ID = Q.testID 
			--AND T.typeID = 5 --Course Eval
			AND T.ID = @testID
		LEFT JOIN EssayResponses ER ON ER.questionResponseID = QR.ID
			--AND ER.essayResponse IS NOT NULL
		ORDER BY student, Q.ID
</cfquery>

<!--- Clean out control characters that will cause JSON to break --->
<cfinvoke component="cfcs.proofreadAndEdit" method="CleanString" stringToClean="#SerializeJSON(GetEssayAnswers)#" returnvariable="cleanedGetEssayAnswers">

<cfcontent type="application/json; charset=UTF-8">
<cfoutput>#cleanedGetEssayAnswers#</cfoutput>
<cfcatch>
	<cfoutput>{"error":"Error executing query: <cfif IsDefined("CFCATCH.queryError")>#CFCATCH.queryError#<cfelse>#CFCATCH.Message#: #CFCATCH.Detail#</cfif>"}</cfoutput>
</cfcatch>
</cftry>

