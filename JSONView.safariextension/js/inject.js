"use strict";

let json = null;
if (document.body.getElementsByTagName("*").length === 1 && document.body.getElementsByTagName("pre").length === 1)
	json = parseJSON(document.body.getElementsByTagName("pre")[0].innerHTML);

if (!json)
	json = parseJSON(document.body.innerHTML);

if (json) {
	document.body.textContent = "";

	document.head.appendChild(createDOM(
		"link",
		{
			rel: "stylesheet",
			type: "text/css",
			href: `${safari.extension.baseURI}css/viewer.css`,
		}
	));

	document.body.appendChild(createDOM(
		"main",
		null,
		[
			fromValue(json, "")
		]
	));
}

function fromValue(value, path) {
	if (value === null) {
		return createDOM(
			"span",
			{
				class: "null",
			},
			[
				"null"
			]
		);
	}

	if (Array.isArray(value))
		return fromArray(value, path);

	if (typeof value === "object")
		return fromObject(value, path);

	if (typeof value === "number") {
		return createDOM(
			"span",
			{
				class: "number",
			},
			[
				value
			]
		)
	}

	if (typeof value === "boolean") {
		return createDOM(
			"span",
			{
				class: "boolean",
			},
			[
				value
			]
		);
	}

	let fragment = document.createDocumentFragment();

	if (typeof value === "string") {
		fragment.appendChild(document.createTextNode("\""));

		if (/\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[\.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'\".,<>?«»“”‘’]))/i.test(value)) {
			fragment.appendChild(createDOM(
				"a",
				{
					href: value,
					target: "_blank",
					rel: "noopener",
				},
				[
					JSON.stringify(value).slice(1, -1),
				]
			));
		} else {
			fragment.appendChild(createDOM(
				"span",
				{
					class: "string",
				},
				[
					JSON.stringify(value).slice(1, -1),
				]
			));
		}

		fragment.appendChild(document.createTextNode("\""));
	}

	return fragment;
}

function fromArray(array, path) {
	let fragment = document.createDocumentFragment();

	if (array.length) {
		let container = createDOM(
			"ul",
			{
				class: ["array", "collapsible"],
			}
		);

		fragment.appendChild(createCollapserElement(container));

		fragment.appendChild(document.createTextNode("["));

		fragment.appendChild(container);

		for (let i = 0; i < array.length; ++i) {
			let item = container.appendChild(createDOM(
				"li",
				null,
				[
					fromValue(array[i], `${path}[${i}]`)
				]
			));

			if (i < array.length - 1)
				item.appendChild(document.createTextNode(","));
		}

		fragment.appendChild(document.createTextNode("]"));
	} else
		fragment.appendChild(document.createTextNode("[ ]"));

	return fragment;
}

function fromObject(object, path) {
	let fragment = document.createDocumentFragment();

	let countKeys = Object.keys(object).length;
	if (countKeys) {
		let container = createDOM(
			"ul",
			{
				class: ["object", "collapsible"],
			}
		);

		fragment.appendChild(createCollapserElement(container));

		fragment.appendChild(document.createTextNode("{"));

		fragment.appendChild(container);

		for (let key in object) {
			let simple = /^[A-Za-z_$][A-Za-z0-9_\-$]*$/.test(key);
			let subpath = path + (simple ? "." : "\"") + JSON.stringify(key).slice(1, -1) + (simple ? "" : "\"");

			let dataElement = createDOM(
				"span",
				{
					class: "property",
					title: subpath,
				}
			);

			if (!simple) {
				dataElement.appendChild(createDOM(
					"span",
					{
						class: "quote",
					},
					[
						"\""
					]
				));
			}

			dataElement.appendChild(document.createTextNode(JSON.stringify(key).slice(1, -1)));

			if (!simple) {
				dataElement.appendChild(createDOM(
					"span",
					{
						class: "quote",
					},
					[
						"\""
					]
				));
			}

			let dataContainer = container.appendChild(createDOM(
				"li",
				null,
				[
					dataElement,
					": ",
					fromValue(object[key], subpath)
				]
			));

			if (countKeys-- > 1)
				dataContainer.appendChild(document.createTextNode(","));
		}

		fragment.appendChild(document.createTextNode("}"));
	} else
		fragment.appendChild(document.createTextNode("{ }"));

	return fragment;
}

function parseJSON(string) {
	let json = null;
	try {
		json = JSON.parse(string);
	} catch (error) {
	}
	return json;
}

function createCollapserElement(target) {
	let element = createDOM(
		"span",
		{
			class: "collapser"
		}
	);

	element.addEventListener("click", event => {
		element.classList.toggle("collapsed");

		target.classList.toggle("collapsed");
	});

	return element;
}

function createDOM(tag, attributes = {}, children = []) {
	let element = document.createElement(tag);

	for (let key in attributes) {
		if (Array.isArray(attributes[key]))
			element.setAttribute(key, attributes[key].join(" "))
		else
			element.setAttribute(key, attributes[key]);
	}

	children.forEach(child => {
		if (typeof child === "string" || typeof child === "number" || typeof child === "boolean")
			child = document.createTextNode(child);

		element.appendChild(child);
	});

	return element;
}
