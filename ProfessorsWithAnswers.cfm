<cftry>
<cfinclude template="setup.cfm">

<cfparam name="request.formurl.dept" default="0">

<cfif Len(request.formurl.dept) is 0>
	<cfoutput>{"error":"Required parameter not specified. Need dept."}</cfoutput>
	<cfabort>
</cfif>


<cfquery name="GetProfessorsWithAnswers" datasource="#request.db_dsn#">
	DECLARE @dept NVARCHAR(4) = <cfqueryparam cfsqltype="cf_sql_varchar" value="#request.formurl.dept#" maxlength="4">;
	
	--BEGIN STORED PROCEDURE
	
	SELECT DISTINCT
		ST.instructorID,
		U.FirstName,
		U.LastName
	FROM CourseSections CS
		INNER JOIN SectionsTaught ST ON CS.ID = ST.sectionID
		INNER JOIN Users U ON U.Id = ST.instructorID
			AND CS.subjectCode = @Dept
		ORDER BY U.LastName, U.FirstName
		
</cfquery>

<!--- Clean out control characters that will cause JSON to break --->
<cfinvoke component="cfcs.proofreadAndEdit" method="CleanString" stringToClean="#SerializeJSON(GetProfessorsWithAnswers)#" returnvariable="cleanedGetProfessorsWithAnswers">

<cfcontent type="application/json; charset=UTF-8">
<cfoutput>#cleanedGetProfessorsWithAnswers#</cfoutput>
<cfcatch>
	<cfoutput>{"error":"Error executing query: <cfif IsDefined("CFCATCH.queryError")>#CFCATCH.queryError#<cfelse>#CFCATCH.Message#: #CFCATCH.Detail#</cfif>"}</cfoutput>
</cfcatch>
</cftry>

