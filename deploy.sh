ssh root@67.205.141.247 <<EOF
  cd ~/climbing-grade
  git pull
  npm install --production
  forever restartall
  exit
EOF
