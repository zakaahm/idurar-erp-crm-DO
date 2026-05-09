const update = async (Model, req, res) => {
  // Find document by id and updates with the required fields
  req.body.removed = false;
  if (req.admin) {
    req.body.modifiedBy = req.admin._id;
  }
  req.body.modified = Date.now();
  const result = await Model.findOneAndUpdate(
    {
      _id: req.params.id,
      removed: false,
    },
    req.body,
    {
      new: true, // return the new result instead of the old one
      runValidators: true,
    }
  ).exec();
  if (!result) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'No document found ',
    });
  } else {
    return res.status(200).json({
      success: true,
      result,
      message: 'we update this document ',
    });
  }
};

module.exports = update;
