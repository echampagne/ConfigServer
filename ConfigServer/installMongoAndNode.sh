cd ~/
curl -O https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.0.4.tgz
tar -zxvf mongodb-linux-x86_64-3.0.4.tgz
cd ~/ConfigServer/ConfigServer
mkdir -p mongodb
cp -R -n ../../mongodb-linux-x86_64-3.0.4/ mongodb
export PATH=~/ConfigServer/ConfigServer/mongodb/mongodb-linux-x86_64-3.0.4/bin:$PATH

echo 'export PATH=$HOME/ConfigServer/ConfigServer/node-latest-install/:$PATH' >> ~/.bash_profile
. ~/.bash_profile
mkdir ~/ConfigServer/ConfigServer/node-latest-install
cd ~/ConfigServer/ConfigServer/node-latest-install
curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
./configure --prefix=~/local
make install
curl https://www.npmjs.com/install.sh | sh
