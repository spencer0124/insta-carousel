# 📸 인스타 사진 이어붙이기

> **여러 장의 사진을 하나로 이어서 쓱 넘기는 인스타그램 긴 게시물을 만드는 웹 도구입니다.**  
> 사진을 자유롭게 배치하고 1080px 단위로 자동 분할합니다.

🔗 **Live Demo:** [tools.seungyongcho.com/ig-seamless-carousel](https://tools.seungyongcho.com/ig-seamless-carousel/)  
🔗 **GitHub:** [github.com/spencer0124/insta-carousel](https://github.com/spencer0124/insta-carousel)

---

## ✨ Features

- **직관적인 편집**: 드래그 & 드롭으로 사진을 자유롭게 배치
- **갤러리 트레이**: 업로드한 사진을 하단 트레이에서 관리
- **동적 캔버스**: 슬라이드 추가 버튼으로 게시물 수 조절 가능
- **원클릭 네비게이션**: < > 버튼으로 슬라이드 단위 이동
- **4:5 비율 고정**: 인스타그램 최적 비율로 자동 설정
- **ZIP 다운로드**: 모든 조각을 한 번에 저장
- **Toss UI Design**: 깔끔하고 직관적한 인터페이스
- **Privacy First**: 서버 업로드 없이 브라우저에서 즉시 처리

---

## 🛠️ Development

이 프로젝트는 **[web-tools-common-assets](https://github.com/spencer0124/web-tools-common-assets)** 를 공유 리소스로 사용합니다.

### 1. Clone & Setup
```bash
# 프로젝트 구조
/Users/zoyoong/project/
├── ig-seamless-carousel/     # 이 프로젝트
└── web-tools-common-assets/  # 공통 에셋

cd /Users/zoyoong/project/ig-seamless-carousel
```

### 2. Run Locally
```bash
# 프로젝트 루트에서 서버 실행
cd /Users/zoyoong/project
python3 -m http.server 8000

# 접속
http://localhost:8000/ig-seamless-carousel/
```

---

## 🎨 Tech Stack

- **Fabric.js**: 캔버스 편집 및 이미지 조작
- **JSZip**: 파일 압축 및 다운로드
- **Toss UI**: 공통 디자인 시스템
- **Vanilla JS**: 프레임워크 없는 순수 JavaScript

---

## 🔗 Related Projects

다른 인스타그램 도구도 확인해보세요:

- **[IG 9-Cut](https://github.com/spencer0124/insta-grid-splitter)**: 사진을 3×3 그리드로 분할하는 도구
- **[Web Tools Common Assets](https://github.com/spencer0124/web-tools-common-assets)**: 공통 UI 컴포넌트

---

## 🤝 Contributing

버그 제보나 기능 제안은 Issue를 통해 남겨주세요!
