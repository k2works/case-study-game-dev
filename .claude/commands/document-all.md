name: docs-all
description: "すべてのドキュメントを更新実行"
prompt: |
  以下のタスクを実行してください：
  @docs/requirements/リリース計画.md 更新;
  @docs/requirements/リリース計画.md ガントチャート更新;
  @docs/requirements/index.md 更新;
  @docs/design/index.md 更新;
  @docs/development/index.md 更新;
  @docs/operation/index.md 更新;
  @docs/adr/index.md 更新;
  @docs/index.md 更新;
  mkdocs.yml 更新;
  
  エラーがあれば、修正方法も提案してください。
tags:
  - document
shortcuts:
  - "doc"