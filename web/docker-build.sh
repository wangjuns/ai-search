# 将.env文件转化为 --build-arg 参数
args=$(cat .env | grep -v '^#' | sed -e 's/=\(.*\)/="\1"/' | xargs -I {} echo --build-arg {})
echo $args

# 使用这些参数构建镜像
docker build $args -t manasalu/ai-search:latest .