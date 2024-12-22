# Dream Catcher Server

- Dream Catcher는 Lethal Company를 모작한 코미디, 협동, 호러 장르의 게임입니다.
- 현 레포지토리는 Dream Catcher 소스코드 서버 부분입니다.

## 프로젝트 목적

- 실시간 멀티플레이:

  - 안정적이고 신뢰성 있는 실시간 데이터 전송

- 클라이언트와 협업:

  - 향후 효율적이고 원활한 의사소통 능력을 위한 역량 향상

- 분산 서버:

  - 확장성, 독립성을 위해 분산 서버를 구축

- 동시성 제어:
  - 동시 다발적인 이벤트에 대한 순서 제어

## 아키텍처
![단락 텍스트 (5)](https://github.com/user-attachments/assets/62fc35c9-94e8-4213-acdb-de98ad2fdbac)


## 주요 기능

- 멀티플레이:

  - TCP프로토콜 기반 서버로 클라이언트간 연결 유지

- 플레이어 동기화

  - 게임 세션내 각 유저의 상태를 실시간 동기화

- 게임 세션 관리

  - 게임의 세션별 상태 관리

- 데이터베이스 연동

  - 사용자 정보 저장

- MSA(분산서버):
  - 기능별로 서버를 분산, 관리리

## 기술 스택

<img src="https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white"><img src="https://img.shields.io/badge/node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white">
<img src="https://img.shields.io/badge/amazon ec2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white">
<img src="https://img.shields.io/badge/amazon rds-527FFF?style=for-the-badge&logo=amazonrds&logoColor=white">
<img src="https://img.shields.io/badge/redis-FF4438?style=for-the-badge&logo=redis&logoColor=white">
<img src="https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
<img src="https://img.shields.io/badge/esbuild-FFCF00?style=for-the-badge&logo=esbuild&logoColor=white">
<img src="https://img.shields.io/badge/jira-0052CC?style=for-the-badge&logo=jira&logoColor=white">
<img src="https://img.shields.io/badge/confluence-172B4D?style=for-the-badge&logo=confluence&logoColor=white">
<img src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white">
<img src="https://img.shields.io/badge/locust-41AD48?style=for-the-badge&logo=locust&logoColor=white">
<img src="https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
<img src="https://img.shields.io/badge/grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white">
<img src="https://img.shields.io/badge/prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white">
<img src="https://img.shields.io/badge/turborepo-%23EF4444?style=for-the-badge&logo=turborepo&logoColor=white">

## 게임 다운로드(링크)
[나중에 들어갈 링크]()

## 기술적 의사 결정

- Redis:

  - 빠른 데이터 처리, 설치 및 사용법이 간단

- Pub/Sub:

  - 세션 관리 서비스를 독립적으로 운영하며, 중앙 관리 체제로 전환한 결과, 세션 서비스 요청 및 응답에 따른 비즈니스 로직 처리가 필요
  - 추가 기술 도입 없이 기존에 사용하고 있는 Redis의 내장 기능 만으로 메시지 큐를 구성

- BullQueue:

  - 중복 이벤트 방지 및 이미 사용중인 Redis인프라와 통합하여 일관성 유지
  - 향후 DB작업과 같은 게임과 직접 연관되지 않은 기능들을 BullQueue를 통해 백그라운드에서서 처리 가능

- MSA:

  - 분산서버 기술에 대한 학습목적
  - 독립적인 서비스 관리와 트렌디한 기술이라는 점에서 매력적으로 느껴졌고, 이를 통해 새로운 기술적 도전을 하고자 선택
  - 단, 구현난이도가 어려워 장애 대응에 애를먹었고, 현 프로젝트 규모에 비해 과한 기술임은 분명

- Turborepo&esbuild

  - 동일한 로직임에도 여러 서버에서 관리하다 보니 코드가 불필요하게 커지고 유지보수가 어려움
  - 중복 코드를 줄이고 효율성을 높여줌

- Prometheus&Grafana
  - CPU 사용률, 메모리 사용량 등 분산 서버가 사용 중인 주요 리소스들을
    실시간으로 측정하여 과도한 자원 소비를 조기에 식별할 필요성을 느낌낌
  - 리소스 사용량을 직관적으로 시각화 할 수 있음

## 트러블 슈팅

- [레이턴시 문제](https://www.notion.so/teamsparta/a5e72d7b300e4dc4bf71e2a8024ab4b1)
- [동시성 제어](https://www.notion.so/teamsparta/5181c13676ac4d29bed18cd8d6388998)
- [레이스컨디션](https://www.notion.so/teamsparta/00e3e64c088d4f59bad132a005d46bae)
- [Docker 컨테이너너간의 서비스 연결 문제](https://www.notion.so/teamsparta/docker-ba3403ab6ea541368b40f5d811f4e4a5)
- [Docker 내부에서 컨테이너 생성](https://www.notion.so/teamsparta/docker-3a997ceaec4942318a2791704ee8349e)

## 팀원

|  이름  |        email         |            github            |
| :----: | :------------------: | :--------------------------: |
| 권영현 |   ehe151@gmail.com   |  https://github.com/DudeKYH  |
| 윤수빈 | soonode951@gmail.com | https://github.com/soonode97 |
| 문진수 | answlstn13@gmail.com |  https://github.com/Moonb7   |
| 장재영 | wkddj1541@gmail.com  | https://github.com/purebver  |

## 자세한 내용은 아래를 참고해주세요

Dream Catcher(Notion): https://www.notion.so/teamsparta/Dream-Catcher-4c17e8eef52b406b848546e2206435d4
