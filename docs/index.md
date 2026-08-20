---
layout: default
title: Hun ARM64 Mnemonic Dictionary
---

# **Hun ARM64 Mnemonic Dictionary**

AArch64 어셈블리 니모닉 217개를 정리한 사전입니다. 아래에서 이름으로 검색하거나, 알파벳으로 이동하세요.

<input type="text" id="mnemonic-search" placeholder="니모닉 검색 (예: ADC, LDR, WFE...)" data-src="{{ '/assets/mnemonics-search.json' | relative_url }}" autocomplete="off">
<div id="search-results"></div>

<script src="{{ '/assets/js/search.js' | relative_url }}" defer></script>

---

## 알파벳으로 찾아보기

{% include letter-nav.html %}

---

## 심화 주제

- [HVC — Hypervisor Call](html/hvc.html)
- [IC — Instruction Cache operation](html/ic.html)
- [INS — Insert (SIMD)](html/ins.html)

---

### Built by `BM. KIM BUM JUN`, with `클로드보살 (Claude, Anthropic)`, `제미니보살 (Gemini, Google)`
