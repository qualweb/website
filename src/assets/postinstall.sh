# !/bin/bash
echo '-----'
echo 'Fixing html-formatter, because __dirname is not defined'
echo '-----'
alias formatterFolder="cd ./node_modules/html-formatter/src"
formatterFolder
sed -i "s/__dirname + '/'./g" render.js
echo 'Done!'
