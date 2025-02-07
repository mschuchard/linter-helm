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

  describe('from the Chart.yaml file checks a chart that would return errors and info and', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/error_info', 'Chart.yaml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the error message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(3);
        })
      );
    });

    it('verifies the message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('info');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('icon is recommended');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+Chart\.yaml$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('info');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual('file does not exist');
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+values\.yaml$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[0, 0], [0, 1]]);
          expect(messages[2].severity).toBeDefined();
          expect(messages[2].severity).toEqual('error');
          expect(messages[2].excerpt).toBeDefined();
          expect(messages[2].excerpt).toEqual('executing "error_info/templates/deployment.yaml" at <include "errors_warnings.fullname" .>: error calling include: template: no template "errors_warnings.fullname" associated with template "gotpl"');
          expect(messages[2].location.file).toBeDefined();
          expect(messages[2].location.file).toMatch(/.+templates\/deployment\.yaml$/);
          expect(messages[2].location.position).toBeDefined();
          expect(messages[2].location.position).toEqual([[3, 10], [3, 11]]);
        });
      });
    });
  });

  describe('from the values.yaml file checks a chart that would return errors and warnings and', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/error_warning', 'values.yaml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the error message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(2);
        })
      );
    });

    it('verifies the message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('warning');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("object name does not conform to Kubernetes naming requirements: \"invalid_name_format\": metadata.name: Invalid value: \"invalid_name_format\": a lowercase RFC 1123 subdomain must consist of lower case alphanumeric characters, '-' or '.', and must start and end with an alphanumeric character (e.g. 'example.com', regex used for validation is '[a-z0-9]([-a-z0-9]*[a-z0-9])?(\\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*')");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+templates\/deployment\.yaml$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual('a Deployment must contain matchLabels or matchExpressions, and "invalid_name_format" does not');
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+templates\/deployment\.yaml$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[0, 0], [0, 1]]);
        });
      });
    });
  });
});
