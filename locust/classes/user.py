import random

class Position:
    """
    사용자 위치를 나타내는 클래스.
    x, y, z 좌표를 포함합니다.
    """
    def __init__(self, x=0.0, y=0.0, z=0.0):
        self.x = x
        self.y = y
        self.z = z

    def __repr__(self):
        return f"Position(x={self.x}, y={self.y}, z={self.z})"


class Rotation:
    """
    사용자 회전을 나타내는 클래스.
    x, y, z 회전값을 포함합니다.
    """
    def __init__(self, x=0.0, y=0.0, z=0.0):
        self.x = x
        self.y = y
        self.z = z

    def __repr__(self):
        return f"Rotation(x={self.x}, y={self.y}, z={self.z})"


class User:
    """
    Locust 사용자 객체를 관리하는 클래스.
    user_id, token과 함께 Position 및 Rotation을 멤버 변수로 포함합니다.
    """
    def __init__(self, user_id, user_index, group_id):
        self.user_id = user_id
        self.uuid = None
        self.token = None  # 로그인 후 설정될 토큰
        self.position = Position()
        self.rotation = Rotation()
        self.sequence = 1
        self.connectTry = False
        self.loginTry = False
        self.RoomTry = False
        self.is_in_room = False
        self.is_logged_in = False
        self.user_index = user_index
        self.group_id = group_id

    def set_token(self, token):
        """
        서버 로그인 응답에서 받은 토큰을 설정합니다.
        Args:
            token (str): 서버로부터 반환된 인증 토큰
        """
        self.token = token

    def set_uuid(self, uuid):
        """
        서버 로그인 응답에서 받은 토큰을 설정합니다.
        Args:
            token (str): 서버로부터 반환된 인증 토큰
        """
        self.uuid = uuid

    def update_position(self, x, y, z):
        """
        사용자 위치를 업데이트합니다.
        Args:
            x (float): x 좌표
            y (float): y 좌표
            z (float): z 좌표
        """
        self.position = Position(x, y, z)

    def update_rotation(self, x, y, z):
        """
        사용자 회전을 업데이트합니다.
        Args:
            x (float): x 회전
            y (float): y 회전
            z (float): z 회전
        """
        self.rotation = Rotation(x, y, z)

    def move(self, direction):
        """
        Move the user in the given direction and update the position.
        
        Args:
            direction (str): Direction to move ('up', 'down', 'left', 'right').
        """
        if direction == "up":  # +z
            self.position.z += 1
        elif direction == "down":  # -z
            self.position.z -= 1
        elif direction == "left":  # -x
            self.position.x -= 1
        elif direction == "right":  # +x
            self.position.x += 1
        # print(f"{self.user_id} moved {direction}. New position: {self.position}")

    def __repr__(self):
        return (f"User(id={self.id}, uuid={self.uuid}, token={self.token}, "
                f"position={self.position}, rotation={self.rotation})")

    def getSequence(self):
        sequence = self.sequence
        self.sequence += 1
        return sequence;