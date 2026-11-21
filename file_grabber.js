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
    performance.getEntriesByType('resource').forEach(function(entry) {
        urls.add(entry.name);
    });
    console.log(urls.size, Array.from(urls));

    var matches = [];
    urls.forEach(function(url) {
        try {
            var decodedLink = decodeURIComponent(new URL(url).pathname.split('/').pop());
            var m = decodedLink.match(pattern);
            if (m) {
                if (!matches.some(function(match) { return match.name === decodedLink; })) {
                    matches.push({url: url, name: decodedLink, index: parseInt(m[1], 10)});
                }
            }
        } catch (e) {} //For bad urls
    });

    matches.sort(function(a, b) { return a.index - b.index; });
    console.log(matches);
    if (matches.length === 0) {
        alert("No matches found. The pattern used was: " + pattern);
        return;
    }
    //Creates an invisible link and clicks then it to download the file then it removes it
    function saveLink(href, name) {
        var a = document.createElement('a');
        a.href = href;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    //File downloader with delay to hopefully not let files get lost
    matches.forEach(function(file, i) {
        setTimeout(function() {
            fetch(file.url)
                .then(function(r) { return r.blob(); })
                .then(function(blob) {
                    var localf = URL.createObjectURL(blob);
                    saveLink(localf, file.name);
                    setTimeout(function() { URL.revokeObjectURL(localf); }, 1000);
                })
                .catch(function(err) {
                    console.warn("Fetch failed, using fallback:", file.url, err);
                    saveLink(file.url, file.name);
                });
        }, i * 300);
    });
})();