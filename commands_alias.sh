
# sshls
# https://github.com/badcompany-tokyo/sshls
alias sshls='deno run -RE https://raw.githubusercontent.com/badcompany-tokyo/sshls/refs/heads/main/src/main.ts'

# tree
alias tree='tree -a -I "\.DS_Store|\.git|node_modules|vendor\/bundle" -N'

# rmdsstore
# remove all .DS_Store files. 
alias rmdsstore='find . -name ".DS_Store" -exec rm -rf {} \;';
