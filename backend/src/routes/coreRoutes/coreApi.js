const express = require('express');

const { catchErrors } = require('@/handlers/errorHandlers');

const router = express.Router();

const adminController = require('@/controllers/coreControllers/adminController');
const settingController = require('@/controllers/coreControllers/settingController');
const dashboardController = require('@/controllers/appControllers/dashboardController');

const { singleStorageUpload } = require('@/middlewares/uploadMiddleware');

// //_______________________________ Admin management_______________________________

router.route('/admin/create').post(
  adminController.requireAdminRoles,
  catchErrors(adminController.create)
);

router.route('/admin/list').get(
  adminController.requireAdminRoles,
  catchErrors(adminController.list)
);

router.route('/admin/listAll').get(
  adminController.requireAdminRoles,
  catchErrors(adminController.listAll)
);

router.route('/admin/search').get(
  adminController.requireAdminRoles,
  catchErrors(adminController.search)
);

router.route('/admin/read/:id').get(
  adminController.requireSelfOrAdmin,
  catchErrors(adminController.read)
);

router.route('/admin/update/:id').patch(
  adminController.requireSelfOrAdmin,
  catchErrors(adminController.update)
);

router.route('/admin/delete/:id').delete(
  adminController.requireAdminRoles,
  catchErrors(adminController.delete)
);

router.route('/admin/password-update/:id').patch(
  adminController.requireSelfOrAdmin,
  catchErrors(adminController.updatePassword)
);
// for the stats of the dashboard
//_______________________________ Dashboard _______________________________

router.route('/dashboard/lead-stats').get(catchErrors(dashboardController.getLeadStats));

router.route('/dashboard/sales-stats').get(catchErrors(dashboardController.getSalesStats));

router.route('/dashboard/revenue-stats').get(catchErrors(dashboardController.getRevenueStats));
//_______________________________ Admin Profile _______________________________

router.route('/admin/profile/password').patch(catchErrors(adminController.updateProfilePassword));
router
  .route('/admin/profile/update')
  .patch(
    singleStorageUpload({ entity: 'admin', fieldName: 'photo', fileType: 'image' }),
    catchErrors(adminController.updateProfile)
  );

// //____________________________________________ API for Global Setting _________________

router.route('/setting/create').post(catchErrors(settingController.create));
router.route('/setting/read/:id').get(catchErrors(settingController.read));
router.route('/setting/update/:id').patch(catchErrors(settingController.update));
//router.route('/setting/delete/:id).delete(catchErrors(settingController.delete));
router.route('/setting/search').get(catchErrors(settingController.search));
router.route('/setting/list').get(catchErrors(settingController.list));
router.route('/setting/listAll').get(catchErrors(settingController.listAll));
router.route('/setting/filter').get(catchErrors(settingController.filter));
router
  .route('/setting/readBySettingKey/:settingKey')
  .get(catchErrors(settingController.readBySettingKey));
router.route('/setting/listBySettingKey').get(catchErrors(settingController.listBySettingKey));
router
  .route('/setting/updateBySettingKey/:settingKey?')
  .patch(catchErrors(settingController.updateBySettingKey));
router
  .route('/setting/upload/:settingKey?')
  .patch(
    singleStorageUpload({ entity: 'setting', fieldName: 'settingValue', fileType: 'image' }),
    catchErrors(settingController.updateBySettingKey)
  );
router.route('/setting/updateManySetting').patch(catchErrors(settingController.updateManySetting));
module.exports = router;
