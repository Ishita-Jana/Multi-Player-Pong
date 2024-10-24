//Desc: This file is used to create a simple express server to serve the static files from public folder.
const express = require('express');
const path = require('path');
const api = express();


api.use(express.static(path.join(__dirname, 'public')));
api.use('/', express.static('index.html'));

// api.listen(3000,()=>{
//     console.log('Express Server listening at port 3000');
// })

// api.listen(3000);
// console.log('Express Server listening at port 3000');
module.exports = api;