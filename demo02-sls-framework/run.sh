#Install serverless framework
npm i -g serverless

# sls inicializar e criar projeto 
sls

# sempre fazer deploy antes de tudo para verificar se está com ambiente ok
sls deploy

# invocar na AWS
sls invoke -f hello

# invocar local
sls invoke local -f hello --log