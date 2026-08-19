---
layout: default
title: "S - Hun ARM64 Mnemonic Dictionary"
permalink: /mnemonics/s/
---

# S

[← 전체 목차로 돌아가기]({{ '/' | relative_url }})

{% include letter-nav.html %}

---

{% assign items = site.data.mnemonics | where: "letter", "S" %}
{% for m in items %}
  {% include mnemonic-entry.html m=m %}
{% endfor %}
