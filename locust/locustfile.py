import random
import time
from locust import User as LocustUser, TaskSet, task, between
from classes.user import User
from utils.packet_utils import (
    create_login_request,
    create_create_room_request,
    create_join_room_request,
    create_player_move_request,
    create_ping_response,
    parse_response,
    create_packet
)
import socket
import threading
import queue
import struct

# protoc로 client.protoc 빌드
# 명령어 : protoc --python_out=./proto/generated --proto_path=. client.proto

# 실행 방법
# 명령어 : locust -f locustfile.py

global_user_index = 0  # 전역 사용자 인덱스

class TCPClient:
    """TCP 통신을 위한 클라이언트 클래스"""
    HEADER_FORMAT = "!H B 5s I I"  # packetType(2) + versionLength(1) + version(5) + sequence(4) + payloadLength(4)
    HEADER_SIZE = struct.calcsize(HEADER_FORMAT)

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.client = None
        self.receive_thread = None
        self.running = False
        self.response_queue = queue.Queue()     # 응답 데이터를 저장하는 큐
        self.buffer = b""   # 수신 데이터 버퍼

    def connect(self):
        """TCP 소켓 연결"""
        self.client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.client.connect((self.host, self.port))
        self.running = True

        self.receive_thread = threading.Thread(target=self.receive_loop, daemon=True)
        self.receive_thread.start()

    def send(self, data):
        """데이터 전송"""
        self.client.sendall(data)

    def receive_loop(self):
        """응답 수신"""
        while self.running:
            try:
                data = self.client.recv(1024)
                if data:
                    self.buffer += data
                    self.process_buffer()
                else:
                    break  # 연결 종료
            except Exception as e:
                print(f"Error in receive loop: {e}")
                break

    def process_buffer(self):
        """버퍼에서 패킷을 분리하여 처리"""
        while len(self.buffer) >= self.HEADER_SIZE:
            # 헤더 추출
            header_data = self.buffer[:self.HEADER_SIZE]
            try:
                packet_type, version_length, version, sequence, payload_length = struct.unpack(
                    self.HEADER_FORMAT, header_data
                )
            except struct.error:
                print("Error unpacking header")
                break

            total_packet_size = self.HEADER_SIZE + payload_length
            if len(self.buffer) < total_packet_size:
                # 버퍼에 전체 패킷이 도착하지 않았으면 대기
                break

            # 완전한 패킷 추출
            packet_data = self.buffer[:total_packet_size]
            self.buffer = self.buffer[total_packet_size:]  # 처리된 패킷 제거

            # 패킷 데이터를 큐에 추가
            self.response_queue.put(packet_data)

    def stop(self):
        """TCP 클라이언트 종료"""
        self.running = False
        if self.receive_thread:
            self.receive_thread.join()
        if self.client:
            self.client.close()

    def get_response(self):
        """큐에서 응답 데이터를 가져옴"""
        try:
            return self.response_queue.get_nowait()  # 큐에서 비동기적으로 데이터 가져오기
        except queue.Empty:
            return None
        


class GameServerTasks(TaskSet):
    invite_codes = {}  # 그룹별 초대 코드를 저장하는 딕셔너리
    room_created = set()  # 이미 방을 생성한 그룹을 저장

    def process_responses(self):
        """서버 응답 처리"""
        while True:
            if not self.tcp_client.response_queue.empty():
                # 큐에서 응답 데이터를 가져옴
                response = self.tcp_client.get_response()
                if response:
                    self.handle_response(response)
            else:
                # 큐가 비어있으면 최소한의 대기
                time.sleep(0.01)

    def handle_response(self, response_data):
        """수신한 서버 응답을 처리"""
        parsed = parse_response(response_data)  # 응답 파싱

        if not parsed:
            print("Failed to parse response")
            return

        packet_type = parsed["header"]["packetType"]
        payload = parsed["payload"]

        if packet_type == 503:  # LoginResponse
            if payload.get("userId") and payload.get("token"):
                print(f"[{self.user_instance.user_index}] {self.user_instance.user_id} logged Complete")
                self.user_instance.set_uuid(payload["userId"])  # userId 설정
                self.user_instance.set_token(payload["token"])  # token 설정
                self.user_instance.is_logged_in = True
            else:
                print(f"{self.user_instance.user_id} failed to log in: {payload}")
                self.interrupt()

        elif packet_type == 602:  # CreateRoomResponse
            if payload.get("inviteCode"):
                group_id = self.user_instance.group_id
                GameServerTasks.invite_codes[group_id] = payload["inviteCode"]
                GameServerTasks.room_created.add(group_id)
                print(f"[{self.user_instance.user_index}] {self.user_instance.user_id} created Complete")
                self.user_instance.is_in_room = True
            else:
                print(f"{self.user_instance.user_id} failed to create room: {payload}")
                self.interrupt()

        elif packet_type == 605:  # JoinRoomResponse
            if payload.get("gameSessionId"):
                group_id = self.user_instance.group_id
                print(f"[{self.user_instance.user_index}] {self.user_instance.user_id} joinResponse Complete")
                self.user_instance.is_in_room = True
            else:
                print(f"{self.user_instance.user_id} failed to join room: {payload}")
                self.interrupt()

        elif packet_type == 606:
            print(f"[{self.user_instance.user_index}] {self.user_instance.user_id} joinNotification Complete")
            
        elif packet_type == 2:  # PlayerMoveNotification
            temp = 1
        #     print(f"[${self.user_instance.user_index}] {self.user_instance.user_id} playerMoveNotification")

        elif packet_type == 5:  # PingRequest
            # print(f"[${self.user_instance.user_index}] {self.user_instance.user_id} pingRequest")
            timestamp = int(parsed["payload"]["timestamp"])
            ping_packet = create_ping_response(timestamp)
            packet = create_packet(6, self.user_instance, ping_packet)
            self.tcp_client.send(packet)

        else:
            print(f"Unhandled packet type: {packet_type}")

    def on_start(self):
        """사용자 시작 시 초기 설정"""
        self.tcp_client = TCPClient("54.180.137.103", 6000)
        self.tcp_client.connect()
        self.user_instance = self._get_user()

        # 응답 처리 스레드 시작
        self.response_thread = threading.Thread(target=self.process_responses, daemon=True)
        self.response_thread.start()
        
        self.connect()

    @task
    def execute_steps(self):
        """각 작업을 순서대로 실행"""
        if not self.user_instance.is_logged_in:
            self.login()
        elif not self.user_instance.is_in_room:
            self.create_or_join_room()
        else:
            self.move()

    def login(self):
        """로그인 요청 수행"""
        if self.user_instance.loginTry:
            return
        
        print(f"[{self.user_instance.user_index}] {self.user_instance.user_id} is logging in...")
        login_packet = create_login_request(self.user_instance)
        packet = create_packet(502, self.user_instance, login_packet)
        self.tcp_client.send(packet)
        self.user_instance.loginTry = True

    def create_or_join_room(self):
        """방 생성 또는 방 참가 수행"""
        if self.user_instance.RoomTry:
            return
        
        group_id = self.user_instance.group_id

        if self.user_instance.user_id.endswith("1") and group_id not in GameServerTasks.room_created:
            # Host 역할: 방 생성
            print(f"[{self.user_instance.user_index}] {self.user_instance.user_id} is creating a room...")
            create_room_packet = create_create_room_request(self.user_instance)
            packet = create_packet(601, self.user_instance, create_room_packet)
            self.tcp_client.send(packet)
            self.user_instance.RoomTry = True
        else:
            # 참가자 역할: 방 참가
            if group_id in GameServerTasks.invite_codes:
                print(f"[{self.user_instance.user_index}] {self.user_instance.user_id} is joining a room...")
                invite_code = GameServerTasks.invite_codes[group_id]
                join_room_packet = create_join_room_request(self.user_instance, invite_code)
                packet = create_packet(603, self.user_instance, join_room_packet)
                self.tcp_client.send(packet)
                self.user_instance.RoomTry = True

    def move(self):
        """
        방 입장 후 이동 작업 수행 (무한 루프)
        """
        # print(f"[${self.user_instance.user_index}] {self.user_instance.user_id} started moving in the room.")
        if not self.user_instance.is_in_room:
            return
        # 이동 방향 선택
        direction = random.choice(["up", "down", "left", "right"])
        self.user_instance.move(direction)

        # 이동 패킷 생성
        move_packet = create_player_move_request(self.user_instance)
        packet = create_packet(1, self.user_instance, move_packet)
        self.tcp_client.send(packet)

    def connect(self):
        self.user_instance.connectTry = True

    def _get_group_id(self, user_index):
        """
        사용자 인덱스를 기반으로 그룹 ID 반환.
        첫 4명은 그룹 1, 다음 4명은 그룹 2, ...
        """
        return (user_index // 4) + 1  # 그룹 ID는 1부터 시작

    def _get_user(self):
        """
        사용자 ID를 순차적으로 설정하여 User 객체를 반환합니다.
        """
        global global_user_index
        group_size = 4
        user_id = f"test{(global_user_index % group_size) + 1}"  # ID: test1, test2, test3, test4
        user_index = global_user_index  # 전역 사용자 인덱스
        group_id = self._get_group_id(user_index)
        user = User(user_id, user_index, group_id)
        global_user_index += 1
        return user




class GameServerUser(LocustUser):
    tasks = [GameServerTasks]
    wait_time = between(1, 3)
