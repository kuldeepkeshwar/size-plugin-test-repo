function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var path = _interopDefault(require('path'));
var promisify = _interopDefault(require('util.promisify'));
var globPromise = _interopDefault(require('glob'));
var minimatch = _interopDefault(require('minimatch'));
var gzipSize = _interopDefault(require('gzip-size'));
var chalk = _interopDefault(require('chalk'));
var prettyBytes = _interopDefault(require('pretty-bytes'));
var escapeRegExp = _interopDefault(require('escape-string-regexp'));
var fs = _interopDefault(require('fs'));

function toMap(names, values) {
    return names.reduce(function (map, name, i) {
        map[name] = values[i];
        return map;
    }, {});
}

function dedupe(item, index, arr) {
    return arr.indexOf(item) === index;
}

function toFileMap(files) {
    return files.reduce(function (result, file) {
        if (file.size) {
            result[file.filename] = file.size;
        }
        return result;
    }, {});
}

var glob = promisify(globPromise);
var writeFile = promisify(fs.writeFile);
var readFile = promisify(fs.readFile);
var NAME = 'SizePlugin';
var BOT = process.env.SIZE_PLUGIN_BOT;
var DIFF_FILE = 'size-plugin-diff.json';
var SizePlugin = function SizePlugin(options) {
    this.options = options || {};
    this.pattern = this.options.pattern || '**/*.{mjs,js,css,html}';
    this.exclude = this.options.exclude;
    this.options.filename = this.options.filename || 'size-plugin.json';
    this.filename = path.join(process.cwd(), this.options.filename);
};
SizePlugin.prototype.reverseTemplate = function reverseTemplate (filename, template) {
    if (typeof template === 'function') {
        template = template({
            chunk: {
                name: 'main'
            }
        });
    }
    var hashLength = this.output.hashDigestLength;
    var replace = [];
    var count = 0;
    function replacer() {
            var arguments$1 = arguments;

        var out = '';
        for (var i = 1;i < arguments.length - 2; i++) {
            var value = arguments$1[i];
            if (replace[i - 1]) 
                { value = value.replace(/./g, '*'); }
            out += value;
        }
        return out;
    }
        
    var reg = template.replace(/(^|.+?)(?:\[([a-z]+)(?::(\d))?\]|$)/g, function (s, before, type, size) {
        var out = '';
        if (before) {
            out += "(" + (escapeRegExp(before)) + ")";
            replace[count++] = false;
        }
        if (type === 'hash' || type === 'contenthash' || type === 'chunkhash') {
            var len = Math.round(size) || hashLength;
            out += "([0-9a-zA-Z]{" + len + "})";
            replace[count++] = true;
        } else if (type) {
            out += '(.*?)';
            replace[count++] = false;
        }
        return out;
    });
    var matcher = new RegExp(("^" + reg + "$"));
    return matcher.test(filename) && filename.replace(matcher, replacer);
};
SizePlugin.prototype.stripHash = function stripHash (filename) {
    return this.options.stripHash && this.options.stripHash(filename) || this.reverseTemplate(filename, this.output.filename) || this.reverseTemplate(filename, this.output.chunkFilename) || filename;
};
SizePlugin.prototype.readFromDisk = function readFromDisk (filepath) {
    return new Promise(function ($return, $error) {
        var $Try_1_Catch = function (err) {
            try {
                return $return([]);
            } catch ($boundEx) {
                return $error($boundEx);
            }
        };
        try {
            var oldStatsStr, oldStats;
            return readFile(filepath).then(function ($await_8) {
                try {
                    oldStatsStr = $await_8.toString();
                    oldStats = JSON.parse(oldStatsStr);
                    return $return(oldStats.sort(function (a, b) { return b.timestamp - a.timestamp; }));
                } catch ($boundEx) {
                    return $Try_1_Catch($boundEx);
                }
            }, $Try_1_Catch);
        } catch (err) {
            $Try_1_Catch(err);
        }
    });
};
SizePlugin.prototype.writeToDisk = function writeToDisk (filename, stats) {
    return new Promise((function ($return, $error) {
        if (this.mode === 'production' && !this.options.load && stats.files.some(function (file) { return file.diff > 0; })) {
            var data;
            return this.readFromDisk(filename).then((function ($await_9) {
                try {
                    data = $await_9;
                    data.unshift(stats);
                    return writeFile(filename, JSON.stringify(data, undefined, 2)).then((function ($await_10) {
                        try {
                            return $If_4.call(this);
                        } catch ($boundEx) {
                            return $error($boundEx);
                        }
                    }).bind(this), $error);
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            }).bind(this), $error);
        }
        function $If_4() {
            return $return();
        }
            
        return $If_4.call(this);
    }).bind(this));
};
SizePlugin.prototype.save = function save (files) {
    return new Promise((function ($return, $error) {
        var stats;
        stats = {
            timestamp: Date.now(),
            files: files.map(function (file) { return ({
                filename: file.name,
                previous: file.sizeBefore,
                size: file.size,
                diff: file.size - file.sizeBefore
            }); })
        };
        return new Promise(function ($return, $error) {
            var $logicalAnd_2;
            if ($logicalAnd_2 = BOT) {
                return writeFile(DIFF_FILE, JSON.stringify(stats, undefined, 2)).then((function ($await_11) {
                    try {
                        $logicalAnd_2 = $await_11;
                        return $If_5.call(this);
                    } catch ($boundEx) {
                        return $error($boundEx);
                    }
                }).bind(this), $error);
            }
            function $If_5() {
                return $return($logicalAnd_2);
            }
                
            return $If_5.call(this);
        }).then((function ($await_12) {
            try {
                return new Promise((function ($return, $error) {
                    var $logicalAnd_3;
                    if ($logicalAnd_3 = this.options.save) {
                        return this.options.save(stats).then((function ($await_13) {
                            try {
                                $logicalAnd_3 = $await_13;
                                return $If_6.call(this);
                            } catch ($boundEx) {
                                return $error($boundEx);
                            }
                        }).bind(this), $error);
                    }
                    function $If_6() {
                        return $return($logicalAnd_3);
                    }
                        
                    return $If_6.call(this);
                }).bind(this)).then((function ($await_14) {
                    try {
                        return this.writeToDisk(this.filename, stats).then(function ($await_15) {
                            try {
                                return $return();
                            } catch ($boundEx) {
                                return $error($boundEx);
                            }
                        }, $error);
                    } catch ($boundEx) {
                        return $error($boundEx);
                    }
                }).bind(this), $error);
            } catch ($boundEx) {
                return $error($boundEx);
            }
        }).bind(this), $error);
    }).bind(this));
};
SizePlugin.prototype.load = function load (outputPath) {
    return new Promise((function ($return, $error) {
        var data;
        if (this.options.load) {
            var files;
            return this.options.load().then(function ($await_16) {
                    var assign;

                try {
                    ((assign = $await_16, files = assign.files));
                    return $return(toFileMap(files));
                } catch ($boundEx) {
                    return $error($boundEx);
                }
            }, $error);
        }
        return this.readFromDisk(this.filename).then((function ($await_17) {
                var assign;

            try {
                data = $await_17;
                if (data.length) {
                    var files;
                    (assign = data, files = assign[0].files);
                    return $return(toFileMap(files));
                }
                return $return(this.getSizes(outputPath));
            } catch ($boundEx) {
                return $error($boundEx);
            }
        }).bind(this), $error);
    }).bind(this));
};
SizePlugin.prototype.apply = function apply (compiler) {
    return new Promise((function ($return, $error) {
            var this$1 = this;

        var outputPath = compiler.options.output.path;
        this.output = compiler.options.output;
        this.sizes = this.load(outputPath);
        this.mode = compiler.options.mode;
        var afterEmit = function (compilation, callback) {
            this$1.outputSizes(compilation.assets).then(function (output) {
                if (output) {
                    process.nextTick(function () {
                        console.log('\n' + output);
                    });
                }
            }).catch(console.error).then(callback);
        };
        if (compiler.hooks && compiler.hooks.emit) {
            compiler.hooks.emit.tapAsync(NAME, afterEmit);
        } else {
            compiler.plugin('after-emit', afterEmit);
        }
        return $return();
    }).bind(this));
};
SizePlugin.prototype.outputSizes = function outputSizes (assets) {
    return new Promise((function ($return, $error) {
        var sizesBefore, isMatched, isExcluded, assetNames, sizes, files, width, output, items;
        return Promise.resolve(this.sizes).then((function ($await_18) {
            try {
                sizesBefore = $await_18;
                isMatched = minimatch.filter(this.pattern);
                isExcluded = this.exclude ? minimatch.filter(this.exclude) : function () { return false; };
                assetNames = Object.keys(assets).filter(function (file) { return isMatched(file) && !isExcluded(file); });
                return Promise.all(assetNames.map(function (name) { return gzipSize(assets[name].source()); })).then((function ($await_19) {
                        var this$1 = this;

                    try {
                        sizes = $await_19;
                        this.sizes = toMap(assetNames.map(function (filename) { return this$1.stripHash(filename); }), sizes);
                        files = Object.keys(sizesBefore).concat( Object.keys(this.sizes)).filter(dedupe);
                        width = Math.max.apply(Math, files.map(function (file) { return file.length; }));
                        output = '';
                        items = [];
                        for (var i = 0, list = files; i < list.length; i += 1) {
                            var name = list[i];

                                var size = (void 0);
                            size = this$1.sizes[name] || 0;
                            var sizeBefore = (void 0);
                            sizeBefore = sizesBefore[name] || 0;
                            var delta = (void 0);
                            delta = size - sizeBefore;
                            var msg = (void 0);
                            msg = new Array(width - name.length + 2).join(' ') + name + ' ⏤  ';
                            var color = (void 0);
                            color = size > 100 * 1024 ? 'red' : size > 40 * 1024 ? 'yellow' : size > 20 * 1024 ? 'cyan' : 'green';
                            var sizeText = chalk[color](prettyBytes(size));
                            var deltaText = '';
                            if (delta && Math.abs(delta) > 1) {
                                deltaText = (delta > 0 ? '+' : '') + prettyBytes(delta);
                                if (delta > 1024) {
                                    sizeText = chalk.bold(sizeText);
                                    deltaText = chalk.red(deltaText);
                                } else if (delta < -10) {
                                    deltaText = chalk.green(deltaText);
                                }
                                sizeText += " (" + deltaText + ")";
                            }
                            var text = msg + sizeText + '\n';
                            var item = (void 0);
                            item = {
                                name: name,
                                sizeBefore: sizeBefore,
                                size: size,
                                sizeText: sizeText,
                                delta: delta,
                                deltaText: deltaText,
                                msg: msg,
                                color: color
                            };
                            items.push(item);
                            if (this$1.options.decorateItem) {
                                text = this$1.options.decorateItem(text, item) || text;
                            }
                            output += text;
                        }
                        if (this.options.decorateAfter) {
                            var opts;
                            opts = {
                                sizes: items,
                                raw: {
                                    sizesBefore: sizesBefore,
                                    sizes: this.sizes
                                },
                                output: output
                            };
                            var text$1;
                            text$1 = this.options.decorateAfter(opts);
                            if (text$1) {
                                output += '\n' + text$1.replace(/^\n/g, '');
                            }
                        }
                        return this.save(items).then(function ($await_20) {
                            try {
                                return $return(output);
                            } catch ($boundEx) {
                                return $error($boundEx);
                            }
                        }, $error);
                    } catch ($boundEx) {
                        return $error($boundEx);
                    }
                }).bind(this), $error);
            } catch ($boundEx) {
                return $error($boundEx);
            }
        }).bind(this), $error);
    }).bind(this));
};
SizePlugin.prototype.getSizes = function getSizes (cwd) {
    return new Promise((function ($return, $error) {
        var files, sizes;
        return glob(this.pattern, {
            cwd: cwd,
            ignore: this.exclude
        }).then((function ($await_21) {
            try {
                files = $await_21;
                return Promise.all(files.map(function (file) { return gzipSize.file(path.join(cwd, file)).catch(function () { return null; }); })).then((function ($await_22) {
                        var this$1 = this;

                    try {
                        sizes = $await_22;
                        return $return(toMap(files.map(function (filename) { return this$1.stripHash(filename); }), sizes));
                    } catch ($boundEx) {
                        return $error($boundEx);
                    }
                }).bind(this), $error);
            } catch ($boundEx) {
                return $error($boundEx);
            }
        }).bind(this), $error);
    }).bind(this));
};

module.exports = SizePlugin;
//# sourceMappingURL=size-plugin.js.map
