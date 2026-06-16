---
name: git-auth-repo-owner
description: Push auth for ProjetoAcademia origin — must authenticate as gustavoavexcom, not the cached valtairguarnieri credential
metadata:
  type: project
---

O remoto `origin` (https://github.com/gustavoavexcom/ProjetoAcademia.git, HTTPS) só aceita push autenticado como `gustavoavexcom` (dono do repo).

**Why:** O Git Credential Manager já teve em cache a credencial de `valtairguarnieri`, que NÃO tem permissão de escrita — push falhava com HTTP 403. Resolvido removendo a credencial (`git credential reject`) e reautenticando via janela do GCM como `gustavoavexcom`.

**How to apply:** Se um push futuro falhar com 403/permissão, suspeite de credencial errada em cache. Faça `git credential reject` para github.com e deixe o GCM reabrir o login como `gustavoavexcom`. Use timeout generoso no push (a janela do GCM pode aguardar input do usuário). Nunca contornar com force push ou outro workaround destrutivo.
