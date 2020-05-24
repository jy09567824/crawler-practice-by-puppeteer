const csvjson = require('csvjson');
const readFile = require('fs').readFile;
const writeFile = require('fs').writeFile;

readFile('./shopee_result.json', 'utf-8', (err, fileContent) => {
    if (err) {
        console.log(err); // Do something to handle the error or just throw it
        throw new Error(err);
    }

    const csvData = csvjson.toCSV(fileContent, {
        headers: 'key'
    });
    writeFile('./shopee.csv', csvData, (err) => {
        if(err) {
            console.log(err); // Do something to handle the error or just throw it
            throw new Error(err);
        }
        console.log('Success!');
    });
});