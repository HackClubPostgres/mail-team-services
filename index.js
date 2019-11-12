const FormData = require('form-data')
const express = require('express')
const pdflib = require('pdf-lib')
const atob = require('atob')
const btoa = require('btoa')

const app = express()

app.use(express.json())

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on port 3000");
});

app.post('/bounce', function (req, res) {
    console.log('oh boy oh boy here comes a request!!')

    try {
        const {
            fileData,
            fileType,
            fileName,
            message,
            thread,
            token,
            channel
        } = req.body

        console.log('hmmm, lots of stuff to unpack here...')

        var buffer = Buffer.from(fileData, 'base64')
        var form = new FormData()

        console.log('ok i made a buffer and a form')

        form.append('token', token)
        form.append('thread_ts', thread)
        form.append('channels', channel)
        form.append('filename', fileName)
        form.append('filetype', fileType)
        form.append('initial_comment', message)
        form.append('file', buffer, {
            filename: fileName+'.'+fileType
        })

        console.log('yay everything is appended to the form! redy to send :))')
        
        form.submit('https://slack.com/api/files.upload', function(err, response) {
            if (err) {
                console.log('i submitted but i got error :(')
                console.log(err)
                res.send(err)
            }
            else {
                console.log('i submitted and it is good so happy!!!!!')
                // console.log(response)
                res.send({
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage,
                    message: response.message,
                    file: response.file,
                })
            }
        })
    }
    catch (err) {
        console.log('ummmmm something bad hapend :(((')
        console.log(err)
        res.send(err)
    }
})

app.post('/shipping-label', async function (req, res) {
    console.log('oh boy oh boy here comes a request to prepare a shipping label!!')

    try {
        const {
            scenarioName,
            missionNote,
            fileData,
            fileName,
            message,
            thread,
            token,
            channel
        } = req.body

        console.log(`hmmm, lots of stuff to unpack here for this ${scenarioName} shipment...`)

        var buffer = Buffer.from(fileData, 'base64')

        var pdfDoc = await pdflib.PDFDocument.load(buffer)
        var helveticaFont = await pdfDoc.embedFont(pdflib.StandardFonts.Helvetica)

        console.log('i loaded the documint from the base64 data suxesfuly')

        var pages = pdfDoc.getPages()
        var firstPage = pages[0]

        var { width, height } = firstPage.getSize()
        
        firstPage.drawText(scenarioName, {
            x: 25,
            y: height - 100,
            size: 50,
            font: helveticaFont
        })

        console.log('i drawd the text to the first page')

        buffer = await pdfDoc.save()
        buffer = Buffer.from(buffer)

        console.log('now i saved that pdf and turned it bac to base64')

        var form = new FormData()

        console.log('ok i made a buffer and a form')

        form.append('token', token)
        form.append('thread_ts', thread)
        form.append('channels', channel)
        form.append('filename', fileName)
        form.append('filetype', 'pdf')
        form.append('initial_comment', message)
        form.append('file', buffer, {
            filename: fileName+'.pdf'
        })

        console.log('yay everything is appended to the form! redy to send :))')
        
        form.submit('https://slack.com/api/files.upload', function(err, response) {
            if (err) {
                console.log('i submitted but i got error :(')
                console.log(err)
                res.send(err)
            }
            else {
                console.log('i submitted and it is good so happy!!!!!')
                // console.log(response)
                res.send({
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage,
                    message: response.message,
                    file: response.file,
                })
            }
        })
    }
    catch (err) {
        console.log('ummmmm something bad hapend :(((')
        console.log(err)
        res.send(err)
    }
})