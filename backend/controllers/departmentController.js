const Department = require('../models/department');
const Ticket = require('../models/ticket');
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return res.json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    const department = await Department.create({
      name: name.trim(),
      description: description ? description.trim() : ''
    });
    return res.status(201).json(department);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const updateDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    const existing = await Department.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id }
    });
    if (existing) {
      return res.status(400).json({ message: 'Department name already exists' });
    }
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), description: description ? description.trim() : '' },
      { returnDocument: 'after', runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    return res.json(department);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await Ticket.updateMany({ department: req.params.id }, { $set: { department: null } });
    await Department.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };
