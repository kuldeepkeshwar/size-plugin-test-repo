const path = require('path');
const SizePlugin = require("./vendor/size-plugin");
const fs = require("fs");
module.exports = {
  mode:process.env.NODE_ENV||"development",  
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins:[
    new SizePlugin()
  ]
};