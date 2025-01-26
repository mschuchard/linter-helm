### Linter-Helm
Linter-Helm aims to provide functional and robust `helm lint` linting functionality within Pulsar.

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
The Helm binary executable at a minimum version of 3.0 is required to be installed before using this package. The Atom-IDE-UI and Language-YAML packages are also required.

All testing is performed with the latest stable version of Pulsar. Any version of Atom or any pre-release version of Pulsar is not supported.

### Usage
- This linter will trigger if and only if the current file is named `Chart.yaml`. The assumption is that this file indicates the current project and directory is a Helm chart. This will cause the entire project/directory to be linted, and the resulting information to be displayed accordingly.
- To quickly and easily access the issues in other files, you will need to change the settings inside Linter-UI-Default. For `Panel Represents` and/or `Statusbar Represents`, you will need to change their options to `Entire Project`. This will allow you to use either display to quickly access issues in other files by clicking on the displayed information.