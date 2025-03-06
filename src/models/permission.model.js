const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new mongoose.Schema({
  // Identification and Time Fields
  permissionId: {
    type: String,
    required: true,
    unique: true
  },
  refIdUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  refIdUnit: {
    type: Schema.Types.ObjectId,
    ref: 'Unit',
    required: true
  },
  refIdCompany: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  permissionType: {
    type: String,
    enum: ['Masteradmin', 'Admin', 'Manager', 'Chef', 'Supervisor', 'User', 'Guest'],
    required: true
  },
  permissionStatus: {
    type: String,
    enum: ['Pendente', 'Ativa', 'Inativa'],
    default: 'Pendente'
  },
}, {
  timestamps: true
});

// Middleware para limpar referências antes de deletar
permissionSchema.pre('findOneAndDelete', async function(next) {
  const permission = await this.model.findOne(this.getQuery());
  if (permission) {
    await mongoose.model('User').updateMany(
      { idRefPermission: permission._id },
      { $pull: { idRefPermission: permission._id } }
    );
  }
  next();
});

// Também para o método deleteOne
permissionSchema.pre('deleteOne', async function(next) {
  const permission = await this.model.findOne(this.getQuery());
  if (permission) {
    await mongoose.model('User').updateMany(
      { idRefPermission: permission._id },
      { $pull: { idRefPermission: permission._id } }
    );
  }
  next();
});

module.exports = mongoose.model('Permission', permissionSchema);
