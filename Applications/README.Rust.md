# Rust With Assembly

### Cargo Test

```bash

cargo test -p hun_test_runner -- --nocapture
# - 원래 cargo test는 성공한 테스트의 출력(stdout)은 굳이 보여주지 않고 뒤로 숨겨두는 게 기본 설정
# - 오직 실패한 테스트의 피눈물 섞인 출력만 콘솔에 띄워줌.

# - 성공했더라도 기어코 저 주소값 출력을 보고야 말겠다면,
# - 아래와 같이 --nocapture 옵션을 뒤에 붙여서 격발!

# - 주의: 중간에 꼭 -- (더블 대시)를 넣고 한 칸 띈 다음 **--nocapture**를 적어줘야 함!
# - 앞의 --는 "여기서부터는 cargo 옵션이 아니라,
# - 실제 테스트 실행 바이너리에게 전달할 옵션이다!"라고 선언하는 표식.

```