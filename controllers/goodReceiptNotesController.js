const config = require('../config');
const { NtlmClient } = require('axios-ntlm');
const { md101Companies, md102WebServices, wh200GoodReceiptNotesHead, wh201GoodReceiptNotesDetail } = require('../models/index');
const encodeUrl = require('../uitls/encodeUrl');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

module.exports = {
    //region index
    index: async(req, res) => {
        try {
            return res.render('pages/good-receipt-notes/index', { 
                title: 'Good Receipt Notes'
            });
        } catch (err) {
            console.error(err);
        }
    },
    //region generate
    generate: async(req, res) => {
        try {
            const [companys, services] = await Promise.all([
                await md101Companies.findAll({
                    attributes: ['name','uuid'],
                    raw: true
                }),
                await md102WebServices.findOne({
                    where: {
                        api_name: `GetAPIGoodReceiptNotes`
                    },
                    raw: true
                })
            ]);

            if(companys.length > 0) {
                for (let i = 0; i < companys.length; i++) {
                    const credentials = {
                        username: config.NAV_USERNAME,
                        password: config.NAV_PASSWORD,
                        domain: config.NAV_DOMIAN
                    };
        
                    const configApi =  {
                        baseURL: encodeUrl(`${services.api_link}`, `${companys[i]?.name}`),
                        method: "get"
                    };

                    const client = NtlmClient(credentials, configApi);
                    const response = await client.get(`${configApi.baseURL}`).catch((err)=>{
                        throw err;
                    });

                    if(response.data) {
                        const result = response.data.value;

                        const document_no = result.map((item) => item.documentNo);

                        const unique = [...new Set(document_no)];

                        const headers = result.reduce(function (r, a) {
                            r[a.documentNo] = r[a.documentNo] || [];
                            r[a.documentNo].push(a);
                            
                            return r;
                        }, Object.create(null));

                        if(unique.length > 0) {
                            await wh200GoodReceiptNotesHead.destroy({ 
                                where: {
                                    company_id: companys[i]?.uuid
                                }
                            }).catch((err)=>{
                                throw err;
                            });
                            
                            await wh201GoodReceiptNotesDetail.destroy({ 
                                where: {
                                    company_id: companys[i]?.uuid
                                }
                            }).catch((err)=>{
                                throw err;
                            });

                            for (let j = 0; j < unique.length; j++) {
                                const rows = headers[unique[j]], dataset = {}, uuid = uuidv4(`${unique[j]}${companys[i]?.uuid}`);

                                const details = rows.map((item) => {
                                    dataset.document_no = item?.documentNo, //PK
                                    dataset.document_type = item?.documentType, //PK
                                    dataset.receipt_date = item?.receiptDate,
                                    dataset.buy_from_vendor_no = item?.buyFromVendorNo,
                                    dataset.buy_from_vendor_name = item?.buyFromVendorName,
                                    dataset.last_receiving_no = item?.lastReceivingNo
                                    dataset.created_by = 'System';
                                    dataset.updated_by = 'System';
                                    dataset.company_id = companys[i]?.uuid;
                                    dataset.uuid = uuid;

                                    return {
                                        document_id: uuid, //PK
                                        line_no: item?.lineNo, //PK
                                        no: item?.no,
                                        description: item?.description,
                                        description2: item?.description2,
                                        quantity: item?.quantity,
                                        qty_to_receive: item?.qtyToReceive,
                                        out_standing_qty: item?.outstandingQuantity,
                                        uom: item?.unitOfMeasureCode,
                                        tracking_type: item?.trackingType,
                                        location_code: item?.locationCode,
                                        bin_code: item?.binCode,
                                        require_exp_date: item?.requireExpDate,
                                        bin_mandatory: item?.binMandatory,
                                        max_qty_receive: item?.maxQtyReceive,
                                        expected_receipt_date: item?.expectedReceiptDate,
                                        qty_to_received: item?.qtyToReceived,
                                        created_by: 'System',
                                        updated_by: 'System',
                                        company_id: companys[i]?.uuid //PK
                                    }
                                });

                                if(details.length > 0) {
                                    await wh200GoodReceiptNotesHead.findOrCreate({
                                        where: {
                                            document_no: dataset?.document_no,
                                            company_id: dataset?.company_id
                                        },
                                        defaults: dataset
                                    }).then( async ([ value, created ])=>{
                                        if(created) {
                                            await wh201GoodReceiptNotesDetail.bulkCreate(details).catch((err)=>{
                                                throw err;
                                            });
                                        }
                                        
                                    }).catch((err)=>{
                                        throw err;
                                    });
                                }
                            }
                        }
                    }
                }
            }

            return res.json([companys, services]);
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    }
}