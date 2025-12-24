# penny-app

pnpm install # install all workspaces
pnpm -r run build # run build in all packages

pnpm --filter schemas run build
pnpm --filter penny-app-ui run build
pnpm --filter penny-app-server run build
