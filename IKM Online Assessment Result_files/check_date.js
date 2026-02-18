function checkdate(object_value, dateFormat) {
	// Returns true if value is a date format or is NULL otherwise returns false

	if (object_value.length == 0) {
		return false;
	}

	// Returns true if value is a date in the specified format
	isplit = object_value.indexOf('/');
	if (isplit == -1 || isplit == object_value.length) {
		return false;
	}

	if (dateFormat == null || dateFormat.toUpperCase().startsWith("MM")) {
		sMonth = object_value.substring(0, isplit);
		if (sMonth.length == 0) {
			return false;
		}

		isplit = object_value.indexOf('/', isplit + 1);
		if (isplit == -1 || isplit == object_value.length) {
			return false;
		}

		sDay = object_value.substring((sMonth.length + 1), isplit);

		sYear = object_value.substring(isplit + 1);
	} else {
		sDay = object_value.substring(0, isplit);
		if (sDay.length == 0) {
			return false;
		}

		isplit = object_value.indexOf('/', isplit + 1);
		if (isplit == -1 || isplit == object_value.length) {
			return false;
		}

		sMonth = object_value.substring((sDay.length + 1), isplit);

		sYear = object_value.substring(isplit + 1);
	}

	if (!(sYear.length == 4)) { // check yyyy
		return false;
	} else if (!isInteger(sMonth)) { // check month
		return false;
	} else if (!isIntegerInRange(sMonth, 1, 12)) { // check month
		return false;
	} else if (!isInteger(sYear)) { // check year
		return false;
	} else if (!isIntegerInRange(sYear, 1900, null)) { // check year
		return false;
	} else if (!isInteger(sDay)) { // check day
		return false;
	} else if (!isIntegerInRange(sDay, 1, 31)) { // check day
		return false;
	} else if (!isDate(sYear, sMonth, sDay)) { // check day
		return false;
	} else {
		return true;
	}
}

function isDate(year, month, day) {
	var theDate = new Date(parseInt(year,10), parseInt(month,10)-1, parseInt(day,10) ) ;
	if (Object.prototype.toString.call(theDate) != "[object Date]") {
		return false;
	}

	// it is a date
	if (isNaN(theDate.getTime())) {  // theDate.valueOf() could also work
		// date is not valid
		return false;
	}

	// date is valid
	return true;
}

function comparedate(date1, date2) {
	var date3= date1.substring(6,10)+date1.substring(0,2)+date1.substring(3,5);
	var date4= date2.substring(6,10)+date2.substring(0,2)+date2.substring(3,5);
	if (date3 > date4) {
		alert("Invalid date(s)");
		return false;
	} else {
		return true;
	}
}
