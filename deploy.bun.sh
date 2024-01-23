rm -rf bin
cp -r ./archive/template ./bin
deno run -A src/deploy.ts
