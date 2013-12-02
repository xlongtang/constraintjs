module("Templates");

dt("Static Templates", 7, function() {
	var empty_template = cjs.template("", {});
	equal(empty_template.textContent, "");

	var hello_template = cjs.template("hello world", {});
	equal(hello_template.textContent, "hello world");

	var div_template = cjs.template("<div>hi</div>", {});
	equal(div_template.tagName.toLowerCase(), "div");
	equal(div_template.textContent, "hi");

	var nested_div_template = cjs.template("<div>hi <strong>world</strong></div>", {});
	equal(nested_div_template.tagName.toLowerCase(), "div");
	var strong_content = nested_div_template.getElementsByTagName("strong")[0];
	equal(strong_content.textContent, "world");

	var classed_template = cjs.template("<div class='my_class'>yo</div>", {});
	equal(classed_template.className, "my_class");
});

dt("Dynamic Templates", 4, function() {
	var t1 = cjs.template("{{x}}", {x: "hello world"});
	equal(t1.textContent, "hello world");

	var greet = cjs("hello");
	var city = cjs("pittsburgh");
	var t2 = cjs.template("{{greeting}}, {{city}}", {greeting: greet, city: city});
	equal(t2.textContent, "hello, pittsburgh");
	greet.set("bye");
	equal(t2.textContent, "bye, pittsburgh");
	city.set("world");
	equal(t2.textContent, "bye, world");
});

dt("HTMLized Templates", 7, function() {
	var x = cjs("X"), y = cjs("Y");
	var t1 = cjs.template("{{{x}}}, {{y}}", {x: x, y: y});
	equal(t1.textContent, "X, Y");
	x.set("<strong>X</strong>");
	var strong_content = t1.getElementsByTagName("strong")[0];
	equal(t1.textContent, "X, Y");
	equal(strong_content.textContent, "X");
	y.set("<b>Y</b>");
	equal(t1.textContent, "X, <b>Y</b>");

	var t2 = cjs.template("<div>{{{x}}}, {{y}}</div>", {x: x, y: y});
	equal(t2.textContent, "X, <b>Y</b>");
	var strong_content = t2.getElementsByTagName("strong")[0];
	equal(strong_content.textContent, "X");
	equal(t2.tagName.toLowerCase(), "div");
});

dt("Attributes", 4, function() {
	var the_class = cjs("class1");
	var t1 = cjs.template("<span class={{x}}>yo</span>", {x: the_class});

	equal(t1.className, "class1");
	the_class.set("classX");
	equal(t1.className, "classX");

	var second_class = cjs("class2");
	var t2 = cjs.template("<span class='{{x}} {{y}} another_class'>yo</span>", {x: the_class, y: second_class});
	equal(t2.className, "classX class2 another_class");
	second_class.set("classY");
	equal(t2.className, "classX classY another_class");
});

dt("Each", 3, function() {
	var elems = cjs([1,2,3]);
	var t1 = cjs.template("<div>" +
		"{{#each elems}}" +
		"<span>{{this}}</span>" +
		"{{/each}}"+
	"</div>", {elems: elems});
	equal(t1.childNodes.length, 3);
	var elem0 = t1.childNodes[0];
	elems.push(4);
	equal(t1.childNodes.length, 4);
	equal(elem0, t1.childNodes[0]);
});

dt("Conditionals", 10, function() {
	var cond = cjs(true);
	var t1 = cjs.template("<div>" +
		"{{#if cond}}" +
		"1" +
		"{{#else}}" +
		"2" +
		"{{/if}}"+
	"</div>", {cond: cond});
	equal(t1.textContent, "1")
	cond.set(false);
	equal(t1.textContent, "2")
	cond.set(true);
	equal(t1.textContent, "1")

	var cond2 = cjs(true);
	var t2 = cjs.template("<div>" +
		"{{#if cond}}" +
		"<span>A</span>" +
		"{{#elif cond2}}" +
		"<span>B</span>" +
		"{{#else}}" +
		"<span>C</span>" +
		"{{/if}}"+
	"</div>", {cond: cond, cond2: cond2});
	var cna1 = t2.childNodes[0];
	equal(cna1.textContent, "A")
	cond.set(false);
	var cnb1 = t2.childNodes[0];
	equal(cnb1.textContent, "B")
	cond.set(true);
	var cna2 = t2.childNodes[0];
	equal(cna2.textContent, "A")
	cond.set(false);
	var cnb2 = t2.childNodes[0];
	equal(cnb2.textContent, "B")
	equal(cna1, cna2);
	equal(cnb1, cnb2);
	cond2.set(false);
	var cnc2 = t2.childNodes[0];
	equal(cnc2.textContent, "C")
});

dt("FSM", 3, function() {
	var my_fsm = cjs.fsm("s1", "s2")
					.startsAt("s1");
	var s1s2 = my_fsm.addTransition("s1", "s2");
	var s2s1 = my_fsm.addTransition("s2", "s1");
	var t1 = cjs.template("<div>" +
		"{{#fsm my_fsm}}" +
		"{{#state s1}}" +
		"1" +
		"{{#state s2}}" +
		"2" +
		"{{/if}}"+
	"</div>", {my_fsm: my_fsm});
	equal(t1.textContent, "1")
	s1s2();
	equal(t1.textContent, "2")
	s2s1();
	equal(t1.textContent, "1")
});

dt("Provided Parent", 4, function() {
	var elem = document.createElement("div");
	var x = cjs(1);
	var template = cjs.template("{{this}}", x, elem);
	equal(template, elem);
	equal(template.textContent, "1");
	x.set(2);
	equal(template.textContent, "2");
	equal(template, elem);
});

dt("FN Calls", 2, function() {
	var abc = cjs.template("{{#each x}}{{plus_one(this)}}{{/each}}", {x: [1,2,3], plus_one: function(x){ return x+1; }});
	equal(abc.childNodes.length, 3);
	equal(abc.textContent, "234");
});
