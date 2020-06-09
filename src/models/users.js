/**
 * MODELO EN BASE AL ESQUEMA DE USUARIOS
 */


/**
 * Esquema de Usuarios
 */
import mongoose from 'mongoose';
import db from '../database';
import uniqueValidator from 'mongoose-unique-validator';

const { Schema } = mongoose;

// Roles
const roles = {
  values: ['ADMIN', 'USER'],
  message: '{VALUE} no es un rol válido',
};

// Creación del esquema
const UserSchema = new Schema(
  {
    username: {
      type: String, required: [true, 'Nombre de usuario obligatorio'], unique: true, index: true,
    },
    email: {
      type: String, required: [true, 'Email obligatorio'], unique: true, index: true,
    },
    password: { type: String, required: [true, 'Email obligatorio'] },
    fecha: { type: Date, default: Date.now },
    activo: { type: Boolean, default: true },
    avatar: { type: String },
    role: { type: String, default: 'USER', enum: roles },
  },
  // El método estriccto nos dice si aceptamos o no un documento incpleto. Lo ponemos así porque no vamos a meter el id y da un poco de flexibilidad
  { strict: true },
  // Le añadimos una huella de tiempo
  { timestamps: true },
);

// Validadores
UserSchema.plugin(uniqueValidator, { message: 'Error, esperaba {PATH} único.' });

// Métodos estaticos que nos servirán para métodos rápidos

// Devuelve el usuario por ID
UserSchema.statics.getById = function getById(id) {
  return this.findOne({ _id: id })
    .lean() // Con Lean le estamos diciendo que aprenda y la memorice porque la usaremos mucho
    .exec(); // Que lo ejecute
};

// Devuelve el usuario por Username
UserSchema.statics.getByUserName = function getByUserName(username) {
  return this.findOne({ username })
    .lean()
    .exec();
};

// Devuleve el usuario por email
UserSchema.statics.getByEmail = function getByEmail(email) {
  return this.findOne({ email })
    .lean()
    .exec();
};

// Devuelve una lista de todos
UserSchema.statics.getAll = function getAll(pageOptions, searchOptions) {
  // Si no quieres buscar por nada, deja la función fin vacía, sin where ni equals
  return this.find()
    .where(searchOptions.search_field)
    .equals({ $regex: searchOptions.search_content, $options: 'i' })
    .skip(pageOptions.page * pageOptions.limit) // si no quieres filtrar o paginar no pongas skip o limit
    .limit(pageOptions.limit)
    .sort({ title: searchOptions.search_order })
    .exec();
};


// Sobre escribimos el método JSON, esto es porque si hacemos una vista necesitamos id y no _id que es como lo guarda Mongo
UserSchema.method('toJSON', function toJSON() {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

// Creamos un modelo del esquema
UserSchema.UserModel = () => db.connection().model('User', UserSchema);
const User = UserSchema.UserModel;

export default User;
