#!/bin/zsh

#Mark this file as executable before using extension.
#Requires paru and pacman-contrib package!
AUR=$(paru -Qua | wc -l)
OFFICIAL=$(checkupdates | wc -l)
FLATPAK=$(flatpak update | wc -l)
if [[ "$FLATPAK" = "2" ]]
then
    ((FLATPAK = 0))
else
    ((FLATPAK = FLATPAK - 5))
fi
ALL=$((OFFICIAL+FLATPAK+AUR))
echo  $ALL
#Requires free IcoMoon font for showing the pacman icon: https://icomoon.io/icons-icomoon.html#
