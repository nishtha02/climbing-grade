var child_process = require('child_process');
var exec = child_process.exec;
var fs = require("fs");

var tokenPresent=0;

//We used AWS and DO token formats for this one.

//check for digital ocean token format
function checkDotoken(content) 
{
    return content.match(/\"[a-zA-Z0-9]{63,65}\"/);
}

//check for AWS token format
function checkAwsToken(content) 
{
    return content.match(/\"AKI[a-zA-Z0-9]{17,18}\"/);
}

//run process to check for token
exec('git diff-index --name-status HEAD -- | cut -c3-', function(err, stdout, stderr) {
    if (err) {
        console.log('Child process exited with error code', err.code);
        return
    }

    //get all fileNames from process and split
    var fileNames = stdout.substring(0, stdout.length - 1).split("\n");
    
    //check for keys in all files
    for (var i = 0; i < fileNames.length; i++) 
    {
        var fileName = fileNames[i];
        var fileExt = fileName.split('.').pop();

        //read all files for matching content of AWS and DO token
        fs.readFile(fileName, 'utf8', function(err, data) 
        {
            // check for token presence
            var doToken = checkDotoken(String(data));
            var awsToken = checkAwsToken(String(data));

            //if any token present, display message to user
            if (awsToken != null || doToken != null) {
                console.log("You have a security key in your code. Please remove the same.");
                tokenPresent=1;
                process.exit(1);
            }
        });

    }

});


