# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=1000
SAVEHIST=1000
setopt beep
bindkey -e
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/speltriao/.zshrc'
setopt auto_cd
autoload -Uz compinit
compinit
# End of lines added by compinstall
PROMPT='%B%F{2}%n%f%b %F{6}%(4~|.../%3~|%~)%f> '
bindkey "^[[1;5C" forward-word
bindkey "^[[1;5D" backward-word
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
alias vim=nvim
alias crypto="curl rate.sx"
alias weather="curl wttr.in"
