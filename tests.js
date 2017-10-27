var Immutable = require("immutable");
var Seq = Immutable.Seq;
var fromJS = Immutable.fromJS;
var toJS = Immutable.toJS;
var is = Immutable.is;
var TreeUtils = require("./index");

describe("class `TreeUtils`", function() {
  var fixtures = {
    data: {
      name: "Article",
      type: "article",
      id: "1",
      childNodes: [
        {
          type: "paragraph",
          name: "Paragraph",
          id: "2"
        },
        {
          type: "list",
          name: "List",
          id: "3",
          childNodes: [
            {
              type: "listItem",
              name: "List item 1",
              id: "4",
              childNodes: [
                {
                  type: "paragraph",
                  name: "Nested paragraph",
                  id: "5"
                }
              ]
            },
            {
              type: "listItem",
              name: "List item 2",
              id: "6",
              childNodes: [
                {
                  type: "paragraph",
                  name: "Nested paragraph 2",
                  id: "7"
                }
              ]
            }
          ]
        }
      ]
    }
  };
  var state = fromJS(fixtures);
  var utils = new TreeUtils(Seq.of("data"));

  var getValue = function(keyPath) {
    return utils.id(state, keyPath);
  };

  describe("constructor", function() {
    it("accepts a custom `none` argument", function() {
      var customUtils = new TreeUtils(
        Seq.of("data"),
        "id",
        "childNodes",
        false
      );

      var noneValue = customUtils.find(state, function(node) {
        return node.get("name") === "Not existing";
      });
      expect(noneValue).toBe(false);
    });
  });

  describe("method `id`", function() {
    it("returns the id value of an absolute key path", function() {
      expect(getValue(Seq(["data", "childNodes", 0]))).toEqual("2");
      expect(getValue(Seq(["data", "childNodes", 1]))).toEqual("3");
    });

    it("returns undefined if the key path has no id key.", function() {
      expect(getValue(Seq(["data", "childNodes", 4]))).toBeUndefined();
    });
  });

  describe("method `find`", function() {
    var findKeyPathById = function(id, seq) {
      return utils.find(
        state,
        function(item) {
          return item.get("id") === id;
        },
        seq
      );
    };

    it("returns the first key path whose item passed the comparator function.", function() {
      var keyPath = findKeyPathById("2");
      expect(keyPath.toJS()).toEqual(["data", "childNodes", 0]);
      expect(getValue(keyPath.toJS())).toEqual("2");

      var keyPath2 = findKeyPathById("3");
      expect(keyPath2.toJS()).toEqual(["data", "childNodes", 1]);
      expect(getValue(keyPath2.toJS())).toEqual("3");

      var keyPath3 = findKeyPathById(
        "4",
        Seq.of("data", "childNodes", 1, "childNodes", 0)
      );
      expect(keyPath3.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath3.toJS())).toEqual("4");

      var keyPath4 = findKeyPathById(
        "5",
        Seq.of("data", "childNodes", 1, "childNodes", 0, "childNodes", 0)
      );
      expect(keyPath4.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath4.toJS())).toEqual("5");

      var keyPath5 = findKeyPathById(
        "6",
        Seq.of("data", "childNodes", 1, "childNodes", 1)
      );
      expect(keyPath5.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1
      ]);
      expect(getValue(keyPath5.toJS())).toEqual("6");

      var keyPath6 = findKeyPathById(
        "7",
        Seq.of("data", "childNodes", 1, "childNodes", 1, "childNodes", 0)
      );
      expect(keyPath6.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath6.toJS())).toEqual("7");
    });

    it("passes the current node's key path as second argument to the comparator", function() {
      var findSameKeyPath = function(seq) {
        return utils.find(state, function(node, keyPath) {
          return is(seq, keyPath);
        });
      };
      expect(
        utils.id(
          state,
          findSameKeyPath(Seq.of("data", "childNodes", 1, "childNodes", 0))
        )
      ).toEqual("4");
    });

    it("accepts an optional parameter `path` to restrict the haystack to a subtree.", function() {
      var keyPath = findKeyPathById(
        "3",
        Seq.of("data", "childNodes", 1, "childNodes", 0)
      );
      expect(keyPath).toBeUndefined();
    });
  });

  describe("method `filter`", function() {
    var filterKeyPathByType = function(type, seq) {
      return utils.filter(
        state,
        function(item) {
          return item.get("type") === type;
        },
        seq
      );
    };

    it("returns a list of all key paths whose items passed the comparator function.", function() {
      var keyPaths = filterKeyPathByType("paragraph");
      expect(
        keyPaths.toArray().map(function(m) {
          return m.toJS();
        })
      ).toEqual([
        ["data", "childNodes", 0],
        ["data", "childNodes", 1, "childNodes", 0, "childNodes", 0],
        ["data", "childNodes", 1, "childNodes", 1, "childNodes", 0]
      ]);
      expect(
        keyPaths.toArray().map(function(m) {
          return getValue(m.toJS());
        })
      ).toEqual(["2", "5", "7"]);

      var keyPaths2 = filterKeyPathByType("listItem");
      expect(
        keyPaths2.toArray().map(function(m) {
          return m.toJS();
        })
      ).toEqual([
        ["data", "childNodes", 1, "childNodes", 0],
        ["data", "childNodes", 1, "childNodes", 1]
      ]);

      expect(
        keyPaths2.toArray().map(function(m) {
          return getValue(m.toJS());
        })
      ).toEqual(["4", "6"]);
    });

    it("passes the current node's key path as second argument to the comparator", function() {
      var filterDescendants = function(seq) {
        return utils.filter(state, function(node, keyPath) {
          return is(seq, keyPath.take(seq.size));
        });
      };
      expect(
        filterDescendants(Seq.of("data", "childNodes", 1)).toJS()
      ).toEqual([
        ["data", "childNodes", 1],
        ["data", "childNodes", 1, "childNodes", 0],
        ["data", "childNodes", 1, "childNodes", 1],
        ["data", "childNodes", 1, "childNodes", 0, "childNodes", 0],
        ["data", "childNodes", 1, "childNodes", 1, "childNodes", 0]
      ]);
    });

    it("accepts an optional parameter `path` to restrict the haystack to a subtree.", function() {
      var keyPaths = filterKeyPathByType(
        "paragraph",
        Seq.of("data", "childNodes", 1, "childNodes", 0)
      );
      expect(
        keyPaths.toArray().map(function(m) {
          return m.toJS();
        })
      ).toEqual([["data", "childNodes", 1, "childNodes", 0, "childNodes", 0]]);
      expect(
        keyPaths.toArray().map(function(m) {
          return getValue(m.toJS());
        })
      ).toEqual(["5"]);
    });
  });

  describe("method `byId`", function() {
    it("returns the key path of the first item whose id equals the id parameter.", function() {
      var keyPath = utils.byId(state, "7");

      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath.toJS())).toEqual("7");

      var keyPath2 = utils.byId(state, "4");
      expect(keyPath2.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath2.toJS())).toEqual("4");
    });
  });

  describe("method `byArbitrary`", function() {
    it("returns the key path representing an id.", function() {
      expect(utils.byArbitrary(state, "4").toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(utils.byArbitrary(state, "4").toJS())).toEqual("4");
    });

    it("returns the key path parameter if it is an array / a key path already.", function() {
      expect(
        utils
          .byArbitrary(state, Seq(["data", "childNodes", 1, "childNodes", 0]))
          .toJS()
      ).toEqual(["data", "childNodes", 1, "childNodes", 0]);
      expect(
        getValue(
          utils
            .byArbitrary(state, Seq(["data", "childNodes", 1, "childNodes", 0]))
            .toJS()
        )
      ).toEqual("4");
    });
  });

  describe("method `nextSibling`", function() {
    it("returns the next sibling node.", function() {
      var keyPath = utils.nextSibling(state, "4");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1
      ]);
      expect(getValue(keyPath.toJS())).toEqual("6");
    });

    it("returns undefined if the node at `id` does not have a next sibling.", function() {
      var keyPath = utils.nextSibling(state, "7");
      expect(keyPath).toBeUndefined();
    });
  });

  describe("method `previousSibling`", function() {
    it("returns the previous sibling node.", function() {
      var keyPath = utils.previousSibling(state, "6");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath.toJS())).toEqual("4");
    });

    it("returns undefined if the node at `id` does not have a previous sibling.", function() {
      var keyPath = utils.previousSibling(state, "4");
      expect(keyPath).toBeUndefined();
    });
  });

  describe("method `parent`", function() {
    it("returns the parent element's key path of the first item whose id equals the id parameter.", function() {
      var keyPath = utils.parent(state, "7");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1
      ]);
      expect(getValue(keyPath.toJS())).toEqual("6");
    });

    it("returns the parent parent element's key path of the first item whose id equals the id parameter.", function() {
      var keyPath = utils.parent(state, getValue(utils.parent(state, "7")));
      expect(keyPath.toJS()).toEqual(["data", "childNodes", 1]);
      expect(getValue(keyPath.toJS())).toEqual("3");
    });
  });

  describe("method `childIndex`", function() {
    it("returns the index of the first item whose id equals the id parameter according to its parent list.", function() {
      var index = utils.childIndex(state, "3");
      expect(index).toEqual(1);

      var index2 = utils.childIndex(state, "4");
      expect(index2).toEqual(0);
    });
  });

  describe("method `childAt`", function() {
    it("returns the composed keyPath that points at the child cursor.", function() {
      var keyPath = utils.childAt(state, "3", 0);
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath.toJS())).toEqual("4");

      var keyPath2 = utils.childAt(state, "3", 1);
      expect(keyPath2.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1
      ]);
      expect(getValue(keyPath2.toJS())).toEqual("6");
    });

    it("returns undefined if the node at `id` has no child nodes or no child node at `index`.", function() {
      var keyPath = utils.childAt(state, "2", 1);
      expect(keyPath).toBeUndefined();
    });
  });

  describe("method `firstChild`", function() {
    it("returns the first child node.", function() {
      var keyPath = utils.firstChild(state, "4");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath.toJS())).toEqual("5");
    });

    it("returns undefined if the node at `id` does not have a first child.", function() {
      var keyPath = utils.firstChild(state, "2");
      expect(keyPath).toBeUndefined();
    });
  });

  describe("method `lastChild`", function() {
    it("returns the last child node.", function() {
      var keyPath = utils.lastChild(state, "1");
      expect(keyPath.toJS()).toEqual(["data", "childNodes", 1]);
      expect(getValue(keyPath.toJS())).toEqual("3");
    });

    it("returns undefined if the node at `id` does not have a last child.", function() {
      var keyPath = utils.lastChild(state, "7");
      expect(keyPath).toBeUndefined();
    });
  });

  describe("method `hasChildNodes`", function() {
    it("returns true if a node has 1 or more child nodes.", function() {
      expect(utils.hasChildNodes(state, "4")).toBeTruthy();
    });

    it("returns false if a node has no child nodes.", function() {
      expect(utils.hasChildNodes(state, "5")).toBeFalsy();
    });
  });

  describe("method `numChildNodes`", function() {
    it("returns the number of child nodes.", function() {
      expect(utils.numChildNodes(state, "1")).toEqual(2);
    });
  });

  describe("method `siblings`", function() {
    it("returns list of all key paths with the same parent excluding the node itself.", function() {
      var keyPaths = utils.siblings(state, "6");
      expect(
        keyPaths.toArray().map(function(m) {
          return m.toJS();
        })
      ).toEqual([["data", "childNodes", 1, "childNodes", 0]]);

      expect(
        keyPaths.toArray().map(function(m) {
          return getValue(m.toJS());
        })
      ).toEqual(["4"]);
    });
  });

  describe("method `childNodes`", function() {
    it("returns list of all key paths which are first level descendants of the given node.", function() {
      var keyPaths = utils.childNodes(state, "1");
      expect(
        keyPaths.toArray().map(function(m) {
          return m.toJS();
        })
      ).toEqual([["data", "childNodes", 0], ["data", "childNodes", 1]]);

      expect(
        keyPaths.toArray().map(function(m) {
          return getValue(m.toJS());
        })
      ).toEqual(["2", "3"]);
    });
  });

  describe("method `ancestors`", function() {
    it("returns a list of all key paths that point at the ancestor nodes of the item at `id`.", function() {
      var keyPaths = utils.ancestors(state, "7");
      expect(
        keyPaths.toArray().map(function(m) {
          return m.toJS();
        })
      ).toEqual([
        ["data", "childNodes", 1, "childNodes", 1],
        ["data", "childNodes", 1],
        ["data"]
      ]);

      expect(
        keyPaths.toArray().map(function(m) {
          return getValue(m.toJS());
        })
      ).toEqual(["6", "3", "1"]);
    });
  });

  describe("method `descendants`", function() {
    it("returns a list of all key paths that represent child nodes of the item at `id`", function() {
      var keyPaths = utils.descendants(state, "3");
      expect(
        keyPaths.toArray().map(function(m) {
          return m.toJS();
        })
      ).toEqual([
        ["data", "childNodes", 1, "childNodes", 0],
        ["data", "childNodes", 1, "childNodes", 1],
        ["data", "childNodes", 1, "childNodes", 0, "childNodes", 0],
        ["data", "childNodes", 1, "childNodes", 1, "childNodes", 0]
      ]);

      expect(
        keyPaths.toArray().map(function(m) {
          return getValue(m.toJS());
        })
      ).toEqual(["4", "6", "5", "7"]);
    });
  });

  describe("method `right`", function() {
    it("returns the next sibling of the node found at `id`", function() {
      var keyPath = utils.right(state, "2");
      expect(keyPath.toJS()).toEqual(["data", "childNodes", 1]);
      expect(getValue(keyPath.toJS())).toEqual("3");
    });

    it("returns the first child node if present.", function() {
      var keyPath = utils.right(state, "3");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath.toJS())).toEqual("4");
    });

    it("returns the next sibling of the first ancestor that has a next sibling", function() {
      var keyPath = utils.right(state, "5");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1
      ]);
      expect(getValue(keyPath.toJS())).toEqual("6");
    });

    it("returns undefined if it is the last node in the tree.", function() {
      var keyPath = utils.right(state, "7");
      expect(keyPath).toBeUndefined();
    });

    it("can iterate over the whole tree.", function() {
      var id = "1";
      var node = utils.right(state, id);
      var result = [];
      while (node) {
        id = utils.id(state, node);
        result.push(id);
        node = utils.right(state, id);
      }
      expect(result).toEqual(["2", "3", "4", "5", "6", "7"]);
    });
  });

  describe("method `position`", function() {
    it("returns a number representating the position of the node in relation to all other nodes.", function() {
      var position = utils.position(state, "2");
      expect(typeof position === "number").toBeTruthy();
    });

    it("returns a higher number for nodes appear later in the tree", function() {
      expect(
        utils.position(state, "7") > utils.position(state, "4")
      ).toBeTruthy();
      expect(
        utils.position(state, "4") > utils.position(state, "2")
      ).toBeTruthy();
      expect(
        utils.position(state, "6") > utils.position(state, "5")
      ).toBeTruthy();
    });
  });

  describe("method `left`", function() {
    it("returns the previous sibling of the node found at `id`", function() {
      var keyPath = utils.left(state, "3");
      expect(keyPath.toJS()).toEqual(["data", "childNodes", 0]);
      expect(getValue(keyPath.toJS())).toEqual("2");
    });

    it("returns the latest child of the previous sibling if exists.", function() {
      var keyPath = utils.left(state, "6");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        0,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath.toJS())).toEqual("5");
    });

    it("returns the parent node if the node at `id` has no previous sibling.", function() {
      var keyPath = utils.left(state, "7");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1
      ]);
      expect(getValue(keyPath.toJS())).toEqual("6");
    });

    it("returns undefined if it is the last node in the tree.", function() {
      var keyPath = utils.left(state, "1");
      expect(keyPath).toBeUndefined();
    });

    it("can iterate over the whole tree.", function() {
      var id = "7";
      var node = utils.left(state, id);
      var result = [];
      while (node) {
        id = utils.id(state, node);
        result.push(id);
        node = utils.left(state, id);
      }
      expect(result).toEqual(["6", "5", "4", "3", "2", "1"]);
    });
  });

  describe("method `firstDescendant`", function() {
    it("returns the first child node in the tree", function() {
      var keyPath = utils.firstDescendant(state, "1");
      expect(keyPath.toJS()).toEqual(["data", "childNodes", 0]);
      expect(getValue(keyPath.toJS())).toEqual("2");
    });
  });

  describe("method lastDescendant`", function() {
    it("returns the last child node in the tree", function() {
      var keyPath = utils.lastDescendant(state, "1");
      expect(keyPath.toJS()).toEqual([
        "data",
        "childNodes",
        1,
        "childNodes",
        1,
        "childNodes",
        0
      ]);
      expect(getValue(keyPath.toJS())).toEqual("7");
    });
  });
});
