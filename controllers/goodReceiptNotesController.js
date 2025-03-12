const config = require('../config');
const { NtlmClient } = require('axios-ntlm');
const { md101Companies, md102WebServices, wh200GoodReceiptNotesHead, wh201GoodReceiptNotesDetail, wh202GoodReceiptNotesTemp } = require('../models/index');
const encodeUrl = require('../uitls/encodeUrl');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const { Op } = require("sequelize");
const sequelize = require('../uitls/database');

const option = { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
};

const getGoodReceipNotes = async (params) => {
    try {
        const { document_no, company_id, fetch_data } = params;

        const [companys, services] = await Promise.all([
            await md101Companies.findOne({
                attributes: ['name','uuid'],
                where: {
                    uuid: company_id
                },
                raw: true
            }),
            await md102WebServices.findOne({
                where: {
                    api_name: `GetAPIGoodReceiptNotes`
                },
                raw: true
            })
        ]);

        if(!services) throw 'GetAPIGoodReceiptNotes API not found in system.';
        if(!companys) throw 'Your company was not found in the system.';

        if(!fetch_data) {
            const duplicate = await wh200GoodReceiptNotesHead.findOne({
                where: {
                    document_no: document_no,
                    company_id: companys?.uuid
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });   
            
            if(duplicate) throw `${document_no} This document is already in the system. Created by ${duplicate?.created_by}.`;
        }
        
        const credentials = {
            username: config.NAV_USERNAME,
            password: config.NAV_PASSWORD,
            domain: config.NAV_DOMIAN
        };
    
        const configApi =  {
            baseURL: encodeUrl(`${services.api_link}`, `${companys?.name}`),
            method: "get"
        };
    
        const filters = `${configApi.baseURL}?$filter=documentNo eq '${document_no}'`;

        const client = NtlmClient(credentials, configApi);
        const response = await client.get(`${filters}`);

        return {
            arr: response.data.value,
            companys
        };
    } catch (err) {
        throw err;
    }
};

const postHandheldEntry = async (params) => {
    try {
        const { data, company_id } = params;
        
        const [companys, services] = await Promise.all([
            await md101Companies.findOne({
                attributes: ['name','uuid'],
                where: {
                    uuid: company_id
                },
                raw: true
            }),
            await md102WebServices.findOne({
                where: {
                    api_name: `HandheldEntry`
                },
                raw: true
            })
        ]);

        if(!services) throw 'HandheldEntry API not found in system.';
        if(!companys) throw 'Your company was not found in the system.';

        const credentials = {
            username: config.NAV_USERNAME,
            password: config.NAV_PASSWORD,
            domain: config.NAV_DOMIAN
        };
    
        const configApi =  {
            baseURL: encodeUrl(`${services.api_link}`, `${companys?.name}`),
            method: "post"
        };

        const client = NtlmClient(credentials, configApi);
        const { status, statusText } = await client.post(`${configApi.baseURL}`, data);

        return { status, statusText };
    } catch (err) {
        throw err;
    }
};

const postTransaction = async (params) => {
    try {
        const { documentNo, primaryKey, company_id } = params;

        const [companys, services] = await Promise.all([
            await md101Companies.findOne({
                attributes: ['name','uuid'],
                where: {
                    uuid: company_id
                },
                raw: true
            }),
            await md102WebServices.findOne({
                where: {
                    api_name: `PostTransaction`
                },
                raw: true
            })
        ]);

        if(!services) throw 'PostTransaction API not found in system.';
        if(!companys) throw 'Your company was not found in the system.';

        const credentials = {
            username: config.NAV_USERNAME,
            password: config.NAV_PASSWORD,
            domain: config.NAV_DOMIAN
        };
    
        const configApi =  {
            baseURL: encodeUrl(`${services.api_link}`, `${companys?.name}`),
            method: "post"
        };

        const client = NtlmClient(credentials, configApi);
        const { status, statusText } = await client.post(`${configApi.baseURL}`, {
            documentNo, primaryKey
        });

        return { status, statusText };
    } catch (err) {
        throw err;
    }
}

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
    //region getByUnique
    getByUnique: async(req, res) => {
        try {
            const { document_id, company_id } = req.params;

            const [header, arr] = await Promise.all([
                await wh200GoodReceiptNotesHead.findOne({
                    where: {
                        uuid: document_id,
                        company_id
                    },
                    raw: true
                }),
                await wh201GoodReceiptNotesDetail.findAll({
                    where: { 
                        document_id, 
                        company_id 
                    },
                    raw: true
                })
            ]);

            let details = ``;

            if(arr.length > 0) {
                for (let i = 0; i < arr.length; i++) {
                    const quantity = Number(Number(arr[i]?.quantity).toFixed(2)).toLocaleString("en-US", option);
                    const out_standing_qty = Number(Number(arr[i]?.out_standing_qty).toFixed(2)).toLocaleString("en-US", option);

                    const temp = await wh202GoodReceiptNotesTemp.findOne({
                        attributes: [
                            [sequelize.fn('sum', sequelize.col('quantity')), 'quantity']
                        ],
                        where: {
                            document_id: arr[i]?.document_id, 
                            company_id: arr[i]?.company_id, 
                            line_no: arr[i]?.line_no, 
                            is_posted: false
                        },
                        group: ['no', 'line_no'],
                        raw: true
                    }).catch((err)=>{
                        throw err;
                    });   

                    const temp_qty = Number(Number(temp?.quantity || 0).toFixed(2)).toLocaleString("en-US", option);

                    details += `
                        <div class="col-12 pointer" onclick="onTrackingLines('${arr[i]?.line_no}')">
                            <div class="card shadow rounded-4" style="overflow: hidden;">
                                <div class="card-header">
                                    <div class="d-flex align-items-center">
                                        <div class="col-8">
                                            <strong>${arr[i]?.no}</strong><br>
                                            <small class="fw-semibold">${arr[i]?.description}</small><br>
                                            <small class="fw-semibold">${arr[i]?.description2}</small>
                                        </div>
                                        <div class="col-4 text-end h4 text-primary-emphasis">
                                            <span>${temp_qty}</span>
                                        </div>
                                    </div>
                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>Quantity (${arr[i]?.uom})</small></div>
                                            <div class="col-5 text-secondary fw-bold text-end">${quantity}</div>
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>Quantity to Receive</small></div>
                                            <div class="col-5 text-primary-emphasis fw-bold text-end">${temp_qty}</div>
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>Outstanding Quantity</small></div>
                                            <div class="col-5 text-primary-emphasis fw-bold text-end">${out_standing_qty}</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }

            const dataset = {
                ...header
            };

            return res.render('pages/good-receipt-notes/list', { 
                title: 'Good Receipt Notes',
                header: dataset,
                params: req.params,
                details,
                moment
            });
        } catch (err) {
            console.error(err);
        }
    },
    //region searchItem
    searchItem: async(req, res) => {
        try {
            const { document_id, company_id } = req.params, { no } = req.body;

            let filters = {
                document_id,
                company_id
            };

            let details = ``;

            if(no) {
                filters = {
                    ...filters,
                    no: { [Op.like] : `%${no}%` }
                }
            }
            
            const arr = await wh201GoodReceiptNotesDetail.findAll({
                where: filters,
                raw: true
            }).catch((err)=>{
                throw err;
            });

            if(arr.length > 0) {
                for (let i = 0; i < arr.length; i++) {
                    const quantity = Number(Number(arr[i]?.quantity).toFixed(2)).toLocaleString("en-US", option);
                    const out_standing_qty = Number(Number(arr[i]?.out_standing_qty).toFixed(2)).toLocaleString("en-US", option);

                    const temp = await wh202GoodReceiptNotesTemp.findOne({
                        attributes: [
                            [sequelize.fn('sum', sequelize.col('quantity')), 'quantity']
                        ],
                        where: {
                            document_id: arr[i]?.document_id, 
                            company_id: arr[i]?.company_id, 
                            line_no: arr[i]?.line_no, 
                            is_posted: false
                        },
                        group: ['no', 'line_no'],
                        raw: true
                    }).catch((err)=>{
                        throw err;
                    });   

                    const temp_qty = Number(Number(temp?.quantity || 0).toFixed(2)).toLocaleString("en-US", option);

                    details += `
                        <div class="col-12 pointer" onclick="onTrackingLines('${arr[i]?.line_no}')">
                            <div class="card shadow rounded-4" style="overflow: hidden;">
                                <div class="card-header">
                                    <div class="d-flex align-items-center">
                                        <div class="col-8">
                                            <strong>${arr[i]?.no}</strong><br>
                                            <small class="fw-semibold">${arr[i]?.description}</small><br>
                                            <small class="fw-semibold">${arr[i]?.description2}</small>
                                        </div>
                                        <div class="col-4 text-end h4">
                                            <span>${temp_qty}</span>
                                        </div>
                                    </div>
                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>Quantity (${arr[i]?.uom})</small></div>
                                            <div class="col-5 text-secondary fw-bold text-end">${quantity}</div>
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>Quantity to Receive</small></div>
                                            <div class="col-5 text-primary-emphasis fw-bold text-end">${temp_qty}</div>
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>Outstanding Quantity</small></div>
                                            <div class="col-5 text-primary-emphasis fw-bold text-end">${out_standing_qty}</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }

            return res.status(200).json({ details });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region getTrackingLines
    getTrackingLines: async(req, res) => {
        try {
            const { document_id, company_id, line_no } = req.params;

            const [header, result, sum, arr] = await Promise.all([
                await wh200GoodReceiptNotesHead.findOne({
                    where: {
                        uuid: document_id, 
                        company_id
                    },
                    raw: true
                }),
                await wh201GoodReceiptNotesDetail.findOne({
                    where: {
                        document_id, 
                        company_id, 
                        line_no
                    },
                    raw: true
                }),
                await wh202GoodReceiptNotesTemp.findOne({
                    attributes: [
                        [sequelize.fn('sum', sequelize.col('quantity')), 'quantity']
                    ],
                    where: {
                        document_id, 
                        company_id, 
                        line_no,
                        is_posted: false
                    },
                    group: ['no', 'line_no'],
                    raw: true
                }),
                await wh202GoodReceiptNotesTemp.findAll({
                    where: {
                        document_id, 
                        company_id, 
                        line_no,
                        is_posted: false
                    },
                    raw: true
                })
            ]);

            const txt_qty = Number(Number(result?.quantity || 0).toFixed(2)).toLocaleString("en-US", option);
            const txt_out_standing = Number(Number(result?.out_standing_qty || 0).toFixed(2)).toLocaleString("en-US", option);
            const remaining = Number(result?.out_standing_qty || 0) - Number(sum?.quantity || 0);
            const txt_scan = Number(Number(sum?.quantity || 0).toFixed(2)).toLocaleString("en-US", option);

            let lot_format = ``;

            if(header?.receipt_date && header?.vendor_inv_no) {
                const types = ['LOTALL','LOTEXP']
                if(types.includes(result?.tracking_type)) {
                    lot_format = `${moment(header?.receipt_date).format('YYMMDD')}_${header?.vendor_inv_no}`;
                }
            }

            const dataset = {
                ...result,
                txt_qty,
                txt_out_standing,
                txt_scan,
                scan_quantity: Number(sum?.quantity || 0),
                remaining,
                lot_format
            };

            let details = ``;

            if(arr.length > 0) {
                for (let i = 0; i < arr.length; i++) {
                    const txt_temp_qty = Number(Number(arr[i]?.quantity || 0).toFixed(2)).toLocaleString("en-US", option);

                    let bins = ``;
                    if(arr[i]?.bin_code) {
                        bins += `
                            <li class="list-group-item">
                                <div class="row">
                                    <div class="col-7"><small>Bin Code</small></div>
                                    <div class="col-5 text-primary-emphasis fw-bold text-end">${arr[i]?.bin_code}</div>
                                </div>
                            </li>
                        `;
                    }

                    details += `
                        <div class="col-12 pointer">
                            <div class="card shadow rounded-4" style="overflow: hidden;">
                                <div class="card-header">
                                    <div class="d-flex align-items-center">
                                        <div class="col-8">
                                            <strong>${result?.no}</strong><br>
                                            <small class="fw-semibold">${result?.description}</small><br>
                                            <small class="fw-semibold">${result?.description2}</small>
                                        </div>
                                        <div class="col-4 text-end h4">
                                            <button class="btn bg-danger-subtle rounded-circle" onclick="onDelete(${arr[i]?.rows})">
                                                <i class="fa-solid fa-trash-can text-danger"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>Quantity (${result?.uom})</small></div>
                                            <div class="col-5 text-primary-emphasis fw-bold text-end">${txt_temp_qty}</div>
                                        </div>
                                    </li>
                                    <li class="list-group-item">
                                        <div class="row">
                                            <div class="col-7"><small>LOT No.</small></div>
                                            <div class="col-5 text-primary-emphasis fw-bold text-end">${arr[i]?.lot_no}</div>
                                        </div>
                                    </li>
                                    ${bins}
                                </ul>
                            </div>
                        </div>
                    `;
                }
            }

            return res.render('pages/good-receipt-notes/card', { 
                title: 'Item tracking Lines',
                result: dataset,
                params: req.params,
                details
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region store
    store: async(req, res) => {
        try {
            const { document_id, company_id, line_no } = req.params, { no, lot_no, exp_date } = req.body, { user } = req.session;

            const [result, check] = await Promise.all([
                await wh201GoodReceiptNotesDetail.findOne({
                    where: {
                        document_id, 
                        company_id, 
                        line_no
                    },
                    raw: true
                }),
                await wh202GoodReceiptNotesTemp.findOne({
                    attributes: ['rows'],
                    where: {
                        document_id, 
                        company_id, 
                        line_no,
                        no, 
                        is_posted: false
                    },
                    order: [['rows', 'DESC']],
                    raw: true
                })
            ]);

            if(!result) throw `The order number you are looking for was not found.`;

            const dataset = {
                ...req.body,
                bin_code: null,
                created_by: user,
                updated_by: user,
                is_posted: false,
                line_id: result?.uuid
            };

            if(check) {
                const recheck = await wh202GoodReceiptNotesTemp.findOne({
                    attributes: ['rows'],
                    where: {
                        document_id, 
                        company_id, 
                        line_no,
                        no, 
                        lot_no, 
                        exp_date,
                        is_posted: false,
                        line_id: dataset?.line_id,
                    },
                    raw: true
                }).catch((err)=>{
                    throw err;
                });

                if(recheck) {
                    dataset.rows = Number(recheck?.rows);
                } else {
                    dataset.rows = Number(check?.rows) + Number(String(1).padEnd(5, '0'));
                }
            } else {
                dataset.rows = Number(String(1).padEnd(5, '0'));
            }
    
            console.log(`\r\n ////////// dataset ////////////`);
            console.log(dataset);
            console.log(`\r\n ////////// End dataset ////////////`);

            await wh202GoodReceiptNotesTemp.findOrCreate({
                where: {
                    document_id, 
                    company_id, 
                    line_no,
                    no, 
                    lot_no, 
                    exp_date,
                    is_posted: false,
                    rows: dataset.rows,
                    line_id: dataset?.line_id,
                },
                defaults: dataset
            }).then( async ([ value, created ])=>{
                if(!created) {
                    dataset.quantity = Number(dataset.quantity) + Number(value?.quantity);

                    await wh202GoodReceiptNotesTemp.update(dataset, {
                        where: {
                            document_id, 
                            company_id, 
                            line_no,
                            no, 
                            lot_no, 
                            exp_date,
                            is_posted: false,
                            rows: value.rows,
                            line_id: value.line_id
                        }
                    }).catch((err)=>{
                        throw err;
                    });
                }
            }).catch((err)=>{
                throw err;
            });

            return res.status(200).json({ 
                code: 200, 
                status: 'success', 
                message: 'Data saved successfully'
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region destroy
    destroy: async(req, res) => {
        try {
            await wh202GoodReceiptNotesTemp.destroy({
                where: {
                    ...req.params,
                    is_posted: false
                }
            }).catch((err)=>{
                throw err;
            });

            return res.status(200).json({ 
                code: 200, 
                status: 'success', 
                message: 'The system has successfully deleted your item.'
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region updateHeader
    updateHeader: async(req, res) => {
        try {
            const { document_id, company_id } = req.params;
            
            await wh200GoodReceiptNotesHead.update({
                ...req.body
            }, {
                where: {
                    uuid: document_id,
                    company_id
                }
            }).catch((err)=>{
                throw err;
            });

            return res.status(200).json({ 
                code: 200, 
                status: 'success', 
                message: 'Data saved successfully'
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region download
    download: async(req, res) => {
        try {
            const { document_no, company_id } = req.params, { user } = req.session;

            const { arr, companys } = await getGoodReceipNotes({ document_no, company_id }).catch((err)=>{
                throw err;
            });   

            const dataset = {}, uuid = uuidv4(`${document_no}${companys?.uuid}`), line_id = uuidv4(`${document_no}${companys?.uuid}`);

            const result = arr.map((item) => {
                dataset.document_no = item?.documentNo, //PK
                dataset.document_type = item?.documentType, //PK
                dataset.receipt_date = item?.receiptDate || null,
                dataset.buy_from_vendor_no = item?.buyFromVendorNo,
                dataset.buy_from_vendor_name = item?.buyFromVendorName,
                dataset.last_receiving_no = item?.lastReceivingNo
                dataset.created_by = user;
                dataset.updated_by = user;
                dataset.company_id = companys?.uuid;
                dataset.uuid = uuid;
                dataset.is_posted = false;

                return {
                    document_id: uuid, //PK
                    line_no: item?.lineNo, //PK
                    no: item?.no, //PK
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
                    created_by: user,
                    updated_by: user,
                    company_id: companys?.uuid, //PK
                    uuid: line_id, //PK
                }
            });

            if(result.length > 0) {
                await wh200GoodReceiptNotesHead.findOrCreate({
                    where: {
                        document_no: dataset?.document_no,
                        company_id: dataset?.company_id
                    },
                    defaults: dataset
                }).then( async ([ value, created ])=>{
                    if(created) {
                        await wh201GoodReceiptNotesDetail.bulkCreate(result).catch((err)=>{
                            throw err;
                        });
                    }
                }).catch((err)=>{
                    throw err;
                });

                return res.json(dataset);
            } else {
                throw `The order number you are looking for was not found.`;
            }

        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
        }
    },
    //region posted
    posted: async(req, res) => {
        try {
            const { document_id, company_id } = req.params, { user } = req.session, arrData = [];

            const header = await wh200GoodReceiptNotesHead.findOne({
                attributes: ['document_no','vendor_inv_no','receipt_date'],
                where: {
                    uuid: document_id, 
                    company_id
                },
                raw: true
            }).catch((err)=>{
                throw err;
            });

            const details = await wh201GoodReceiptNotesDetail.findAll({
                attributes: ['no','line_no','description','uom','location_code'],
                where: {
                    document_id, 
                    company_id
                },
                raw: true
            });

            if(details.length > 0) {
                for (let i = 0; i < details.length; i++) {
                    const temps = await wh202GoodReceiptNotesTemp.findAll({
                        attributes: ['line_no','rows','quantity','bin_code','lot_no','exp_date'],
                        where: {
                            document_id, 
                            company_id,
                            no: details[i]?.no,
                            line_no: details[i]?.line_no
                        },
                        raw: true
                    });

                    const result = temps.map((item) => {
                        return {
                            documentNo: header?.document_no,
                            documentLineNo: item?.line_no,
                            rows: `${item?.rows}`,
                            documentType: "Good Receipt",
                            deliveryNo: header?.vendor_inv_no,
                            deliveryDate: header?.receipt_date,
                            externalDocumentNo: header?.document_no,
                            itemNo: details[i]?.no,
                            itemDescription: details[i]?.description,
                            quantity: item?.quantity,
                            netWeight: null,
                            uom: details[i]?.uom,
                            locationCode: details[i]?.location_code,
                            binCode: item?.bin_code,
                            lotNo: item?.lot_no,
                            expirationDate: item?.exp_date,
                            userCreate: user,
                            sessionID: uuidv4(),
                        }
                    });

                    arrData.push(...result);
                }
            }

            const arrSuccess = [];

            if(arrData.length > 0) {
                for (let i = 0; i < arrData.length; i++) {
                    const { status } = await postHandheldEntry({
                        data: arrData[i], 
                        company_id
                    }).catch((err)=>{
                        throw err;
                    });   

                    if (status === 201) {     
                        arrSuccess.push({
                            ...arrData[i],
                            document_id, company_id
                        });
                    }
                }
            }

            // Start Post Transaction
            if(arrSuccess.length > 0) {
                const { status } = await postTransaction({
                    documentNo: header?.document_no,
                    primaryKey: 1, //Good Receipt Notes
                    company_id
                }).catch((err)=>{
                    throw err;
                });  
    
                if(status === 201) {
                    for (let i = 0; i < arrSuccess.length; i++) {
                        await wh202GoodReceiptNotesTemp.update({
                            is_posted: true
                        }, {
                            where: {
                                document_id,
                                company_id,
                                line_no: arrSuccess[i]?.documentLineNo,
                                rows: arrSuccess[i]?.rows,
                                is_posted: false
                            }
                        }).then(async()=>{
                            await wh200GoodReceiptNotesHead.update({
                                vendor_inv_no: null
                            }, {
                                where: {
                                    uuid: document_id,
                                    company_id
                                }
                            }).catch((err)=>{
                                throw err;
                            });  
                        }).catch((err)=>{
                            throw err;
                        });  
                    } 
                }
            }
            // End Post Transaction

            const { arr } = await getGoodReceipNotes({ 
                document_no: header?.document_no, 
                company_id, 
                fetch_data: true 
            }).catch((err)=>{
                throw err;
            });   

            let is_posted = false, line_id = uuidv4(`${document_id}${company_id}`);

            const result = arr.map((item) => {
                return {
                    document_id, //PK
                    line_no: item?.lineNo, //PK
                    no: item?.no, //PK
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
                    created_by: user,
                    updated_by: user,
                    company_id, //PK
                    uuid: line_id //PK
                }
            });

            if(result.length > 0) {
                await wh201GoodReceiptNotesDetail.destroy({
                    where: {
                        document_id,
                        company_id
                    }
                }).catch((err)=>{
                    throw err;
                });

                await wh201GoodReceiptNotesDetail.bulkCreate(result).catch((err)=>{
                    throw err;
                });
            } else {
                is_posted = true;

                await wh200GoodReceiptNotesHead.update({
                    vendor_inv_no: header?.vendor_inv_no,
                    is_posted: true
                }, {
                    where: {
                        uuid: document_id,
                        company_id
                    }
                }).catch((err)=>{
                    throw err;
                });  
            }
            
            return res.status(200).json({ 
                code: 200, 
                status: 'success', 
                message: 'Documents posted successfully',
                backward: is_posted && `/good-receipt-notes`
            });
        } catch (err) {
            console.error(err);
            return res.status(404).json({ 
                code: 404, 
                status: 'error', 
                message: `${err?.response ? err?.response?.statusText : err}`,
            });
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