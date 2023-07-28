const decoratorValidator = (fn, schema, argsType) => {

    return async function (event) {
        console.log("Entrou no decorator    ")
        const data = JSON.parse(event[argsType]);

        const { error, value } = await schema.validate(
            //abortEarly = mostra todos os erros de uma vez
            data, { abortEarly: false }
        );
        event[argsType] = value;
        // arguments serve para pegar todos os argumentos que vieram na função
        // e mandá-los para frente.
        // Por exemplo, se vocé chamar a função diretamente o decorator, e o
        // valor do argumento é um array, o array será trasnferido para o primeiro
        // método da função.
        // o apply vai retornar a função que será executada.
        if (!error) return fn.apply(this, arguments);

        return {
            statusCode: 422, // unprocessable entity
            body: error.message
        }
    }
}

module.exports = decoratorValidator;
