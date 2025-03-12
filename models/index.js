// Module MD - Master Data
const md100Users = require('./md/md_100_users');
const md101Companies = require('./md/md_101_companies');
const md102WebServices = require('./md/md_102_web_services');
const md103Locations = require('./md/md_103_locations');

// Module WH - Warehouse
const wh100PhysicalFixedAssetHead = require('./wh/wh_100_physical_fixed_asset_head');
const wh101PhysicalFixedAssetDetail = require('./wh/wh_101_physical_fixed_asset_detail');
const wh200GoodReceiptNotesHead = require('./wh/wh_200_good_receipt_notes_head');
const wh201GoodReceiptNotesDetail = require('./wh/wh_201_good_receipt_notes_detail');
const wh202GoodReceiptNotesTemp = require('./wh/wh_202_good_receipt_notes_temp');

module.exports = {
    md100Users,
    md101Companies,
    md102WebServices,
    md103Locations,
    wh100PhysicalFixedAssetHead,
    wh101PhysicalFixedAssetDetail,
    wh200GoodReceiptNotesHead,
    wh201GoodReceiptNotesDetail,
    wh202GoodReceiptNotesTemp
}