const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Tạo kết nối MySQL
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '123456', // Thay bằng mật khẩu của bạn
  database: 'quan_ly_dan_cu'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Đã kết nối MySQL!');
});

// Endpoint API để lưu dữ liệu vào bảng ho_khau và nhan_khau
app.post('/api/save', (req, res) => {
  const { households, individuals } = req.body;

  if (!households || !individuals) {
    return res.status(400).json({ success: false, message: 'Dữ liệu không đầy đủ' });
  }

  // Xóa tất cả dữ liệu hiện tại từ bảng ho_khau
  connection.query('DELETE FROM ho_khau', (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi khi xoá bảng ho_khau: ' + err.message });
    }

    // Chèn dữ liệu mới vào bảng ho_khau
    const hoKhauInsertQuery = 'INSERT INTO ho_khau SET ?';
    households.forEach((household) => {
      connection.query(hoKhauInsertQuery, household, (err) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Lỗi khi chèn ho_khau: ' + err.message });
        }
      });
    });

    // Sau khi xử lý bảng ho_khau, tiếp tục với nhan_khau
    connection.query('DELETE FROM nhan_khau', (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Lỗi khi xoá bảng nhan_khau: ' + err.message });
      }

      // Chèn dữ liệu mới vào bảng nhan_khau
      const nhanKhauInsertQuery = 'INSERT INTO nhan_khau SET ?';
      individuals.forEach((individual) => {
        connection.query(nhanKhauInsertQuery, individual, (err) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi khi chèn nhan_khau: ' + err.message });
          }
        });
      });

      // Khi hoàn thành cả hai bảng, trả về phản hồi thành công
      res.json({ success: true, message: 'Dữ liệu đã được lưu thành công' });
    });
  });
});

// Chạy ứng dụng trên cổng 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy ở cổng ${PORT}`);
});
