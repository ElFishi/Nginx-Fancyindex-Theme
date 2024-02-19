
// https://www.webagesolutions.com/blog/uploading-files-using-xmlhttprequest-level-2

var files;


function stopProp(ev) {
	// Stop default actions
    ev.stopPropagation();
    ev.preventDefault();
}


function init() {

    var dropZone = document.getElementById("fileDrop");
    //dropZone.addEventListener("dragenter",  stopProp, false);
    //dropZone.addEventListener("dragleave",  stopProp, false);
    dropZone.addEventListener("dragover",  stopProp, false);
    dropZone.addEventListener("drop",  setDropFiles, false);

	var inputField =  document.getElementById("fileInput");
	inputField.addEventListener("input", setInputFiles, false);

    var upload = document.getElementById("upload");
    upload.addEventListener("click", doUpload, false);
}


function setDropFiles(e) {
	//Save the dropped files

    e.stopPropagation();
    e.preventDefault();

    files = e.dataTransfer.files;
	listFiles();

    return false;
}


function setInputFiles() {

	const file_input = document.querySelector('#fileInput');

	files = file_input.files;
	listFiles();
 }


function listFiles() {

	console.log("selected files:");
	[...files].forEach( file => {console.log(file.name)});

	var html = '<table class="inputlist">';
	html += "<thead><tr><th>Files selected for upload</th><th></th><th></th></tr></thead>";
	html += "<tbody>";
	[...files].forEach( file => {
		html += "<tr><td>"+file.name+"</td><td>"+formatBytes(file.size)+"</td><td></td></tr>"
	});
	html += "</tbody></table>";
	document.getElementById("fileInputTable").innerHTML = html;
	document.getElementById("myPopup").classList.remove("show");
}


function doUpload(e) {

	if (files === undefined) {
		document.getElementById("myPopup").classList.toggle("show");
		return;
	}

    var counter = 0;
	[...files].forEach( (file,idx,files) => {

    	var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == XMLHttpRequest.DONE) {
                counter++;
				console.log(xhr.status, xhr.responseURL);
                if (counter === files.length ) {
                    console.log("Uploaded last of",files.length,"files");
                    // window.location.replace(window.location.pathname);
                    swapPage(window.location.pathname);
                    //setTimeout(swapPage, 500, window.location.pathname);
                }
			}
		}

		xhr.open("PUT", file.name);
		xhr.setRequestHeader("Cache-Control", "no-cache");
        // let fileDate = new Date(file.lastModified)
        // console.log(fileDate.toGMTString()); // prints legible date
		// xhr.setRequestHeader("Date", fileDate.toGMTString());
    	xhr.send(file);
	});

	// +++ Clean up +++
	if (! e === undefined) { stopProp(e); }
	files = undefined;
	document.querySelector('#fileInput').files.value = undefined;
	document.getElementById("fileInputTable").innerHTML = "<p>Drop files or click here to select files for upload</p>";
}


function formatBytes(bytes,decimals) {
   if(bytes == 0) return '0 B';
   var k = 1024,
       dm = decimals || 2,
       sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
       i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

window.onload = init;
