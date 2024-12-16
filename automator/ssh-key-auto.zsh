for f in "$@"
do
  if [[ "$f" == *.pem ]]
  then
    mv "$f" ~/ssh/keys/
    chmod 600 ~/ssh/keys/*.pem
  else
  fi
done
