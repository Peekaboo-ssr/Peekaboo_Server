import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import protobuf from 'protobufjs';

const packetNames = {
  common: {
    GamePacket: 'common.GamePacket',
    ServicePacket: 'common.ServicePacket',
  },
};

// 현재 디렉토리로 루트를 잡음
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const protoDir = path.join(__dirname, '../protobufs');

const getAllProtoFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    if (fs.statSync(filePath).isDirectory()) {
      getAllProtoFiles(filePath, fileList);
    }

    // 5. 일반 파일이라면 .proto 확장자만 찾아서 검색
    else if (path.extname(file) === '.proto') {
      // 6. 해당 파일을 fileList에 추가
      fileList.push(filePath);
    }
  });

  return fileList;
};

const protoFiles = getAllProtoFiles(protoDir);

const protoMessages = {};

const loadProtos = async () => {
  try {
    const root = new protobuf.Root();

    await Promise.all(protoFiles.map((file) => root.load(file)));

    for (const [packageName, types] of Object.entries(packetNames)) {
      console.log(packageName, types);
      protoMessages[packageName] = {};
      for (const [type, typeName] of Object.entries(types)) {
        protoMessages[packageName][type] = root.lookupType(typeName);
      }
    }

    console.log('Protobuf 파일 로드 완료');
  } catch (e) {
    console.error(e);
  }
};

await loadProtos();

export default protoMessages;
