const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const UPLOAD_DIR = '/opt/lsjy-app/uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.tmp';
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf', 'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('不支持的文件类型: ' + file.mimetype));
  }
});

// Extract text from uploaded file
async function extractText(filePath, mimetype) {
  if (mimetype === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8').slice(0, 10000);
  }
  if (mimetype === 'application/pdf') {
    const pdf = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text.slice(0, 10000);
  }
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword') {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.slice(0, 10000);
  }
  if (mimetype.startsWith('image/')) {
    // Convert image to base64 for Coze API
    const ext = mimetype.split('/')[1];
    const data = fs.readFileSync(filePath);
    return `data:${mimetype};base64,${data.toString('base64')}`;
  }
  return `[文件: ${path.basename(filePath)}]`;
}

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ code: -1, message: '未收到文件' });
  try {
    const extracted = await extractText(req.file.path, req.file.mimetype);
    res.json({
      code: 0,
      data: {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        filePath: req.file.path,
        extractedText: extracted,
        isImage: req.file.mimetype.startsWith('image/'),
      }
    });
  } catch (err) {
    res.status(500).json({ code: -1, message: '文件处理失败: ' + err.message });
  }
});

// Multi-file upload
app.post('/upload-multi', upload.array('files', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ code: -1, message: '未收到文件' });
  const results = [];
  try {
    for (const file of req.files) {
      const extracted = await extractText(file.path, file.mimetype);
      results.push({
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        extractedText: extracted,
        isImage: file.mimetype.startsWith('image/'),
      });
    }
    res.json({ code: 0, data: results });
  } catch (err) {
    res.status(500).json({ code: -1, message: '文件处理失败: ' + err.message });
  }
});

const PORT = 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📎 File upload server running on port ${PORT}`);
});
