# Source File Grabber
A bookmarklet to grab files following a pattern.

## Usage

### Setup
1. Copy all of bookmarklet.js
2. Bookmark this page
3. Right click to edit the bookmark
4. Paste the code in from bookmarklet.js in place of the URL
5. Name the bookmarklet something

### Running it
1. Inspect the source tab in dev tools to find the pattern you want to download
    - Ex:image_#.png grabs images image_0.png, image_1.png, etc. and remember it
2. Click the new bookmark
3. Enter your pattern
4. Choose to export as a PDF or try to download normally
    - PDF downloads put the files into an iframe off screen, then print them
    - Normal downloads download the actual files, but won't work if the server prevent JavaScript from reading the actual bytes
