#!/bin/bash

echo "[1/8] BlockAssist setup başlatılıyor..."

echo "[2/8] setup.sh çalıştırılıyor..."
chmod +x ./setup.sh
./setup.sh

echo "[3/8] pyenv kuruluyor..."
curl -fsSL https://pyenv.run | bash

# pyenv ortam değişkenlerini yükle
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

echo "[4/8] Python 3.10 kuruluyor..."
sudo apt update
sudo apt install -y make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev \
  libsqlite3-dev curl git libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev \
  libffi-dev liblzma-dev

pyenv install 3.10.14
pyenv global 3.10.14

echo "[5/8] pip, psutil ve readchar kuruluyor..."
pip install --upgrade pip
pip install psutil readchar

echo "[6/8] CUDNN indiriliyor ve kuruluyor..."
wget https://developer.download.nvidia.com/compute/cudnn/9.11.0/local_installers/cudnn-local-repo-ubuntu2204-9.11.0_1.0-1_amd64.deb
sudo dpkg -i cudnn-local-repo-ubuntu2204-9.11.0_1.0-1_amd64.deb
sudo cp /var/cudnn-local-repo-ubuntu2204-9.11.0/cudnn-local-4EC753EA-keyring.gpg /usr/share/keyrings/
echo "deb [signed-by=/usr/share/keyrings/cudnn-local-4EC753EA-keyring.gpg] file:///var/cudnn-local-repo-ubuntu2204-9.11.0 /" | sudo tee /etc/apt/sources.list.d/cudnn-local.list
sudo apt update
sudo apt install -y libcudnn9 libcudnn9-dev

# Cuda path export
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

echo "[7/8] run.py çalıştırma komutu hazırlanıyor..."

echo "[8/8] Kurulum tamamlandı. run.py'yi aşağıdaki komutla başlatabilirsin:"
echo ""
echo "python run.py"
echo ""
