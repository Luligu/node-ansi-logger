# NodeStorage

NodeStorage is a lightweight, file-based storage management system for Node.js, built on top of `node-persist`. It allows for easy and intuitive handling of persistent key-value storage directly within your Node.js applications. This system is ideal for small to medium-sized projects requiring simple data persistence without the overhead of a database system.

## Features

- Simple and intuitive API for data storage and retrieval.
- Asynchronous data handling.
- Customizable storage directories for isolated storage contexts.
- Built-in logging capabilities for monitoring storage initialization and operations.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- Basic knowledge of TypeScript and Node.js.

### Installation

To get started with NodeStorage in your package

```bash
npm install node-storage-manager
```

# Usage

## Initializing NodeStorageManager:

Create an instance of NodeStorageManager to manage your storage instances.

```
import { NodeStorageManager, NodeStorage } from 'node-storage-manager';
```

```
const storageManager = new NodeStorageManager({
  dir: 'path/to/storage/directory', // Optional: Customize the storage directory.
  logging: true, // Optional: Enable logging.
});
```

## Creating a Storage Instance:

Use the manager to create a new storage context.

```
const myStorage = await storageManager.createStorage('myStorageName');
```

Using the Storage:

## Set a value:

```
await myStorage.set('myKey', 'myValue');
```

## Get a value:

```
const value = await myStorage.get('myKey');
console.log(value); // Outputs: 'myValue'
```

## Remove a value:

```
await myStorage.remove('myKey');
```

## Clear the storage:

```
await myStorage.clear();
```

# API Reference

## NodeStorageManager methods:

### createStorage(storageName: string): Promise<NodeStorage>
### removeStorage(storageName: string): Promise<boolean>
### logStorage(): Promise<void>


## NodeStorage methods:

### set<T = any>(key: NodeStorageKey, value: T): Promise<void>
### get<T = any>(key: NodeStorageKey, defaultValue?: T): Promise<T>
### remove(key: NodeStorageKey): Promise<void>
### clear(): Promise<void>
### logStorage(): Promise<void>

# Contributing

Contributions to NodeStorage are welcome.

# License

This project is licensed under the MIT License - see the LICENSE file for details.

# Acknowledgments

Thanks to node-persist for providing the underlying storage mechanism.