#!/bin/bash

# BlockAssist otomatik kurulum scripti

echo "[1/8] BlockAssist deposu klonlanıyor..."
git clone https://github.com/gensyn-ai/blockassist.git
 cd blockassist

echo "[2/8] Setup scripti çalıştırılıyor..."
./setup.sh

echo "[3/8] Pyenv kuruluyor..."
curl -fsSL https://pyenv.run | bash

echo " kalıcı hale getiriliyor..."
echo -e '\nexport PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo -e '[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo -e 'eval "$(pyenv init - bash)"' >> ~/.bashrc
echo -e 'eval "$(pyenv virtualenv-init -)"' >> ~/.bashrc
source ~/.bashrc

echo "[4/8] Python bağımlılıkları yükleniyor..."
sudo apt update
sudo apt install make build-essential libssl-dev zlib1g-dev libbz2-dev libreadline-dev libsqlite3-dev curl git libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev # Dependencies for Python installation
pyenv install 3.10
pip install psutil readchar
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"
wget https://developer.download.nvidia.com/compute/cudnn/9.11.0/local_installers/cudnn-local-repo-ubuntu2204-9.11.0_1.0-1_amd64.deb
sudo dpkg -i cudnn-local-repo-ubuntu2204-9.11.0_1.0-1_amd64.deb
sudo cp /var/cudnn-local-repo-ubuntu2204-9.11.0/cudnn-local-4EC753EA-keyring.gpg /usr/share/keyrings/
echo "deb [signed-by=/usr/share/keyrings/cudnn-local-4EC753EA-keyring.gpg] file:///var/cudnn-local-repo-ubuntu2204-9.11.0 /" | sudo tee /etc/apt/sources.list.d/cudnn-local.list
sudo apt update
sudo apt install libcudnn9 libcudnn9-dev
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc

echo "[7/8] BlockAssist başlatılıyor..."
sudo apt update
sudo apt install python3.12-venv -y
python3 -m venv venv
source venv/bin/activate
pip install readchar
pip install psutil
python run.py
