const path = require('path');
const SizePlugin = require("./vendor/size-plugin");
const fs = require("fs");
module.exports = {
  mode:"production",  
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins:[
    new SizePlugin({writeToDisk:true})
  ]
};