/*global document:true */
(function(cjs) {if(!cjs._is_node) {
var _ = cjs._;

cjs.binding.mixin({
	css: function(elem, prop_name, constraint) {
		var name = _.camel_case(prop_name);
		return cjs.binding.bind(elem.style, name, constraint);
	}
	, attr: function(elem, prop_name, constraint) {
		return cjs.binding.bind(elem, prop_name, constraint, function(obj, name, value) {
			obj.setAttribute(name, value);
		});
	}
	, "class": function(elem, constraint) {
		return cjs.binding.bind(elem, "className", constraint);
	}
});


var insert_at = function(child_node, parent_node, index) {
	var children = parent_node.childNodes;
	if(children.length <= index) {
		parent_node.appendChild(child_node);
	} else {
		var before_child = children[index];
		parent_node.insertBefore(child_node, before_child);
	}
};
var remove = function(child_node) {
	var parentNode = child_node.parentNode;
	if(parentNode !== null) {
		parentNode.removeChild(child_node);
	}
};

var remove_index = function(parent_node, index) {
	var children = parent_node.childNodes;
	if(children.length > index) {
		var child_node = children[index];
		remove(child_node);
	}
};

var move_child = function(parent_node, to_index, from_index) {
	var children = parent_node.childNodes;
	if(children.length > from_index) {
		var child_node = children[from_index];
		if(parent_node) {
			if(from_index < to_index) { //If it's less than the index we're inserting at...
				to_index++; //Increase the index by 1, to make up for the fact that we're removing me at the beginning
			}
			insert_at(child_node, parent_node, to_index);
		}
	}
};

/*
var element_data = [];

var get_data_obj = function(elem) {
	var data_obj_index = _.index_where(element_data, function(obj) {
		return obj.elem === elem;
	});

	if(data_obj_index < 0) {
		return null;
	} else {
		return element_data[data_obj_index];
	}
};

var get_data = function(elem, key) {
	var data_obj = get_data_obj(elem);

	if(data_obj === null) {
		return null;
	} else {
		return data_obj.data[key];
	}
};

var set_data = function(elem, key, value) {
	var data_obj = get_data_obj(elem);

	if(data_obj === null) {
		data_obj = {
			elem: elem
			, data: {}
		};
		element_data.push(data_obj);
	}

	data_obj.data[key] = value;
};
*/


var convert_item = function(item) {
	if(_.isElement(item) || _.isTextElement(item) || _.isCommentElement(item)) {
		return item;
	} else {
		var node = document.createTextNode(item);
		return node;
	}
};

cjs.binding.mixin("children", function(elem) {
	var child_constraints = _.rest(arguments);
	var children = cjs.create("constraint", function() {
			var dom_nodes = _.map(child_constraints, function(cc) {
					return cjs.get(cc);
				});
			var c_constraints = _.flatten(dom_nodes);

			return c_constraints;
	});

	var cached_value = [];

	var update_fn = function() {
		var value = cjs.get(children, true);
		if(!_.isArray(value)) {
			value = [value];
		}

		if(_.isElement(elem)) {
			var diff = _.diff(cached_value, value)
				, removed = diff.removed
				, added = diff.added
				, moved = diff.moved;

			_.forEach(removed, function(x) {
				remove_index(elem, x.index);
			});
			_.forEach(added, function(x) {
				var item = convert_item(x.item);
				insert_at(item, elem, x.index);
			});
			_.forEach(moved, function(x) {
				move_child(elem, x.to_index, x.from_index);
			});
		} else if(_.isTextElement(elem) || _.isCommentElement(elem)) {
			elem.nodeValue = _.map(value, function(child) {
				return String(child);
			}).join("");
		}

		cached_value = _.clone(value); //Value may be mutated, so clone it
	};

	return cjs.create("binding", {
		update: update_fn
		, activate: function() {
			//Clear the existing children of the element
			_.times(elem.childNodes.length, function() {
				elem.removeChild(elem.firstChild);
			});
			cached_value = [];
			if(cjs.is_constraint(children, true)) {
				children.onChange(update_fn);
			}
		}
		, deactivate: function() {
			children.offChange(update_fn);
		}
	});
});

cjs.define("dom_text", function() {
	var rv = document.createTextNode('');
	var args = _.toArray(arguments);
	args.unshift(rv);
	cjs.binding.children.apply(cjs, args);
	return rv;
});

cjs.define("dom_comment", function() {
	var rv = document.createComment('');
	var args = _.toArray(arguments);
	args.unshift(rv);
	cjs.binding.children.apply(cjs, args);
	return rv;
});

cjs.define("dom_element", function(tag, attributes) {
	var rv = document.createElement(tag);
	var args = _.rest(arguments, 2);
	args.unshift(rv);
	_.forEach(attributes, function(value, key) {
		cjs.attr(rv, key, value);
	});
	cjs.binding.children.apply(cjs, args);
	return rv;
});

cjs.binding.mixin("text", cjs.binding.children);

}}(cjs));