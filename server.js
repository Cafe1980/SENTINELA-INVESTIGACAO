const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Configuração de pastas (Cria automaticamente se não existirem)
['evidencias', 'casos'].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Configuração de Upload com Hash SHA-256 no nome do arquivo
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './evidencias'),
    filename: (req, file, cb) => {
        const fileHash = crypto.createHash('sha256').update(file.originalname + Date.now()).digest('hex');
        cb(null, `${fileHash}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static(__dirname)); // LER ARQUIVOS NA RAIZ DO PROJETO

// Rota para salvar o relatório completo
app.post('/salvar-investigacao', (req, res) => {
    const dados = req.body;
    const filename = `investigacao-${Date.now()}.json`;
    fs.writeFile(path.join(__dirname, 'casos', filename), JSON.stringify(dados, null, 2), (err) => {
        if (err) return res.status(500).send({mensagem: "Erro ao salvar"});
        res.send({ mensagem: "CUSTÓDIA LOCAL CONFIRMADA", arquivo: filename });
    });
});

// Rota para upload e geração de HASH em tempo real
app.post('/upload-prova', upload.single('arquivo'), (req, res) => {
    if (!req.file) return res.status(400).send("Erro");
    const fileBuffer = fs.readFileSync(req.file.path);
    const finalHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    res.send({ hash_sha256: finalHash });
});

app.listen(PORT, () => {
    console.log(`SISTEMA OPERACIONAL: http://localhost:${PORT}`);
});
