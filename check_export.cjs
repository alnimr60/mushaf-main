const pdf = require('pdf-parse');
console.log(typeof pdf);
// Some versions might have it on default
console.log(pdf.default ? typeof pdf.default : 'no default');
