const path = require('path');
const SizePlugin = require("size-plugin");
const fs = require("fs");
module.exports = {
  mode:"production",  
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins:[
    new SizePlugin({
    
        decorateAfter:function({output}){
            fs.writeFileSync(`${process.cwd()}/size-plugin-diff.txt`,output)
        }
    })
  ]
};