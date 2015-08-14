var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="type_declarations/index.d.ts" />
var React = require('react');
var diff_1 = require('./diff');
var notify_ui_1 = require('notify-ui');
var max_depth = 2;
var FSNodePairComponent = (function (_super) {
    __extends(FSNodePairComponent, _super);
    function FSNodePairComponent(props) {
        _super.call(this, props);
    }
    FSNodePairComponent.prototype.render = function () {
        // var next_depth = this.props.depth + 1;
        var left = this.props.left ? React.createElement("div", {"alt": this.props.left.path}, this.props.left.basename) : React.createElement("div", null);
        var right = this.props.right ? React.createElement("div", {"alt": this.props.right.path}, this.props.right.basename) : React.createElement("div", null);
        var children = [React.createElement("div", null)];
        if (this.props.equal) {
        }
        else if (!this.props.children && this.props.left) {
            // deletion
            left = React.createElement("del", null, left);
        }
        else if (!this.props.children && this.props.right) {
            // insertion
            right = React.createElement("ins", null, right);
        }
        else if (this.props.children) {
            // difference in children
            children = this.props.children.map(function (child_pair) {
                var basename = child_pair.left ? child_pair.left.basename : child_pair.right.basename;
                return React.createElement(FSNodePairComponent, React.__spread({"key": basename}, child_pair));
            });
        }
        return (React.createElement("div", {"className": "pair"}, React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "left"}, left), React.createElement("div", {"className": "right"}, right)), React.createElement("div", {"className": "children"}, children)));
    };
    return FSNodePairComponent;
})(React.Component);
var App = (function (_super) {
    __extends(App, _super);
    function App(props) {
        _super.call(this, props);
        this.state = {
            left_path: localStorage['left_path'] || '/tmp/left',
            right_path: localStorage['right_path'] || '/tmp/right',
        };
    }
    App.prototype.leftChange = function (event) {
        var left_path = event.target.value;
        localStorage['left_path'] = left_path;
        this.refresh(left_path, this.state.right_path);
    };
    App.prototype.rightChange = function (event) {
        var right_path = event.target.value;
        localStorage['right_path'] = right_path;
        this.refresh(this.state.left_path, right_path);
    };
    App.prototype.refresh = function (left_path, right_path) {
        var _this = this;
        diff_1.compare(left_path, right_path, function (error, pair) {
            if (error) {
                console.error(error);
                notify_ui_1.NotifyUI.add(error.message);
            }
            _this.setState({ left_path: left_path, right_path: right_path, pair: pair });
        });
    };
    App.prototype.componentDidMount = function () {
        this.refresh(this.state.left_path, this.state.right_path);
    };
    App.prototype.render = function () {
        return (React.createElement("main", null, React.createElement("div", {"className": "row"}, React.createElement("div", {"className": "left"}, React.createElement("input", {"onChange": this.leftChange.bind(this), "value": this.state.left_path})), React.createElement("div", {"className": "right"}, React.createElement("input", {"onChange": this.rightChange.bind(this), "value": this.state.right_path}))), React.createElement("div", null, React.createElement(FSNodePairComponent, React.__spread({}, this.state.pair)))));
    };
    return App;
})(React.Component);
// attach app
React.render(React.createElement(App, null), document.getElementById('app'));
