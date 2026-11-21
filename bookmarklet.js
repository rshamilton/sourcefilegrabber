javascript:
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
        } catch (e) {}
    });

    matches.sort(function(a, b) { return a.index - b.index; });
    console.log(matches);
    if (matches.length === 0) {
        alert("No matches found. The pattern used was: " + pattern);
        return;
    }

    var printMode = confirm("Found " + matches.length + " matches.\nOK for download into PDF (more reliable for server blocks)\nCancel to download files");
    if (printMode) {
        filePrinter(matches);
        return;
    }

    function saveLink(href, name, newTab) {
        var a = document.createElement('a');
        a.href = href;
        a.download = name;
        if (newTab) {
            a.target = '_blank';
        }
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    function filePrinter(matches) {
        var frame = document.createElement("iframe");
        frame.style.position = "fixed";
        frame.style.right = "-10000px";
        frame.style.top = "0";
        frame.style.width = "8.5in";
        frame.style.height = "11in";
        frame.style.border = "0";
        document.body.appendChild(frame);

        var d = frame.contentDocument;
        d.open();
        d.write('<!doctype html><html><head><style>' +
            '@page { size: letter; margin: 0.25in; }' +
            'html, body { margin: 0; padding: 0; }' +
            'img { display: block; width: 100%; height: 9.25in; object-fit: contain; page-break-after: always; break-after: page; }' +
            'img:last-child { page-break-after: auto; break-after: auto; }' +
            '</style></head><body></body></html>'
        );
        d.close();

        frame.contentWindow.onafterprint = function() {
            frame.remove();
        };

        var done = 0;
        function one() {
            done++;
            if (done === matches.length) {
                frame.contentWindow.print();
            }
        }

        matches.forEach(function(file) {
            var img = d.createElement("img");
            img.onload = one;
            img.onerror = function() {
                console.warn(file.url, "failed.");
                one();
            };
            img.src = file.url;
            d.body.appendChild(img);
        });
    }
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
                    saveLink(file.url, file.name, true);
                });
        }, i * 300);
    });
})();
