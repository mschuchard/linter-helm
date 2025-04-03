'use babel';

import { existsSync, lstatSync } from 'fs';

export default {
  config: {
    helmExecutablePath: {
      title: 'Helm Executable Path',
      type: 'string',
      description: 'Path to kubectl executable (e.g. /usr/local/bin/kubectl) if not in shell env path.',
      default: 'helm',
    },
    ignoreInfo: {
      title: 'Ignore Info Messages',
      type: 'boolean',
      description: 'Ignore linting messages at the info level (only view warning and error).',
      default: false,
    },
    lintDependencies: {
      title: 'Lint Dependent Charts',
      type: 'boolean',
      description: 'Additionally lint the dependent charts.',
      default: false,
    },
    failWarnings: {
      title: 'Fail on Warnings',
      type: 'boolean',
      description: 'Treat messages at warning level instead as errors.',
      default: false,
    },
  },

  // activate linter
  activate() {
    const helpers = require('atom-linter');

    // check for helm >= minimum version
    helpers.exec(atom.config.get('linter-helm.helmExecutablePath'), ['--version']).then(output => {
      // check if helm >= 3.0
      if (/v[0-2]\./.exec(output)) {
        atom.notifications.addWarning(
          'helm < 3.0 is unsupported',
          {
            detail: 'Please upgrade your version of helm to >= 3.0.',
            dismissable: true,
          }
        );
      }
    });
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Helm',
      grammarScopes: ['source.yaml'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        // setup variables
        const helpers = require('atom-linter');
        const file = textEditor.getPath();
        const path = require('path');
        const dir = path.dirname(file) + path.sep;
        const projectPath = atom.project.relativizePath(dir)[0] == null ? '' : atom.project.relativizePath(dir)[0] + path.sep;
        let chartPath;

        // determine if the project contains a Chart.yaml at top level...
        if (existsSync(`${projectPath}Chart.yaml`) && lstatSync(`${projectPath}Chart.yaml`).isFile())
          chartPath = projectPath;
        // ...or if the current dir contains a Chart.yaml...
        else if (existsSync(`${dir}Chart.yaml`) && lstatSync(`${dir}Chart.yaml`).isFile())
          chartPath = dir;
        // ...otherwise bail out since those are the reliable indicators of a chart
        else return [];

        // setup args for validating
        const args = ['lint'];

        // quiet option to ignore info level messages
        if (atom.config.get('linter-helm.ignoreInfo'))
          args.push('--quiet');

        // lint dependent charts
        if (atom.config.get('linter-helm.lintDependencies'))
          args.push('--with-subcharts');

        // treat warnings as errors
        if (atom.config.get('linter-helm.failWarnings'))
          args.push('--strict');

        // finish args
        args.push(chartPath);

        return helpers.exec(atom.config.get('linter-helm.helmExecutablePath'), args, { ignoreExitCode: true, throwOnStderr: false }).then(output => {
          const toReturn = [];

          output.split(/\r?\n/).forEach((line) => {
            // setup matchers for output parsing
            const lintMatches = /\[(ERROR|WARNING|INFO)\].*\s(.*\.ya?ml):?(\d+)?:?(\d+)?:\s(.*)/.exec(line);

            // check for useful linter output
            if (lintMatches != null) {
              // determine if line and col info exists
              const lineNum = lintMatches[3] == null ? 0 : Number.parseInt(lintMatches[3], 10) - 1;
              const colNum = lintMatches[4] == null ? 1 : Number.parseInt(lintMatches[4], 10);

              toReturn.push({
                severity: lintMatches[1].toLowerCase(),
                excerpt: lintMatches[5],
                location: {
                  file: chartPath + lintMatches[2],
                  position: [[lineNum, colNum - 1], [lineNum, colNum]],
                },
              });
            }
          });
          return toReturn;
        });
      }
    };
  }
};
