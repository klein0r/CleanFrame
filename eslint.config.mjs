// Development only: check the runtime grammar and common runtime mistakes.
// Runtime JavaScript is ES5 plus block-scoped let/const (ES2015); the parser
// accepts ES2015 so the other ES2015 syntax is rejected explicitly below.
const es2015Only = message => ({ message: message + ' (runtime allows only let/const from ES2015)' });
const restrictedSyntax = [
  ['ArrowFunctionExpression', 'Arrow functions'],
  ['ClassDeclaration, ClassExpression', 'Classes'],
  ['TemplateLiteral, TaggedTemplateExpression', 'Template literals'],
  ['ObjectPattern, ArrayPattern', 'Destructuring'],
  ['SpreadElement, RestElement', 'Spread/rest'],
  ['AssignmentPattern', 'Default parameters'],
  ['ForOfStatement', 'for...of'],
  ['FunctionDeclaration[generator=true], FunctionExpression[generator=true]', 'Generators'],
  ['Property[shorthand=true], Property[method=true], Property[computed=true]', 'ES2015 object literal shorthand'],
  ['MetaProperty', 'new.target'],
  ['ImportDeclaration, ExportNamedDeclaration, ExportDefaultDeclaration, ExportAllDeclaration', 'Modules'],
  ['Literal[regex.flags=/[uy]/]', 'Regex u/y flags'],
  ['Literal[raw=/^0[bBoO]/]', 'Binary/octal literals']
].map(([selector, label]) => Object.assign({ selector }, es2015Only(label)));

// Local rule: a declaration must not share a line with an earlier declaration
// (`const a = 1; let b;` or `const a = f(); g(); const b = 2;`).
// With one-var this gives one definition per line.
const oneDeclarationPerLine = {
  meta: {
    type: 'layout',
    fixable: 'whitespace',
    messages: { sameLine: 'Put each declaration on its own line.' }
  },
  create(context) {
    const source = context.sourceCode;
    return {
      VariableDeclaration(node) {
        const parent = node.parent;
        const siblings = parent.type === 'SwitchCase' ? parent.consequent : parent.body;
        if (!Array.isArray(siblings)) return;
        const index = siblings.indexOf(node);
        const prev = siblings[index - 1];
        let shared = false;
        for (let i = index - 1; i >= 0 && siblings[i].loc.end.line === node.loc.start.line; i--) {
          if (siblings[i].type === 'VariableDeclaration') shared = true;
        }
        if (!shared) return;
        const between = [prev.range[1], node.range[0]];
        const hasComment = source.getAllComments().some(c => c.range[0] >= between[0] && c.range[1] <= between[1]);
        const indent = source.lines[prev.loc.start.line - 1].match(/^\s*/)[0];
        context.report({
          node,
          messageId: 'sameLine',
          fix: hasComment ? null : fixer => fixer.replaceTextRange(between, '\n' + indent)
        });
      }
    };
  }
};

export default [{
  files: ['app/**/*.js'],
  plugins: { local: { rules: { 'one-declaration-per-line': oneDeclarationPerLine } } },
  languageOptions: {
    ecmaVersion: 2015,
    sourceType: 'script',
    globals: {
      window: 'readonly', document: 'readonly', Image: 'readonly', localStorage: 'readonly', XMLHttpRequest: 'readonly',
      setTimeout: 'readonly', clearTimeout: 'readonly', Promise: 'readonly',
      FrameDevice: 'readonly', tizen: 'readonly'
    }
  },
  rules: {
    'no-undef': 'error',
    'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-unreachable': 'error',
    'no-constant-condition': 'error',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-func-assign': 'error',
    'no-global-assign': 'error',
    'no-unexpected-multiline': 'error',
    'valid-typeof': 'error',
    eqeqeq: ['error', 'always'],
    'no-var': 'error',
    'prefer-const': ['error', { destructuring: 'all', ignoreReadBeforeAssign: true }],
    'no-restricted-syntax': ['error'].concat(restrictedSyntax),
    'one-var': ['error', 'never'],
    'local/one-declaration-per-line': 'error'
  }
}];
