const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: 'http://127.0.0.1:5500', // URL của trang web của bạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Tạo pool kết nối MySQL
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '123456', // Đảm bảo mật khẩu này là chính xác
  database: 'quan_ly_dan_cu',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối
pool.getConnection()
  .then(connection => {
    console.log('Đã kết nối MySQL thành công!');
    connection.release();
  })
  .catch(err => {
    console.error('Lỗi kết nối MySQL:', err);
  });

// Phục vụ file HTML khi truy cập vào đường dẫn gốc
app.use(express.static(path.join(__dirname)));

// Endpoint API để lấy dữ liệu từ bảng ho_khau
app.get('/api/households', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM ho_khau');
    console.log('Households data:', results);
    res.json(results);
  } catch (err) {
    console.error('Lỗi truy vấn ho_khau:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint API để lấy dữ liệu từ bảng nhan_khau
app.get('/api/individuals', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM nhan_khau');
    console.log('Individuals data:', results);
    res.json(results);
  } catch (err) {
    console.error('Lỗi truy vấn nhan_khau:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint API để lưu dữ liệu vào bảng ho_khau và nhan_khau
app.post('/api/save', async (req, res) => {
  console.log('Received save request');
  const { households, individuals } = req.body;
  console.log('Received data:', { households, individuals });

  if (!households || !individuals) {
    console.log('Data is incomplete');
    return res.status(400).json({ success: false, message: 'Dữ liệu không đầy đủ' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Xóa dữ liệu cũ
    await connection.query('DELETE FROM ho_khau');
    for (const household of households) {
      await connection.query('INSERT INTO ho_khau SET ?', household);
    }

    await connection.query('DELETE FROM nhan_khau');
    for (const individual of individuals) {
      await connection.query('INSERT INTO nhan_khau SET ?', individual);
    }

    await connection.commit();
    console.log('Data saved successfully');
    res.json({ success: true, message: 'Dữ liệu đã được lưu thành công' });
  } catch (err) {
    await connection.rollback();
    console.error('Error during save operation:', err);
    res.status(500).json({ success: false, message: 'Lỗi khi lưu dữ liệu: ' + err.message });
  } finally {
    connection.release();
  }
});

const PORT = 5500; // Đảm bảo cổng này khớp với cổng bạn sử dụng trong scripts.js
app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng ${PORT}`);
});
