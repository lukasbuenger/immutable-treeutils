var parse = require("acorn").parse;
var glob = require("glob");
var fs = require("fs");
var Mustache = require("mustache");

var pkg = require("../package");

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
if (typeof Object.assign != "function") {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      // .length of function is 2
      "use strict";
      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError("Cannot convert undefined or null to object");
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

var tagExp = /@[a-z]+ (_|-|[a-zA-Z0-9]|\.)+/g;
var asteriskAndNewLineExp = /(^\*)?\n( )?(\t+)? \*( )?/g;

var links = [
  {
    name: "TreeUtils",
    lookup: "ImmutableJS",
    url: "http://github.com/lukasbuenger/immutable-treeutils/"
  },
  {
    name: "ImmutableJS",
    lookup: "ImmutableJS",
    url: "http://facebook.github.io/immutable-js/"
  },
  {
    name: "Seq",
    lookup: "Immutable.Seq",
    url: "http://facebook.github.io/immutable-js/docs/#/Seq"
  },
  {
    name: "Record",
    lookup: "Immutable.Record",
    url: "http://facebook.github.io/immutable-js/docs/#/Record"
  },
  {
    name: "List",
    lookup: "Immutable.List",
    url: "http://facebook.github.io/immutable-js/docs/#/List"
  }
];

glob("index.js", {}, function(er, fileNames) {
  if (er) {
    console.error(er);
  } else {
    var refs = [];
    var parsed = fileNames.map(function(fileName) {
      var data = fs.readFileSync(fileName, "utf8");
      var comments = "";
      try {
        parse(data, {
          ecmaVersion: 6,
          sourceType: "module",
          onComment: function(block, commentText) {
            var text = commentText;
            if (block) {
              var attributes;
              var attributeMatch = tagExp.exec(text);
              while (attributeMatch) {
                if (!attributes) {
                  attributes = {};
                }
                var parts = attributeMatch[0].split(" ");
                attributes[parts[0].substr(1)] = parts[1];
                attributeMatch = tagExp.exec(text);
              }
              if (attributes) {
                refs.push(attributes);
                text = text.replace(tagExp, "");
              }
              text = text.replace(asteriskAndNewLineExp, "\n");
              comments = comments.concat(
                "- - - \n",
                attributes && attributes.id
                  ? '<a id="'.concat(attributes.id, '"></a>')
                  : "",
                text,
                "\n\n"
              );
              text = text.replace(tagExp, "");
            }
          }
        });
      } catch (e) {
        throw e.stack;
      }
      return {
        comments: comments,
        fileName: fileName
      };
    });

    var linkPatterns = links.reduce(function(memo, link) {
      var newObj = {};
      newObj[link.lookup] = "[".concat(link.name, "](", link.url, ")");
      return Object.assign({}, memo, newObj);
    }, {});
    var refPatterns = refs.reduce(function(memo, ref) {
      if (ref.id && ref.lookup) {
        var newObj = {};
        newObj[ref.lookup] = "[".concat(
          ref.name || ref.lookup,
          "](#",
          ref.id,
          ")"
        );
        return Object.assign({}, memo, newObj);
      }
      return memo;
    }, {});

    var concatenatedComments = parsed.reduce(function(memo, item) {
      var comments = item.comments;

      if (comments.length > 0) {
        return memo.concat(
          "- - -\n",
          "<sub>[See Source](https://github.com/lukasbuenger/immutable-treeutils/tree/v",
          pkg.version,
          "/",
          item.fileName,
          ")</sub>\n",
          comments
        );
      }
      return memo;
    }, "");

    var template = fs.readFileSync("scripts/README.mustache", "utf8");
    var rendered = Mustache.render(template, {
      pkg: pkg,
      docs: concatenatedComments
    });

    Object.keys(linkPatterns).forEach(function(key) {
      rendered = rendered.replace(
        new RegExp(">\\b".concat(key, "\\b"), "g"),
        linkPatterns[key]
      );
    });

    Object.keys(refPatterns).forEach(function(key) {
      rendered = rendered.replace(
        new RegExp(">\\b".concat(key, "\\b"), "g"),
        refPatterns[key]
      );
    });

    fs.writeFileSync("README.md", rendered);
  }
});
