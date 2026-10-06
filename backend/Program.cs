using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Data;
using System.IO;
using System.Text;

namespace autocode125
{
    public class Program
    {
        // Chuỗi kết nối MySQL
        private static readonly string connectionString = "server=localhost;user=root;password=123456;database=AppBanBongChuyen;";
        
private static readonly string basePath = @"E:\app_ban_bong_chuyen - Copy\backend";

        public static void Main(string[] args)
        {
            while (true)
            {
                Console.Clear();
                Console.WriteLine("==================================================");
                Console.WriteLine("    HE THONG SINH CODE EXPRESSJS TU DONG");
                Console.WriteLine("==================================================");
                Console.WriteLine("0. CHAY FULL AUTO (Tu dong sinh toan bo tu 1 đến 9)");
                Console.WriteLine("1. Kiem tra ket noi CSDL");
                Console.WriteLine("2. Hien thi cau truc cua 1 bang");
                Console.WriteLine("3. Hien thi du lieu cua 1 bang");
                Console.WriteLine("4. Tao file ket noi CSDL common/db.js");
                Console.WriteLine("5. Tao model cho 1 bang models/");
                Console.WriteLine("6. Tao tat ca models cho CSDL models/");
                Console.WriteLine("7. Tao controller controllers/");
                Console.WriteLine("8. Tao router router/");
                Console.WriteLine("9. Tao phan chay copy vao app.js");
                Console.WriteLine("10. Exit");
                Console.WriteLine("==================================================");
                Console.Write("Chon chuc nang (0-10): ");

                if (!int.TryParse(Console.ReadLine(), out int k)) continue;
                if (k == 10) break;

                switch (k)
                {
                    case 0:
                        ChayFullTu1Den9();
                        break;
                    case 1:
                        KiemTraKetNoi();
                        break;
                    case 2:
                        Console.Write("Nhap ten bang can xem cau truc: ");
                        HienThiCauTrucBang(Console.ReadLine() ?? "");
                        break;
                    case 3:
                        Console.Write("Nhap ten bang can xem du lieu: ");
                        HienThiDuLieuBang(Console.ReadLine() ?? "");
                        break;
                    case 4:
                        KetNoiCSDL();
                        break;
                    case 5:
                        Console.Write("Nhap ten bang can tao model: ");
                        TaoModelChoBang(Console.ReadLine() ?? "");
                        break;
                    case 6:
                        TaoTatCaModels();
                        break;
                    case 7:
                        TaoTatCaControllers();
                        break;
                    case 8:
                        TaoTatCaRouters();
                        break;
                    case 9:
                        TaoAppJs();
                        break;
                    default:
                        Console.WriteLine("Lua chon khong hop le!");
                        break;
                }
                Console.WriteLine("\nNhan phim bat ky de tiep tuc...");
                Console.ReadKey();
            }
        }

        // Tự động chạy liên tục các bước sinh code
        public static void ChayFullTu1Den9()
        {
            Console.WriteLine("\n=== BAT DAU TIEN TRINH SINH FULL CODE ===");
            
            Console.WriteLine("\n[1/6] Kiem tra ket noi...");
            KiemTraKetNoi();

            Console.WriteLine("\n[2/6] Tao file common/db.js...");
            KetNoiCSDL();

            Console.WriteLine("\n[3/6] Tao tat ca Models...");
            TaoTatCaModels();

            Console.WriteLine("\n[4/6] Tao tat ca Controllers...");
            TaoTatCaControllers();

            Console.WriteLine("\n[5/6] Tao tat ca Routers...");
            TaoTatCaRouters();

            Console.WriteLine("\n[6/6] Tao file khoi chay app.js...");
            TaoAppJs();

            Console.WriteLine("\n==================================================");
            Console.WriteLine($" HOAN THANH! Toan bo project ExpressJS da luu tai:\n {basePath}");
            Console.WriteLine("==================================================");
        }

        // 1. Kiểm tra kết nối
        public static void KiemTraKetNoi()
        {
            using (var connection = new MySqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var command = new MySqlCommand("SHOW TABLES", connection);
                    using (var reader = command.ExecuteReader())
                    {
                        Console.WriteLine("\nCac bang co trong CSDL:");
                        while (reader.Read())
                        {
                            Console.WriteLine($"- {reader.GetString(0)}");
                        }
                    }
                    Console.WriteLine("\n==> Ket noi CSDL thanh cong!");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("\nKet noi that bai: " + ex.Message);
                }
            }
        }

        // 2. Hiển thị cấu trúc bảng
        public static void HienThiCauTrucBang(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName)) return;
            using (var connection = new MySqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var command = new MySqlCommand($"DESCRIBE `{tableName}`", connection);
                    var adapter = new MySqlDataAdapter(command);
                    var dt = new DataTable();
                    adapter.Fill(dt);

                    Console.WriteLine($"\nCau truc bang '{tableName}':");
                    foreach (DataRow row in dt.Rows)
                    {
                        Console.WriteLine($"{row["Field"]} - {row["Type"]} - Null:{row["Null"]} - Key:{row["Key"]}");
                    }
                }
                catch (Exception ex) 
                { 
                    Console.WriteLine("Loi: " + ex.Message); 
                }
            }
        }

        // 3. Hiển thị dữ liệu bảng
        public static void HienThiDuLieuBang(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName)) return;
            using (var connection = new MySqlConnection(connectionString))
            {
                try
                {
                    connection.Open();
                    var command = new MySqlCommand($"SELECT * FROM `{tableName}` LIMIT 20", connection);
                    var adapter = new MySqlDataAdapter(command);
                    var dt = new DataTable();
                    adapter.Fill(dt);

                    Console.WriteLine($"\nDu lieu bang '{tableName}' (Toi da 20 dong):");
                    foreach (DataRow row in dt.Rows)
                    {
                        foreach (DataColumn col in dt.Columns)
                        {
                            Console.Write($"{row[col]}\t");
                        }
                        Console.WriteLine();
                    }
                }
                catch (Exception ex) 
                { 
                    Console.WriteLine("Loi: " + ex.Message); 
                }
            }
        }

        // 4. Tạo file db.js
        public static void KetNoiCSDL()
        {
            string commonDir = Path.Combine(basePath, "common");
            Directory.CreateDirectory(commonDir);

            var sb = new StringBuilder();
            sb.AppendLine("const mysql = require('mysql2');");
            sb.AppendLine("const db = mysql.createPool({");
            sb.AppendLine("  host: 'localhost',");
            sb.AppendLine("  user: 'root',");
            sb.AppendLine("  password: '123456',");
            sb.AppendLine("  database: 'AppBanBongChuyen'");
            sb.AppendLine("});");
            sb.AppendLine("module.exports = db;");

            string filePath = Path.Combine(commonDir, "db.js");
            File.WriteAllText(filePath, sb.ToString());
            Console.WriteLine($"Da tao file: {filePath}");
        }

        // Hàm hỗ trợ lấy danh sách tên các bảng
        private static List<string> LayDanhSachBang()
        {
            var list = new List<string>();
            using (var connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                var command = new MySqlCommand("SHOW TABLES", connection);
                using (var reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        list.Add(reader.GetString(0));
                    }
                }
            }
            return list;
        }

        // 5. Tạo Model cho 1 bảng
        public static void TaoModelChoBang(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName)) return;
            string dir = Path.Combine(basePath, "models");
            Directory.CreateDirectory(dir);

            string primaryKey = "id";
            using (var connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                var command = new MySqlCommand($"DESCRIBE `{tableName}`", connection);
                var dt = new DataTable();
                new MySqlDataAdapter(command).Fill(dt);

                foreach (DataRow row in dt.Rows)
                {
                    if (row["Key"].ToString() == "PRI") 
                    {
                        primaryKey = row["Field"].ToString();
                        break;
                    }
                }
            }

            var sb = new StringBuilder();
            sb.AppendLine("const db = require('../common/db');");
            sb.AppendLine($"const {tableName}Model = {{");
            sb.AppendLine($"  getAll: (cb) => db.query('SELECT * FROM `{tableName}`', cb),");
            sb.AppendLine($"  getById: (id, cb) => db.query('SELECT * FROM `{tableName}` WHERE `{primaryKey}` = ?', [id], cb),");
            sb.AppendLine($"  create: (data, cb) => db.query('INSERT INTO `{tableName}` SET ?', data, cb),");
            sb.AppendLine($"  update: (id, data, cb) => db.query('UPDATE `{tableName}` SET ? WHERE `{primaryKey}` = ?', [data, id], cb),");
            sb.AppendLine($"  delete: (id, cb) => db.query('DELETE FROM `{tableName}` WHERE `{primaryKey}` = ?', [id], cb)");
            sb.AppendLine("};");
            sb.AppendLine($"module.exports = {tableName}Model;");

            File.WriteAllText(Path.Combine(dir, $"{tableName}Model.js"), sb.ToString());
            Console.WriteLine($"Da tao model: {tableName}Model.js");
        }

        // 6. Tạo tất cả Models
        public static void TaoTatCaModels()
        {
            var tables = LayDanhSachBang();
            foreach (var tbl in tables)
            {
                TaoModelChoBang(tbl);
            }
            Console.WriteLine("==> Hoan thanh tao tat ca Models!");
        }

        // 7. Tạo tất cả Controllers
        public static void TaoTatCaControllers()
        {
            string dir = Path.Combine(basePath, "controllers");
            Directory.CreateDirectory(dir);

            var tables = LayDanhSachBang();
            foreach (var tbl in tables)
            {
                var sb = new StringBuilder();
                sb.AppendLine($"const Model = require('../models/{tbl}Model');");
                sb.AppendLine("exports.getAll = (req, res) => Model.getAll((err, r) => err ? res.status(500).json(err) : res.json(r));");
                sb.AppendLine("exports.getById = (req, res) => Model.getById(req.params.id, (err, r) => err ? res.status(500).json(err) : res.json(r[0]));");
                sb.AppendLine("exports.create = (req, res) => Model.create(req.body, (err, r) => err ? res.status(500).json(err) : res.json({ id: r.insertId }));");
                sb.AppendLine("exports.update = (req, res) => Model.update(req.params.id, req.body, (err) => err ? res.status(500).json(err) : res.json({ message: 'Updated' }));");
                sb.AppendLine("exports.delete = (req, res) => Model.delete(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: 'Deleted' }));");

                File.WriteAllText(Path.Combine(dir, $"{tbl}Controller.js"), sb.ToString());
                Console.WriteLine($"Da tao controller: {tbl}Controller.js");
            }
            Console.WriteLine("==> Hoan thanh tao tat ca Controllers!");
        }

        // 8. Tạo tất cả Routers
        public static void TaoTatCaRouters()
        {
            string dir = Path.Combine(basePath, "router");
            Directory.CreateDirectory(dir);

            var tables = LayDanhSachBang();
            foreach (var tbl in tables)
            {
                var sb = new StringBuilder();
                sb.AppendLine("const express = require('express');");
                sb.AppendLine("const router = express.Router();");
                sb.AppendLine($"const ctrl = require('../controllers/{tbl}Controller');");
                sb.AppendLine("router.get('/', ctrl.getAll);");
                sb.AppendLine("router.get('/:id', ctrl.getById);");
                sb.AppendLine("router.post('/', ctrl.create);");
                sb.AppendLine("router.put('/:id', ctrl.update);");
                sb.AppendLine("router.delete('/:id', ctrl.delete);");
                sb.AppendLine("module.exports = router;");

                File.WriteAllText(Path.Combine(dir, $"{tbl}Router.js"), sb.ToString());
                Console.WriteLine($"Da tao router: {tbl}Router.js");
            }
            Console.WriteLine("==> Hoan thanh tao tat ca Routers!");
        }

        // 9. Tạo app.js
        public static void TaoAppJs()
        {
            Directory.CreateDirectory(basePath);
            var sb = new StringBuilder();
            sb.AppendLine("const express = require('express');");
            sb.AppendLine("const app = express();");
            sb.AppendLine("app.use(express.json());");
            sb.AppendLine();
            
            var tables = LayDanhSachBang();
            foreach (var tbl in tables)
            {
                sb.AppendLine($"app.use('/api/{tbl}', require('./router/{tbl}Router'));");
            }
            sb.AppendLine();
            sb.AppendLine("app.listen(3000, () => console.log('Server running on port 3000'));");

            string filePath = Path.Combine(basePath, "app.js");
            File.WriteAllText(filePath, sb.ToString());
            Console.WriteLine($"==> Da tao file app.js thanh cong tai: {filePath}");
        }
    }
}