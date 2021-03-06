const path = require('path');
const SizePlugin = require("size-plugin");
const fs = require("fs");
module.exports = {
  mode:process.env.NODE_ENV||"development",  
  entry: './src/index.js',
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins:[
    new SizePlugin({
      publish:true
    })
    // new SizePlugin({filename:'size-plugin-browser.json'}),
    // new SizePlugin({filename:'size-plugin-server.json'})
  ]
};

