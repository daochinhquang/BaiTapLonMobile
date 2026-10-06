const Model = require('../models/sanphamModel');
exports.getAll = (req, res) =>
  Model.search(req.query || {}, (err, r) => (err ? res.status(500).json(err) : res.json(r)));
exports.getById = (req, res) =>
  Model.getById(req.params.id, (err, r) => {
    if (err) {
      return res.status(500).json(err);
    }

    const product = r && r[0];

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }

    return res.json(product);
  });
exports.create = (req, res) => Model.create(req.body, (err, r) => err ? res.status(500).json(err) : res.json({ id: r.insertId }));
exports.update = (req, res) => Model.update(req.params.id, req.body, (err) => err ? res.status(500).json(err) : res.json({ message: 'Updated' }));
exports.delete = (req, res) => Model.delete(req.params.id, (err) => err ? res.status(500).json(err) : res.json({ message: 'Deleted' }));
