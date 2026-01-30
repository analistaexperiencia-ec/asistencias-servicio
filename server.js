
/**
 * BACKEND SERVER (Node.js + Express + MongoDB)
 * 
 * Este archivo es una representación del backend solicitado.
 * Para ejecutarlo en producción, se requiere un entorno Node.js
 * y una URI de MongoDB Atlas válida.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Esquema de Mongoose
const proveedorSchema = new mongoose.Schema({
  nombre_proveedor: { type: String, required: true },
  categoria: { type: String, required: true },
  direccion: { type: String, required: true },
  ubicacion: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  ciudad: { type: String, required: true },
  provincia: { type: String, required: true },
  nombre_contacto: { type: String },
  numero_celular: { type: String, required: true }
});

const Proveedor = mongoose.model('Proveedor', proveedorSchema);

// Endpoints
app.get('/api/proveedores', async (req, res) => {
  try {
    const { nombre, categoria, provincia, ciudad } = req.query;
    let query = {};

    if (nombre) query.nombre_proveedor = { $regex: nombre, $options: 'i' };
    if (categoria) query.categoria = categoria;
    if (provincia) query.provincia = provincia;
    if (ciudad) query.ciudad = { $regex: ciudad, $options: 'i' };

    const proveedores = await Proveedor.find(query);
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/proveedores', async (req, res) => {
  const proveedor = new Proveedor(req.body);
  try {
    const nuevoProveedor = await proveedor.save();
    res.status(201).json(nuevoProveedor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Conexión a DB y Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/asistencia_ecuador';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('Error de conexión:', err));
