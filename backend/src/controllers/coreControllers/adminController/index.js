const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generate: uniqueId } = require('shortid');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const createUserController = require('@/controllers/middlewaresControllers/createUserController');

const Admin = mongoose.model('Admin');
const AdminPassword = mongoose.model('AdminPassword');

const adminCrud = createCRUDController('Admin');
const userProfileController = createUserController('Admin');

const allowedManagerRoles = ['owner', 'admin'];

const requireAdminRoles = (req, res, next) => {
  const role = req.admin?.role;
  if (allowedManagerRoles.includes(role)) {
    return next();
  }
  return res.status(403).json({
    success: false,
    result: null,
    message: 'Unauthorized: only Admin/Owner users can manage accounts.',
  });
};

const requireSelfOrAdmin = (req, res, next) => {
  const role = req.admin?.role;
  const ownId = req.admin?._id?.toString();
  const targetId = req.params.id;

  if (allowedManagerRoles.includes(role) || ownId === targetId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    result: null,
    message: 'Unauthorized: you can only access your own account or user management if you are Admin/Owner.',
  });
};

const create = async (req, res) => {
  const { email, name, surname, role = 'sales', enabled = true, password } = req.body;
  const normalizedRole = String(role || 'sales').toLowerCase();
  const allowedRoles = ['owner', 'admin', 'sales'];

  if (!email || !name || !password) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'Email, name and password are required to create a user.',
    });
  }

  if (!allowedRoles.includes(normalizedRole)) {
    return res.status(400).json({
      success: false,
      result: null,
      message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}.`,
    });
  }

  if (normalizedRole === 'owner' && req.admin?.role !== 'owner') {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Only Owner users can create another Owner account.',
    });
  }

  const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim(), removed: false });
  if (existingAdmin) {
    return res.status(409).json({
      success: false,
      result: null,
      message: 'A user with that email already exists.',
    });
  }

  const admin = new Admin({
    email: email.toLowerCase().trim(),
    name,
    surname,
    role: normalizedRole,
    enabled,
    removed: false,
    createdBy: req.admin?._id,
  });

  const savedAdmin = await admin.save();
  const salt = uniqueId();
  const passwordHash = bcrypt.hashSync(salt + password);

  await new AdminPassword({
    user: savedAdmin._id,
    password: passwordHash,
    salt,
    emailVerified: true,
    authType: 'email',
  }).save();

  return res.status(200).json({
    success: true,
    result: savedAdmin,
    message: 'User account created successfully.',
  });
};

const read = async (req, res) => {
  return adminCrud.read(req, res);
};

const update = async (req, res) => {
  if (req.body.password) {
    delete req.body.password;
  }

  if (!allowedManagerRoles.includes(req.admin?.role)) {
    delete req.body.role;
    delete req.body.enabled;
    delete req.body.removed;
  }

  return adminCrud.update(req, res);
};

const deleteAdmin = async (req, res) => {
  const targetAdmin = await Admin.findOne({ _id: req.params.id, removed: false }).exec();

  if (!targetAdmin) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'User not found.',
    });
  }

  if (targetAdmin.role === 'owner' || targetAdmin.role === 'admin') {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'Admin or Owner accounts cannot be deleted through the app.',
    });
  }

  if (req.admin._id.toString() === req.params.id) {
    return res.status(403).json({
      success: false,
      result: null,
      message: 'You cannot delete your own account through the app.',
    });
  }

  return adminCrud.delete(req, res);
};

module.exports = {
  create,
  read,
  update,
  delete: deleteAdmin,
  list: adminCrud.list,
  listAll: adminCrud.listAll,
  search: adminCrud.search,
  requireAdminRoles,
  requireSelfOrAdmin,
  updateProfile: userProfileController.updateProfile,
  updatePassword: userProfileController.updatePassword,
  updateProfilePassword: userProfileController.updateProfilePassword,
};
