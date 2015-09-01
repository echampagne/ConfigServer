echo "==== Run ConfigServer ====="

echo "Launching MongoDB Server"
cd ~/ConfigServer/ConfigServer/logs/mongo_server/
screen -S mongo_server -d -m -L ../../runMongodb.sh
echo "DONE"

echo "Launching Node Server"
cd ~/ConfigServer/ConfigServer/logs/node_server/
screen -S node_server -d -m -L ../../runNodeServer.sh
echo "DONE"
screen -ls
