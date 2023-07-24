#1 Criar o arquivo de segurança
#2 Criar a role de segurança na AWS

aws iam create-role  --role-name lambda-exemplo  --assume-role-policy-document file://politica.json | tee logs/role.log

#3 Criar o arquivo com conteúdo para ser zipado (No PowerShell)
 
 Compress-Archive -Path .\index.js  -DestinationPath .\function.zip  -Update 

#4 Criar a Lambda Function
aws lambda create-function \
    --function-name hello-cli \
    --zip-file fileb://function.zip \
    --handler index.handler \
    --runtime nodejs14.x \
    --role arn:aws:iam::582157045911:role/lambda-exemplo \
    | tee logs/lambda-create.log

#5 Invoke Lambda Function
aws lambda invoke \
    --function-name hello-cli \
    --log-type Tail \
    logs/lambda-exec-update.log

#6 Atualizar a Lambda Function (Após ter alterado novamente o index.js)
aws lambda update-function-code \
    --zip-file fileb://function.zip \
    --function-name hello-cli \
    --publish \
    | tee logs/lambda-update.log

#7 Remover a Lambda Function
aws lambda delete-function \
    --function-name hello-cli

#8 Remover a role de segurança
aws iam delete-role \
    --role-name lambda-exemplo

