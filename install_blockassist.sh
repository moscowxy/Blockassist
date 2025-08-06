#!/bin/bash

# BlockAssist otomatik kurulum scripti

echo "[1/8] BlockAssist deposu klonlanıyor..."
git clone https://github.com/gensyn-ai/blockassist.git
cd blockassist || exit 1

echo "[2/8] Setup scripti çalıştırılıyor..."
./setup.sh

echo "[3/8] Pyenv kuruluyor..."
curl -fsSL https://pyenv.run | bash

echo "[4/8] Python bağımlılıkları yükleniyor..."
sudo apt update
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
  libbz2-dev libreadline-dev libsqlite3-dev curl git \
  libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
  libffi-dev liblzma-dev

export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

echo "[5/8] Python 3.10 kuruluyor..."
pyenv install 3.10
pyenv global 3.10

echo "[6/8] Psutil ve Readchar kuruluyor..."
pip install --upgrade pip
pip install psutil readchar

echo "[7/8] BlockAssist başlatılıyor..."
python run.py
