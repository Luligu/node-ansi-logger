# Dev Containers v.2.1.1

Node and Bun configurations for ordinary repositories, including libraries and utilities, aligned with Matterbridge’s Docker VMM setup. Open **Dev Containers: Reopen in Container** and select a runtime.

## Startup and storage

- The host bootstrap uses only Docker: network inspection/creation and an unconditional image pull run in parallel. No host Bash, Node or Bun installation is needed. All shell scripts run inside the container.
- Repository source remains bind-mounted. Runtime-specific named volumes hold node_modules; a shared repository volume holds .cache.
- Both runtimes share the vscode-extensions volume, plus package caches, Bash history and agent state. The images seed home volume ownership with UID/GID 1000; workspace volume ownership is checked during creation.
- Creation prepares workspace dependency/cache directories and shared home directories, repairing ownership only when the owner differs.
- Creation also installs dependencies, builds the project and checks for outdated packages. Each start installs dependencies and builds the project again, preserving the existing lifecycle. Ownership repair runs during creation and only for paths with a different owner.
- Ordinary repositories do not install/link Matterbridge, require a frontend, or publish its UI port.

## Docker VMM host setup

Use Virtual file shares (VirtioFS) for the repository parent directory. Avoid Synchronized file shares: the Matterbridge 2.1.0 reference documents Git memory-mapping failures with those shares.

On Windows with Docker VMM, set "dev.containers.forwardWSLServices": false in VS Code **user** settings to avoid unnecessary WSL probes. This application-level setting cannot be supplied by the container configuration.

After updating these files or the shared image, run **Dev Containers: Rebuild Container**. Pulling an image does not replace an existing container. Stop the previous runtime before switching: both variants share writable volumes.
