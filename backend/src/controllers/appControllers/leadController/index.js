const mongoose = require('mongoose');
const Lead   = mongoose.model('Lead');
const Client = mongoose.model('Client');
const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');

const leadController = createCRUDController('Lead');

console.log('Lead controller loaded');

const originalUpdate = leadController.update;

leadController.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const currentLead = await Lead.findById(id);
    if (!currentLead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // If status changes to closed_won for the first time → create a Client
    // and store the leadId so we can track this as a real lead→client conversion
    if (updateData.status === 'closed_won' && currentLead.status !== 'closed_won') {
      const clientData = {
        name:      currentLead.name,
        email:     currentLead.email,
        phone:     currentLead.phone,
        address:   currentLead.company,
        createdBy: req.admin._id,  // de closer = ingelogde user
        leadId:    currentLead._id, // link terug naar de lead — cruciaal voor conversie
      };

      await Client.create(clientData);
      console.log(`Client created from lead "${currentLead.name}" by user ${req.admin._id}`);
    }

    return originalUpdate(req, res);
  } catch (error) {
    console.error('Error updating lead:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = leadController;