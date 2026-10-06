const express = require('express');
const { ensureProductImageColumn, ensureProductVariantSchema } = require('./common/schema');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
});

app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AppBanBongChuyen backend' });
});

app.use('/api/admin', require('./router/adminRouter'));
app.use('/api/chitietdonhang', require('./router/chitietdonhangRouter'));
app.use('/api/chitietgiohang', require('./router/chitietgiohangRouter'));
app.use('/api/chitietphieunhap', require('./router/chitietphieunhapRouter'));
app.use('/api/danhgia', require('./router/danhgiaRouter'));
app.use('/api/danhmuc', require('./router/danhmucRouter'));
app.use('/api/diachi', require('./router/diachiRouter'));
app.use('/api/donhang', require('./router/donhangRouter'));
app.use('/api/giohang', require('./router/giohangRouter'));
app.use('/api/hinhanhsanpham', require('./router/hinhanhsanphamRouter'));
app.use('/api/loaisanpham', require('./router/loaisanphamRouter'));
app.use('/api/magiamgia', require('./router/magiamgiaRouter'));
app.use('/api/nguoidung', require('./router/nguoidungRouter'));
app.use('/api/nguoidungmagiamgia', require('./router/nguoidungmagiamgiaRouter'));
app.use('/api/nhacungcap', require('./router/nhacungcapRouter'));
app.use('/api/phieunhap', require('./router/phieunhapRouter'));
app.use('/api/sanpham', require('./router/sanphamRouter'));
app.use('/api/thanhtoan', require('./router/thanhtoanRouter'));
app.use('/api/yeuthich', require('./router/yeuthichRouter'));

const port = process.env.PORT || 4000;

ensureProductImageColumn()
  .then(() => ensureProductVariantSchema())
  .then(() => {
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((error) => {
    console.error('Không thể cập nhật cấu trúc dữ liệu sản phẩm:', error);
    process.exitCode = 1;
  });
