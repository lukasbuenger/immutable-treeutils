const { parse } = require('acorn');
const glob = require('glob');
const fs = require('fs');
const Mustache = require('mustache');

const pkg = require('../package');

const tagExp = /@[a-z]+ (_|-|[a-zA-Z0-9]|\.)+/g;
const asteriskAndNewLineExp = /(^\*)?\n( )?(\t+)? \*( )?/g;

const links = [
	{
		name: 'TreeUtils',
		lookup: 'ImmutableJS',
		url: 'http://github.com/lukasbuenger/immutable-treeutils/',
	},
	{
		name: 'ImmutableJS',
		lookup: 'ImmutableJS',
		url: 'http://facebook.github.io/immutable-js/',
	},
	{
		name: 'Seq',
		lookup: 'Immutable.Seq',
		url: 'http://facebook.github.io/immutable-js/docs/#/Seq',
	},
	{
		name: 'Record',
		lookup: 'Immutable.Record',
		url: 'http://facebook.github.io/immutable-js/docs/#/Record',
	},
	{
		name: 'List',
		lookup: 'Immutable.List',
		url: 'http://facebook.github.io/immutable-js/docs/#/List',
	},

];

glob('src/*.js', {}, (er, fileNames) => {
	if (er) {
		console.error(er);
	} else {
		const refs = [];
		const parsed = fileNames.map((fileName) => {
			const data = fs.readFileSync(fileName, 'utf8');
			let comments = '';
			try {
				parse(data, {
					ecmaVersion: 6,
					sourceType: 'module',
					onComment: (block, commentText) => {
						let text = commentText;
						if (block) {
							let attributes;
							let attributeMatch = tagExp.exec(text);
							while (attributeMatch) {
								if (!attributes) {
									attributes = {};
								}
								const parts = attributeMatch[0].split(' ');
								attributes[parts[0].substr(1)] = parts[1];
								attributeMatch = tagExp.exec(text);
							}
							if (attributes) {
								refs.push(attributes);
								text = text.replace(tagExp, '');
							}
							text = text.replace(asteriskAndNewLineExp, '\n');
							comments = comments.concat(
								'- - - \n',
								attributes && attributes.id ? `<a id="${attributes.id}"></a>` : '',
								text,
								'\n\n',
							);
							text = text.replace(tagExp, '');
						}
					},
				});
			} catch (e) {
				throw (e.stack);
			}
			return {
				comments,
				fileName,
			};
		});

		const linkPatterns = links.reduce((memo, link) => {
			return Object.assign(
				{},
				memo,
				{ [link.lookup]: `[${link.name}](${link.url})` },
			);
		}, {});
		const refPatterns = refs.reduce((memo, ref) => {
			if (ref.id && ref.lookup) {
				return Object.assign(
					{},
					memo,
					{ [ref.lookup]: `[${ref.name || ref.lookup}](#${ref.id})` },
				);
			}
			return memo;
		}, {});

		const concatenatedComments = parsed.reduce((memo, item) => {
			const comments = item.comments;

			if (comments.length > 0) {
				return memo.concat(`- - -
<sub>[See Source](https://github.com/lukasbuenger/immutable-treeutils/tree/v${pkg.version}/${item.fileName})</sub>
`,
					comments,
				);
			}
			return memo;
		}, '');

		const template = fs.readFileSync('scripts/README.mustache', 'utf8');
		let rendered = Mustache.render(template, {
			pkg,
			docs: concatenatedComments,
		});

		Object.keys(linkPatterns).forEach((key) => {
			rendered = rendered.replace(new RegExp(`>\\b${key}\\b`, 'g'), linkPatterns[key]);
		});

		Object.keys(refPatterns).forEach((key) => {
			rendered = rendered.replace(new RegExp(`>\\b${key}\\b`, 'g'), refPatterns[key]);
		});

		fs.writeFileSync('README.md', rendered);
	}
});
