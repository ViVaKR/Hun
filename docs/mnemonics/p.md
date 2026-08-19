---
layout: default
title: "P - Hun ARM64 Mnemonic Dictionary"
permalink: /mnemonics/p/
---

# P

[← 전체 목차로 돌아가기]({{ '/' | relative_url }})

{% include letter-nav.html %}

---

{% assign items = site.data.mnemonics | where: "letter", "P" %}
{% for m in items %}
  {% include mnemonic-entry.html m=m %}
{% endfor %}
