# Button Studio SaaS

SaaS web profissional para geração e personalização de botton 3D com upload de logo PNG, preview em rotação automática, exportação GIF e histórico completo de versões.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Three Fiber + Three.js + Drei
- Supabase Auth, Database e Storage
- Zustand para estado do editor

## Fluxo principal

1. Login/Signup com Supabase Auth.
2. Criar projeto no dashboard.
3. Abrir editor 3D e enviar logo PNG.
4. Ajustar parâmetros visuais no painel lateral.
5. Salvar versões de projeto.
6. Exportar GIF + thumbnail PNG.
7. Salvar exportações e assets no Supabase Storage.
8. Reabrir versões no histórico.

## Setup local

1. Instale dependências:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_PUBLIC_MODE=true
```

Com `VITE_PUBLIC_MODE=true`, o app fica aberto sem exigir login e usa persistência local no navegador quando não houver sessão autenticada.

3. Execute o schema SQL em `supabase/schema.sql`.

4. Rode o app:

```bash
npm run dev
```

## Estrutura

- `src/pages`: Dashboard, Projetos, Editor 3D, Histórico e Auth.
- `src/components/editor`: Viewer 3D, painel de controles e exportação.
- `src/services`: Persistência de projetos, storage e export GIF.
- `src/store`: estado central do editor.
- `supabase/schema.sql`: tabelas, índices, RLS e políticas de storage.

## Modelo GLB/GLTF

Coloque seu modelo em:

- `public/models/button.glb`

Se o arquivo não existir, o sistema usa um fallback procedural para não quebrar o editor.
