/* common.js */

function trim(str){
	if (str == null) {
		return;
	}

	while ('' + str.value.charAt(0) == ' ') {
		str.value = str.value.substring(1, str.value.length);
	}

	while ('' + str.value.charAt(str.value.length-1) == ' ') {
		str.value = str.value.substring(0, str.value.length-1);
	}
}

function removeSpaces(str) {
	var tstr = "";
	str = '' + str;
	splitstr = str.split(" ");
	for (i = 0; i < splitstr.length; i++) {
		tstr += splitstr[i];
	}

	return tstr;
}

function on_focus() {
	if (launched_window) {
		launched_window.close();
		launched_window = null;
	}
}

function close_window() {
	window.close();
	return false;
}

function new_window(url, name, window_width, window_height, fullscreen) {
	if (window_width == null) {
		window_width = screen.availWidth-10; 
	}
	if (window_height == null) {
		window_height = screen.availHeight-50;
	}
	if (name == null) {
		name = "_win";
	}
	if (fullscreen == null) {
		fullscreen = 0;
	}
	window_properties = "fullscreen=" + fullscreen + ",toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=yes,top=0,left=0,width=" + window_width + ",height=" + window_height;
	launched_window = window.open(url, name, window_properties);
}


function isMaxLength(obj) {
	var mlength = obj.getAttribute ? parseInt(obj.getAttribute("maxlength")) : "";
	if (obj.getAttribute && obj.value.length>mlength) {
		obj.value=obj.value.substring(0, mlength);
	}
}

function select_all(fld, btn) {
	if (btn.value == "+") {
		action = true;
	} else {
		action = false;
	}
	len = fld.length;
	for (i = 0; i < len; i++) {
		fld[i].checked = action;
	}
}

function jump(u) {
	location.href = u;
}

function returnForm(frm, a) {
	if (a != null) {
		frm.target = "_self";
		frm.action = a;
	}
	frm.submit();
	return true;
}
