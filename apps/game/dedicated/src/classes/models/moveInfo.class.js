export class Position {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  updatePosition(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  updateClassPosition(position) {
    this.x = position.x;
    this.y = position.y;
    this.z = position.z;
  }

  getPosition() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }
}

export class Rotation {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  updateRotation(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  updateClassRotation(rotation) {
    this.x = rotation.x;
    this.y = rotation.y;
    this.z = rotation.z;
  }

  getRotation() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }
}
