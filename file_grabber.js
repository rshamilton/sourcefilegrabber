javascript:
//Bookmarklet to grab multiple files from web page based off of name
//Ex: image_#.png grabs images image_0.png, image_1.png, etc.
(function() {
    var fileNames = prompt("Enter the file name pattern (Ex: image_#.png):");
    if (!fileNames) {
        alert("File names are required.");
        return;
    }

