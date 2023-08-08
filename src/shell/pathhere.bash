#!/bin/bash

current_dir=$(pwd)

# if .bashrc,.zshrc exists 
bashrc_exists=false
zshrc_exists=false
[ -f "$HOME/.bashrc" ] && bashrc_exists=true
[ -f "$HOME/.zshrc" ] && zshrc_exists=true


if [ "$bashrc_exists" = true ] && [ "$zshrc_exists" = true ]; then
  echo "どちらのシェルにパスを追加しますか？"
  echo "1) bash"
  echo "2) zsh"
  read -p "選択してください (1/2): " choice
  case "$choice" in
    2)
      config_file="$HOME/.zshrc"
      ;;
    *)
      config_file="$HOME/.bashrc"
      ;;
  esac
elif [ "$bashrc_exists" = true ]; then
  config_file="$HOME/.bashrc"
elif [ "$zshrc_exists" = true ]; then
  config_file="$HOME/.zshrc"
else
  echo "エラー: .bashrcまたは.zshrcが見つかりませんでした。"
  exit 1
fi


echo "export PATH=\$PATH:$current_dir" >> $config_file


echo "$current_dir が $config_file に追加されました。"


echo "変更を反映させるには、シェルを再読み込みしてください。"
