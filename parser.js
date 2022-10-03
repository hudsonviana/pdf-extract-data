// Import dependencies
const fs = require('fs');
const PDFParser = require('pdf2json');

// Get all the filenames from the data folder
const files = fs.readdirSync('data');

// All of the parse data
let faturas = [];

// Make a IIFE so we can run asynchronous code
(async () => {
    await Promise.all(files.map(async (file) => {

        let pdfParser = new PDFParser(this, 1);
        pdfParser.loadPDF(`data/${file}`);
        
        let fatura = await new Promise(async (resolve, reject) => {

            pdfParser.on('pdfParser_dataReady', (pdfData) => {

                const raw = pdfParser.getRawTextContent().replace(/\r\n/g, ' ');
                // console.log(raw); // pegar aqui o texto completo do arquivo pdf

                // Return the parsed data
                resolve({
                    arquivoNome: file,
                    titular: /Titular(.*?)Cartão/i.exec(raw)[1].trim(),
                    cpf: /\s\s-\s\s(.*?)Valor\sdo\sDocumento/i.exec(raw)[1].trim(),
                    vencimento: /Vencimento:\s(.*?)=Total/i.exec(raw)[1].trim(),
                    valorTotal: /Valor\sdo\sDocumento(.*?)Nome\sdo\sBeneficiário/i.exec(raw)[1].trim(),
                });
            });
        });

        // Add the patient to the patients array
        faturas.push(fatura);
    }));

    // Save the extracted information to a json file
    fs.writeFileSync('faturas.json', JSON.stringify(faturas, null, 2));
    console.log(faturas);
})();

// Fonte: https://www.youtube.com/watch?v=b2dLDqmYT4I
