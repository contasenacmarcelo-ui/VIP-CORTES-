import { Sequelize, DataTypes } from 'sequelize';
import dotenv from "dotenv";

dotenv.config();

let sequelize = null;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
}

let Usuario = null;
let Agendamento = null;
let Review = null;
let Fidelidade = null;

if (sequelize) {
  Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: true, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: true }
  }, { tableName: 'usuarios', timestamps: false });

  Agendamento = sequelize.define('Agendamento', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },
    service: { type: DataTypes.STRING(100), allowNull: true },
    data_agendamento: { type: DataTypes.DATEONLY, allowNull: true },
    hora: { type: DataTypes.TIME, allowNull: true },
    observacoes: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'agendamentos', timestamps: false });

  Review = sequelize.define('Review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    author_name: { type: DataTypes.STRING(100), allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, { tableName: 'reviews', timestamps: true, createdAt: 'created_at', updatedAt: false });

  Fidelidade = sequelize.define('Fidelidade', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    usuario_id: { type: DataTypes.INTEGER, allowNull: true },
    pontos: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.STRING(20), defaultValue: 'ativo' }
  }, { tableName: 'fidelidades', timestamps: false });
}

export { sequelize, Usuario, Agendamento, Review, Fidelidade };
