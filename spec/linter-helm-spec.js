'use babel';

import * as path from 'path';

describe('The Helm provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-helm');
      return atom.packages.activatePackage('language-yaml').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures/clean', 'Chart.yaml'))
      );
    });
  });

  it('immediately returns from a yaml file not within a helm chart', (done) => {
    const otherFile = path.join(__dirname, 'fixtures/not_helm', 'foo.yaml');
    return atom.workspace.open(otherFile).then(editor =>
      lint(editor).then(messages => {
      }, () => {
        done();
      })
    );
  });

  it('finds nothing wrong with a valid chart', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures/clean', 'Chart.yaml');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });
});
