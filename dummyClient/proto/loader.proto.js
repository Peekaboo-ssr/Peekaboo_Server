// src/proto/protoLoader.js
import fs from 'fs';
import path from 'path';
import protobuf from 'protobufjs';

export class ProtoLoader {
  constructor(protoDir, packetNames) {
    this.protoDir = protoDir;
    this.packetNames = packetNames;
    this.protoFiles = this.getAllProtoFiles(this.protoDir);
    this.protoMessages = {};
  }

  getAllProtoFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        this.getAllProtoFiles(filePath, fileList);
      } else if (path.extname(file) === '.proto') {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  async load() {
    const root = new protobuf.Root();
    await Promise.all(this.protoFiles.map((file) => root.load(file)));

    for (const [packageName, types] of Object.entries(this.packetNames)) {
      this.protoMessages[packageName] = {};
      for (const [type, typeName] of Object.entries(types)) {
        this.protoMessages[packageName][type] = root.lookupType(typeName);
      }
    }
    console.log('Proto files loaded successfully.');
  }

  getMessage(packageName, type) {
    return this.protoMessages[packageName][type];
  }
}
