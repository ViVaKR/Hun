---
layout: default
title: "C - Hun ARM64 Mnemonic Dictionary"
permalink: /mnemonics/c/
---

# C

[← 전체 목차로 돌아가기]({{ '/' | relative_url }})

{% include letter-nav.html %}

---

{% assign items = site.data.mnemonics | where: "letter", "C" %}
{% for m in items %}
  {% include mnemonic-entry.html m=m %}
{% endfor %}
