javascript:
//Bookmarklet to grab multiple files from web page based off of name
//Ex: image_#.png grabs images image_0.png, image_1.png, etc.
(function() {
    var fileNames = prompt("Enter the file name pattern (Ex: image_#.png):");
    if (!fileNames) {
        alert("File names are required.");
        return;
    }

    var escaped = fileNames.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var regexBody = escaped.replace(/#/g, '(\\d+)');
    var pattern = new RegExp('^' + regexBody + '$', 'i');
    console.log("Pattern: " + pattern);

    var sources = document.querySelectorAll('img[src], a[href], source[src], video[src], audio[src]');
    console.log(sources.length + " sources found.");

    var urls = new Set();
    sources.forEach(function(el) {
        //el.src to get full path
        var url = el.src || el.href;
        if (url) {
            urls.add(url);
        }
    });
    console.log(urls.size, Array.from(urls));


    var matches = [];
    urls.forEach(function(url) {
        try {
            var decodedLink = decodeURIComponent(new URL(url).pathname.split('/').pop());
            var m = decodedLink.match(pattern);
            if (m) {
                matches.push({url: url, name: decodedLink, index: parseInt(m[1], 10)});
            }
        } catch (e) {} //For bad urls
    });

    matches.sort(function(a, b) { return a.index - b.index; });
    console.log(matches);
})();