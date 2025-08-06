# Blockassist
#!/bin/bash

# 1. BlockAssist repo klonla
git clone https://github.com/gensyn-ai/blockassist.git
cd blockassist

# 2. setup.sh çalıştır
./setup.sh

# 3. pyenv kurulum
curl -fsSL https://pyenv.run | bash

# 4. Python bağımlılıklarını yükle
sudo apt update
sudo apt install -y make build-essential libssl-dev zlib1g-dev libbz2-dev \
libreadline-dev libsqlite3-dev curl git libncursesw5-dev xz-utils tk-dev \
libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

# 5. shell ayarlarını güncelle
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init -)"
eval "$(pyenv virtualenv-init -)"

# 6. Python 3.10 kurulumu
pyenv install 3.10
pyenv global 3.10

# 7. pip modüllerini yükle
pip install psutil readchar

# 8. Projeyi başlat
python run.py
