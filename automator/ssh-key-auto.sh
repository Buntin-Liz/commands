for f in "$@"; do
  if [[ "$f" == *.pem ]]; then
    mv "$f" ~/ssh/keys/
    chmod 700 ~/ssh/keys/*.pem
  else
    :
  fi
done
