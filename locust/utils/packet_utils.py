import struct
from proto.generated import client_pb2
from google.protobuf.json_format import MessageToDict

def create_login_request(user):
    """C2S_LoginRequest 메시지 생성"""
    login_request = client_pb2.C2S_LoginRequest()
    login_request.id = user.user_id
    login_request.password = "1234"
    return login_request

def create_create_room_request(user):
    """C2S_LoginRequest 메시지 생성"""
    create_room_request = client_pb2.C2S_CreateRoomRequest()
    create_room_request.userId = user.uuid
    create_room_request.token = user.token
    return create_room_request

def create_join_room_request(user, invite_code):
    """C2S_LoginRequest 메시지 생성"""
    join_room_request = client_pb2.C2S_JoinRoomRequest()
    join_room_request.userId = user.uuid
    join_room_request.inviteCode = invite_code
    join_room_request.token = user.token
    return join_room_request

def create_ping_response(timestamp):
    """C2S_LoginRequest 메시지 생성"""
    ping_response = client_pb2.C2S_PingResponse()
    ping_response.timestamp = timestamp
    return ping_response

def create_player_move_request(user):
    """
    Create a PlayerMoveRequest packet with the user's current position.
    
    Args:
        user (User): Locust User instance.
    
    Returns:
        game_packet_pb2.C2S_PlayerMoveRequest: Serialized PlayerMoveRequest packet.
    """
    move_request = client_pb2.C2S_PlayerMoveRequest()
    move_request.playerMoveInfo.userId = user.uuid
    move_request.playerMoveInfo.position.x = user.position.x
    move_request.playerMoveInfo.position.y = user.position.y
    move_request.playerMoveInfo.position.z = user.position.z
    move_request.playerMoveInfo.rotation.x = user.rotation.x
    move_request.playerMoveInfo.rotation.y = user.rotation.y
    move_request.playerMoveInfo.rotation.z = user.rotation.z
    return move_request

def create_packet(packet_type, user, message):
    """헤더와 Protobuf 페이로드를 결합하여 패킷 생성"""

    game_packet = client_pb2.GamePacket()
    if packet_type == 502:  # LoginRequest
        game_packet.loginRequest.CopyFrom(message)
    elif packet_type == 601:  # CreateRoomRequest
        game_packet.createRoomRequest.CopyFrom(message)
    elif packet_type == 603:  # JoinRoomRequest
        game_packet.joinRoomRequest.CopyFrom(message)
    elif packet_type == 1:  # PlayerMoveRequest
        game_packet.playerMoveRequest.CopyFrom(message)
    elif packet_type == 6:  # PlayerMoveRequest
        game_packet.pingResponse.CopyFrom(message)    
    else:
        raise ValueError(f"Unsupported packet type: {packet_type}")

    serialized_payload = game_packet.SerializeToString()

    version = "1.0.0"
    version_length = len(version)
    payload_length = len(serialized_payload)

    header = struct.pack(
        f"!H B {version_length}s I I",
        packet_type,
        version_length,
        version.encode(),
        user.getSequence(),
        payload_length
    )

    return header + serialized_payload

def parse_response(response_data):
    """
    수신된 TCP 응답 데이터를 파싱하여 Protobuf 메시지를 디코딩합니다.

    Args:
        response_data (bytes): 서버에서 수신한 원시 데이터.

    Returns:
        dict: 헤더 정보와 디코딩된 Protobuf 메시지.
    """
    # 헤더 크기 정의
    header_format = "!H B 5s I I"  # packetType(2) + versionLength(1) + version(5) + sequence(4) + payloadLength(4)
    header_size = struct.calcsize(header_format)

    # 헤더 파싱
    header_data = response_data[:header_size]
    packet_type, version_length, version, sequence, payload_length = struct.unpack(header_format, header_data)

    # print(f"Packet Type: {packet_type}")
    # print(f"Version: {version.decode()}")
    # print(f"Sequence: {sequence}")
    # print(f"Payload Length: {payload_length}")

    # 페이로드 추출
    payload_data = response_data[header_size:header_size + payload_length]

    # Protobuf 디코딩
    try:
        game_packet = client_pb2.GamePacket()
        game_packet.ParseFromString(payload_data)

        if packet_type == 503:  # LoginResponse
            payload = game_packet.loginResponse
        elif packet_type == 602:  # CreateRoomResponse
            payload = game_packet.createRoomResponse
        elif packet_type == 605:  # JoinRoomResponse
            payload = game_packet.joinRoomResponse
        elif packet_type == 606:  # JoinRoomResponse
            payload = game_packet.joinRoomNotification
        elif packet_type == 2:  # PlayerMoveNotification
            payload = game_packet.playerMoveNotification
        elif packet_type == 5:  # PingRequest
            payload = game_packet.pingRequest
        else:
            raise ValueError(f"Unsupported packet type: {packet_type}")

        payload_dict = MessageToDict(payload)

        return {
            "header": {
                "packetType": packet_type,
                "version": version.decode(),
                "sequence": sequence,
                "payloadLength": payload_length,
            },
            "payload": payload_dict,
        }
    except Exception as e:
        print(f"Error decoding Protobuf payload: {e}")
        return None
