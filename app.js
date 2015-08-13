var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="type_declarations/index.d.ts" />
var React = require('react');
var path_1 = require('path');
var fs = require('fs');
var max_depth = 2;
var FilesystemNode = (function (_super) {
    __extends(FilesystemNode, _super);
    function FilesystemNode(props) {
        _super.call(this, props);
        var stats;
        try {
            stats = fs.statSync(props.path);
        }
        catch (exc) {
            console.error(exc);
        }
        this.state = {
            stats: stats,
            children: (stats && stats.isDirectory()) ? fs.readdirSync(props.path) : [],
        };
    }
    FilesystemNode.prototype.render = function () {
        var _this = this;
        var name = React.createElement("div", null, this.props.name);
        if (this.state.stats && this.state.stats.isDirectory() && this.props.depth < max_depth) {
            var next_depth = this.props.depth + 1;
            var children = this.state.children.map(function (child_name) {
                var child_path = path_1.join(_this.props.path, child_name);
                return React.createElement(FilesystemNode, {"key": child_name, "name": child_name, "path": child_path, "depth": next_depth});
            });
            return (React.createElement("div", null, name, React.createElement("div", {"className": "container"}, children)));
        }
        else {
            return name;
        }
    };
    return FilesystemNode;
})(React.Component);
var App = (function (_super) {
    __extends(App, _super);
    function App(props) {
        _super.call(this, props);
        this.state = {
            left: {
                name: 'work',
                path: '/Users/chbrown/work',
            },
            right: {
                name: 'work-tm',
                path: '/Users/chbrown/work-tm',
            },
        };
    }
    App.prototype.render = function () {
        return (React.createElement("main", null, React.createElement("article", {"className": "left"}, React.createElement(FilesystemNode, React.__spread({}, this.state.left, {"depth": 0}))), React.createElement("article", {"className": "right"}, React.createElement(FilesystemNode, React.__spread({}, this.state.right, {"depth": 0})))));
    };
    return App;
})(React.Component);
// attach app
React.render(React.createElement(App, null), document.getElementById('app'));
