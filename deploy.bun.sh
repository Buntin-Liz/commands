rm -rf bin
cp -r ./template ./bin
deno run -A src/deploy.ts
